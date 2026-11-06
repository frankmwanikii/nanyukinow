<?php

namespace App\Support;

use App\Models\PlanUpgrade;
use Illuminate\Support\Facades\Log;

class PaypalFulfillment
{
    /**
     * Capture an approved PayPal order and activate the matching membership.
     *
     * @return array{ok: bool, message: string}
     */
    public static function captureAndActivate(string $orderId): array
    {
        if (! self::validOrderId($orderId)) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        $upgrade = self::findUpgrade($orderId);
        if ($upgrade === null) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        if ($upgrade->status === PlanUpgrade::STATUS_APPROVED) {
            return ['ok' => true, 'message' => 'Payment received. Your plan is now active.'];
        }

        $captured = PaymentGateway::capturePaypalOrder($orderId);
        if ($captured['retry']) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        if (! is_array($captured['order']) || ! self::activateFromOrder($upgrade, $captured['order'], $orderId)) {
            return ['ok' => false, 'message' => PaymentGateway::FAILURE_MESSAGE];
        }

        return ['ok' => true, 'message' => 'Payment received. Your plan is now active.'];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{status: int, body: array<string, mixed>}
     */
    public static function handleWebhook(array $payload): array
    {
        $eventType = $payload['event_type'] ?? null;
        if (! is_string($eventType) || $eventType === '') {
            return self::result(400, ['error' => 'Invalid payload']);
        }

        $orderId = self::orderIdFrom($payload);
        Log::info('PayPal webhook received', [
            'event_type' => $eventType,
            'order_id' => $orderId,
        ]);

        if ($orderId === null || ! self::validOrderId($orderId)) {
            return self::result(200, ['received' => true]);
        }

        $upgrade = self::findUpgrade($orderId);
        if ($upgrade === null || $upgrade->status === PlanUpgrade::STATUS_APPROVED) {
            return self::result(200, ['received' => true]);
        }

        if (in_array($eventType, ['PAYMENT.CAPTURE.DENIED', 'CHECKOUT.ORDER.VOIDED'], true)) {
            self::cancelIncomplete($upgrade);

            return self::result(200, ['received' => true]);
        }

        if ($eventType === 'CHECKOUT.ORDER.APPROVED') {
            $captured = PaymentGateway::capturePaypalOrder($orderId);
            if ($captured['retry']) {
                return self::result(503, ['error' => 'Unable to confirm payment']);
            }

            if (is_array($captured['order'])) {
                self::activateFromOrder($upgrade, $captured['order'], $orderId);
            }

            return self::result(200, ['received' => true]);
        }

        if ($eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
            return self::result(200, ['received' => true]);
        }

        $remote = PaymentGateway::fetchPaypalOrder($orderId);
        if ($remote['retry']) {
            return self::result(503, ['error' => 'Unable to confirm payment']);
        }

        if (is_array($remote['data'])) {
            self::activateFromOrder($upgrade, $remote['data'], $orderId);
        }

        return self::result(200, ['received' => true]);
    }

    /**
     * @param  array<string, mixed>  $order
     */
    private static function activateFromOrder(PlanUpgrade $upgrade, array $order, string $orderId): bool
    {
        if (strtoupper((string) ($order['status'] ?? '')) !== 'COMPLETED') {
            return false;
        }

        $unit = is_array($order['purchase_units'][0] ?? null) ? $order['purchase_units'][0] : [];
        $amount = is_array($unit['amount'] ?? null) ? $unit['amount'] : [];
        [$expectedAmount, $expectedCurrency] = PaymentGateway::paypalChargeAmount(
            (float) $upgrade->amount,
            (string) $upgrade->currency,
        );

        $customId = (string) ($unit['custom_id'] ?? '');
        if (
            $customId !== (string) $upgrade->user_id
            || ($amount['currency_code'] ?? null) !== $expectedCurrency
            || ($amount['value'] ?? null) !== $expectedAmount
        ) {
            Log::warning('PayPal payment was not activated', [
                'order_id' => $orderId,
                'status' => $order['status'] ?? null,
                'amount' => $amount,
                'expected_amount' => $expectedAmount,
                'expected_currency' => $expectedCurrency,
            ]);

            return false;
        }

        $capture = is_array($unit['payments']['captures'][0] ?? null) ? $unit['payments']['captures'][0] : [];
        $captureId = is_string($capture['id'] ?? null) ? $capture['id'] : '';
        $notes = 'paypal:'.$orderId;
        if ($captureId !== '') {
            $notes .= ' capture '.$captureId;
        }

        $activated = PlanUpgradeApproval::approve($upgrade, null, $notes);
        if ($activated && $captureId !== '') {
            $upgrade->refresh();
            $upgrade->update(['payment_reference' => $captureId]);
        }

        return $activated || $upgrade->fresh()?->status === PlanUpgrade::STATUS_APPROVED;
    }

    private static function findUpgrade(string $orderId): ?PlanUpgrade
    {
        return PlanUpgrade::query()
            ->where('payment_method', PaymentMethods::PAYPAL)
            ->where(function ($query) use ($orderId): void {
                $query->where('payment_reference', $orderId)
                    ->orWhere('admin_notes', 'like', 'paypal:'.$orderId.'%');
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
            'admin_notes' => 'PayPal payment was not completed.',
            'reviewed_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private static function orderIdFrom(array $payload): ?string
    {
        $resource = $payload['resource'] ?? null;
        if (! is_array($resource)) {
            return null;
        }

        if (($payload['event_type'] ?? '') === 'CHECKOUT.ORDER.APPROVED' && is_string($resource['id'] ?? null)) {
            return $resource['id'];
        }

        $related = $resource['supplementary_data']['related_ids']['order_id'] ?? null;

        return is_string($related) && $related !== '' ? $related : null;
    }

    private static function validOrderId(string $orderId): bool
    {
        return preg_match('/^[A-Za-z0-9-]{8,40}$/', $orderId) === 1;
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
