<?php

namespace App\Support;

use App\Models\PlanUpgrade;
use Illuminate\Support\Facades\Log;

class PaystackFulfillment
{
    /**
     * Verify a Paystack reference and activate the matching membership.
     *
     * @return array{ok: bool, message: string}
     */
    public static function verifyAndActivate(string $reference): array
    {
        if (! self::validReference($reference)) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        $upgrade = self::findUpgrade($reference);
        if ($upgrade === null) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        if ($upgrade->status === PlanUpgrade::STATUS_APPROVED) {
            return ['ok' => true, 'message' => 'Payment received. Your plan is now active.'];
        }

        $verified = PaymentGateway::verifyPaystackTransaction($reference);
        if ($verified['retry']) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        if (! is_array($verified['data']) || ! self::activateFromTransaction($upgrade, $verified['data'], $reference)) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        return ['ok' => true, 'message' => 'Payment received. Your plan is now active.'];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{status: int, body: array<string, mixed>}
     */
    public static function handleWebhook(array $payload, ?string $signature, string $rawBody): array
    {
        if (! PaymentGateway::paystackSignatureValid($signature, $rawBody)) {
            Log::warning('Paystack webhook signature rejected');

            return self::result(401, ['error' => 'Invalid signature']);
        }

        $event = $payload['event'] ?? null;
        if (! is_string($event) || $event === '') {
            return self::result(400, ['error' => 'Invalid payload']);
        }

        $data = is_array($payload['data'] ?? null) ? $payload['data'] : [];
        $reference = is_string($data['reference'] ?? null) ? $data['reference'] : '';

        Log::info('Paystack webhook received', [
            'event' => $event,
            'reference' => $reference !== '' ? $reference : null,
        ]);

        if ($reference === '' || ! self::validReference($reference)) {
            return self::result(200, ['received' => true]);
        }

        $upgrade = self::findUpgrade($reference);
        if ($upgrade === null || $upgrade->status === PlanUpgrade::STATUS_APPROVED) {
            return self::result(200, ['received' => true]);
        }

        if (in_array($event, ['charge.failed', 'transfer.failed'], true)) {
            self::cancelIncomplete($upgrade);

            return self::result(200, ['received' => true]);
        }

        if ($event !== 'charge.success') {
            return self::result(200, ['received' => true]);
        }

        $verified = PaymentGateway::verifyPaystackTransaction($reference);
        if ($verified['retry']) {
            return self::result(503, ['error' => 'Unable to confirm payment']);
        }

        if (is_array($verified['data'])) {
            self::activateFromTransaction($upgrade, $verified['data'], $reference);
        }

        return self::result(200, ['received' => true]);
    }

    /**
     * @param  array<string, mixed>  $transaction
     */
    private static function activateFromTransaction(PlanUpgrade $upgrade, array $transaction, string $reference): bool
    {
        if (strtolower((string) ($transaction['status'] ?? '')) !== 'success') {
            return false;
        }

        $expectedSubunits = PaymentGateway::paystackAmountSubunits(
            (float) $upgrade->amount,
            (string) $upgrade->currency,
        );
        $paidAmount = (int) ($transaction['amount'] ?? 0);
        $paidCurrency = strtoupper((string) ($transaction['currency'] ?? ''));
        $expectedCurrency = strtoupper((string) $upgrade->currency) ?: 'KES';

        $metadata = is_array($transaction['metadata'] ?? null) ? $transaction['metadata'] : [];
        $metaUserId = (string) ($metadata['user_id'] ?? '');

        if (
            $metaUserId !== (string) $upgrade->user_id
            || $paidCurrency !== $expectedCurrency
            || $paidAmount !== $expectedSubunits
        ) {
            Log::warning('Paystack payment was not activated', [
                'reference' => $reference,
                'status' => $transaction['status'] ?? null,
                'amount' => $paidAmount,
                'currency' => $paidCurrency,
                'expected_amount' => $expectedSubunits,
                'expected_currency' => $expectedCurrency,
            ]);

            return false;
        }

        $notes = 'paystack:'.$reference;
        $activated = PlanUpgradeApproval::approve($upgrade, null, $notes);
        if ($activated) {
            $upgrade->refresh();
            $upgrade->update(['payment_reference' => $reference]);
        }

        return $activated || $upgrade->fresh()?->status === PlanUpgrade::STATUS_APPROVED;
    }

    private static function findUpgrade(string $reference): ?PlanUpgrade
    {
        return PlanUpgrade::query()
            ->where('payment_method', PaymentMethods::PAYSTACK)
            ->where(function ($query) use ($reference): void {
                $query->where('payment_reference', $reference)
                    ->orWhere('admin_notes', 'like', 'paystack:'.$reference.'%');
            })
            ->latest('id')
            ->first();
    }

    private static function cancelIncomplete(PlanUpgrade $upgrade): void
    {
        if ($upgrade->status !== PlanUpgrade::STATUS_PENDING) {
            return;
        }

        $upgrade->update([
            'status' => PlanUpgrade::STATUS_CANCELLED,
            'admin_notes' => 'Paystack payment was not completed.',
            'reviewed_at' => now(),
        ]);
    }

    private static function validReference(string $reference): bool
    {
        return preg_match('/^[A-Za-z0-9._=-]{6,100}$/', $reference) === 1;
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
