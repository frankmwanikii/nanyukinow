<?php

namespace App\Support;

use App\Models\PlanUpgrade;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class PalplussFulfillment
{
    /**
     * Apply a Palpluss callback. Membership is activated only after Palpluss confirms the same transaction succeeded.
     *
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $headers
     * @return array{status: int, body: array<string, mixed>}
     */
    public static function handle(array $payload, array $headers = [], string $rawBody = ''): array
    {
        $flatHeaders = self::flattenHeaders($headers);
        $body = $rawBody !== '' ? $rawBody : (string) json_encode($payload);
        if (! PaymentGateway::palplussWebhookSignatureValid($flatHeaders, $body)) {
            Log::warning('Palpluss webhook signature rejected');

            return self::result(401, ['error' => 'Invalid signature']);
        }

        $eventType = $payload['event_type'] ?? null;
        if ($eventType === 'webhook.test') {
            return self::result(200, ['received' => true]);
        }

        $transaction = $payload['transaction'] ?? null;

        if (! is_string($eventType) || $eventType === '' || ! is_array($transaction)) {
            return self::result(400, ['error' => 'Invalid payload']);
        }

        $transactionId = $transaction['id'] ?? $transaction['transactionId'] ?? null;
        if (! is_string($transactionId) || preg_match('/^[A-Za-z0-9-]{8,80}$/', $transactionId) !== 1) {
            return self::result(400, ['error' => 'Invalid payload']);
        }

        Log::info('Palpluss webhook received', [
            'event_type' => $eventType,
            'transaction_id' => $transactionId,
            'status' => $transaction['status'] ?? null,
        ]);

        $upgrade = self::findUpgrade($transactionId);
        if ($upgrade === null || $upgrade->status === PlanUpgrade::STATUS_APPROVED) {
            return self::result(200, ['received' => true]);
        }

        if ($eventType !== 'transaction.success') {
            self::cancelIncomplete($upgrade, $eventType);

            return self::result(200, ['received' => true]);
        }

        $receipt = $transaction['mpesa_receipt'] ?? null;
        $outcome = self::confirm($upgrade, is_string($receipt) ? $receipt : null);
        if ($outcome === 'retry') {
            return self::result(503, ['error' => 'Unable to confirm payment']);
        }

        return self::result(200, ['received' => true]);
    }

    /**
     * Confirm one Palpluss payment with Palpluss and activate the plan when it succeeded.
     *
     * @return 'approved'|'pending'|'cancelled'|'retry'|'ignored'|'skipped'
     */
    public static function confirm(PlanUpgrade $upgrade, ?string $receipt = null): string
    {
        if ($upgrade->status === PlanUpgrade::STATUS_APPROVED) {
            return 'approved';
        }

        if (! in_array($upgrade->status, [PlanUpgrade::STATUS_PENDING, PlanUpgrade::STATUS_CANCELLED], true)) {
            return 'skipped';
        }

        $transactionId = (string) $upgrade->payment_reference;
        if (! self::isPalplussReference($transactionId)) {
            return 'skipped';
        }

        $remote = PaymentGateway::fetchPalplussTransaction($transactionId);
        if ($remote['retry']) {
            return 'retry';
        }

        $confirmed = $remote['data'];
        if (! is_array($confirmed)) {
            return 'pending';
        }

        $status = strtoupper((string) ($confirmed['status'] ?? ''));
        if (in_array($status, ['', 'PENDING', 'PROCESSING'], true)) {
            return 'pending';
        }

        if ($status !== 'SUCCESS') {
            self::cancelIncomplete($upgrade, 'transaction.'.strtolower($status));

            return $upgrade->fresh()?->status === PlanUpgrade::STATUS_CANCELLED ? 'cancelled' : 'pending';
        }

        $amount = (int) round((float) ($confirmed['amount'] ?? 0));
        if ($amount !== (int) $upgrade->amount) {
            Log::warning('Palpluss payment was not activated', [
                'transaction_id' => $transactionId,
                'status' => $status,
                'amount' => $amount,
                'expected_amount' => (int) $upgrade->amount,
            ]);

            return 'ignored';
        }

        $receipt ??= $confirmed['mpesa_receipt'] ?? $confirmed['mpesaReceipt'] ?? null;
        $notes = 'palpluss:'.$transactionId;
        if (is_string($receipt) && $receipt !== '') {
            $notes .= ' receipt '.$receipt;
        }

        $activated = PlanUpgradeApproval::approve($upgrade, null, $notes);
        if (! $activated) {
            return 'skipped';
        }

        if (is_string($receipt) && $receipt !== '') {
            $upgrade->refresh();
            $upgrade->update(['payment_reference' => $receipt]);
        }

        Log::info('Palpluss payment activated', [
            'upgrade_id' => $upgrade->id,
            'transaction_id' => $transactionId,
        ]);

        return 'approved';
    }

    public static function confirmForUser(User $user): void
    {
        $pending = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->latest('id')
            ->first();

        if ($pending !== null) {
            self::confirm($pending);
        }
    }

    public static function confirmOutstanding(): int
    {
        $confirmed = 0;

        PlanUpgrade::query()
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->where('payment_method', PaymentMethods::MPESA)
            ->where('created_at', '>=', now()->subDays(3))
            ->orderBy('id')
            ->each(function (PlanUpgrade $upgrade) use (&$confirmed): void {
                if (self::confirm($upgrade) === 'approved') {
                    $confirmed++;
                }
            });

        return $confirmed;
    }

    public static function isPalplussReference(?string $reference): bool
    {
        return is_string($reference)
            && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $reference) === 1;
    }

    private static function findUpgrade(string $transactionId): ?PlanUpgrade
    {
        return PlanUpgrade::query()
            ->where(function ($query) use ($transactionId): void {
                $query->where('payment_reference', $transactionId)
                    ->orWhere('admin_notes', 'like', 'palpluss:'.$transactionId.'%');
            })
            ->latest('id')
            ->first();
    }

    private static function cancelIncomplete(PlanUpgrade $upgrade, string $eventType): void
    {
        if ($upgrade->status !== PlanUpgrade::STATUS_PENDING) {
            return;
        }

        if (! in_array($eventType, ['transaction.failed', 'transaction.cancelled', 'transaction.expired', 'transaction.reversed'], true)) {
            return;
        }

        $upgrade->update([
            'status' => PlanUpgrade::STATUS_CANCELLED,
            'admin_notes' => 'Palpluss payment was not completed.',
            'reviewed_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $headers
     * @return array<string, string|null>
     */
    private static function flattenHeaders(array $headers): array
    {
        $flat = [];
        foreach ($headers as $key => $value) {
            if (! is_string($key)) {
                continue;
            }
            $flat[$key] = is_array($value) ? (string) ($value[0] ?? '') : (is_string($value) ? $value : null);
        }

        return $flat;
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{status: int, body: array<string, mixed>}
     */
    private static function result(int $status, array $body): array
    {
        return [
            'status' => $status,
            'body' => $body,
        ];
    }
}
