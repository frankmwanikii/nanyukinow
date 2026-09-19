<?php

namespace App\Support;

/**
 * Payment gateway hooks for plan upgrades.
 *
 * UI already sends a consistent payload via checkout. Plug IntaSend / Daraja / PayPal
 * into these methods and call them from UpgradeController when ready.
 *
 * Expected initiate payload (from frontend paymentPayload()):
 * - to_plan, payment_method, amount, currency, phone?, return_url, cancel_url
 */
class PaymentGateway
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiateMpesa(array $payload): array
    {
        // TODO: IntaSend STK / Safaricom Daraja STK push
        // Use $payload['phone'], $payload['amount'], $payload['currency']
        return [
            'ok' => false,
            'message' => 'M-Pesa API not configured yet. Use manual confirmation for now.',
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiatePaypal(array $payload): array
    {
        // TODO: PayPal Orders API — return checkout_url for redirect
        return [
            'ok' => false,
            'message' => 'PayPal API not configured yet. Use manual confirmation for now.',
        ];
    }
}
