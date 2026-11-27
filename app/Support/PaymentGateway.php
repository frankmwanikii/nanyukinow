<?php

namespace App\Support;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Payment gateway hooks for plan upgrades.
 *
 * Credentials & mode (sandbox / live) live in Admin → Settings → Payment gateways.
 * UI calls POST /account/upgrade/pay.
 *
 * Expected payload:
 * - to_plan, payment_method, amount, currency, phone?, email?, return_url, cancel_url
 *
 * Successful response shape:
 * - ok: true
 * - checkout_url?: string (PayPal redirect)
 * - provider_ref?: string (STK / order id)
 * - message?: string
 */
class PaymentGateway
{
    public const MODE_SANDBOX = 'sandbox';

    public const MODE_LIVE = 'live';

    public const PROVIDER_MPESA = 'mpesa';

    public const PROVIDER_INTASEND = 'intasend';

    public const PROVIDER_PALPLUSS = 'palpluss';

    /** @var string Default PayPal sandbox client id (overridable in admin). */
    public const DEFAULT_PAYPAL_SANDBOX_CLIENT_ID = 'BAArAU7QuOwie6GylyZKkHtHBsUIvyjvKrJX-UPEurvQOic1-upqESJEfsT950Bc4YcpCz7mBdCw1-qO2Y';

    /** @var string Default PayPal sandbox secret (overridable in admin). */
    public const DEFAULT_PAYPAL_SANDBOX_SECRET = 'EOFR-tNNYN4XtEH49K8Ej82xJGNvCnAtRFZMwjMXiZpAH6MgFsS4Mwds_uDQjQJHQv4_rOoRuNfrT35h';

    /** Generic member-facing failure — never expose admin/config details. */
    public const FAILURE_MESSAGE = 'Payment failed. Please try again.';

    /**
     * Member checkout still sends payment_method=mpesa; admin chooses Daraja, IntaSend, or Palpluss.
     *
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiateMpesa(array $payload): array
    {
        return match (self::mobileMoneyProvider()) {
            self::PROVIDER_INTASEND => self::initiateIntasend($payload),
            self::PROVIDER_PALPLUSS => self::initiatePalpluss($payload),
            default => self::initiateDaraja($payload),
        };
    }

    /**
     * @return array{ok: false, message: string}
     */
    private static function fail(string $logMessage, array $context = []): array
    {
        Log::warning($logMessage, $context);

        return [
            'ok' => false,
            'message' => self::FAILURE_MESSAGE,
        ];
    }

    /**
     * Direct Safaricom Daraja STK push.
     *
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiateDaraja(array $payload): array
    {
        $creds = self::mpesaCredentials();

        if ($creds['consumer_key'] === '' || $creds['consumer_secret'] === '' || $creds['shortcode'] === '' || $creds['passkey'] === '') {
            return self::fail('M-Pesa Daraja credentials missing');
        }

        $phone = self::normalizeKenyanPhone((string) ($payload['phone'] ?? ''));
        if ($phone === null) {
            return [
                'ok' => false,
                'message' => 'Enter a valid M-Pesa phone number.',
            ];
        }

        $amount = (int) round((float) ($payload['amount'] ?? 0));
        if ($amount < 1) {
            return [
                'ok' => false,
                'message' => 'Invalid payment amount.',
            ];
        }

        try {
            $token = self::darajaAccessToken($creds);
            if ($token === null) {
                return self::fail('Daraja OAuth failed');
            }

            $timestamp = now()->format('YmdHis');
            $password = base64_encode($creds['shortcode'].$creds['passkey'].$timestamp);
            $callback = SiteSetting::getValue(
                'mpesa_callback_url',
                url('/webhooks/mpesa/stk'),
            );

            $response = Http::withToken($token)
                ->acceptJson()
                ->timeout(30)
                ->post(self::darajaBaseUrl($creds['mode']).'/mpesa/stkpush/v1/processrequest', [
                    'BusinessShortCode' => $creds['shortcode'],
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'TransactionType' => 'CustomerPayBillOnline',
                    'Amount' => $amount,
                    'PartyA' => $phone,
                    'PartyB' => $creds['shortcode'],
                    'PhoneNumber' => $phone,
                    'CallBackURL' => $callback,
                    'AccountReference' => SiteSetting::getValue('upgrade_mpesa_account', '451220') ?: 'NANYUKINOW',
                    'TransactionDesc' => 'Nanyuki Now '.($payload['to_plan'] ?? 'upgrade'),
                ]);

            if (! $response->successful()) {
                return self::fail('M-Pesa STK failed', [
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                ]);
            }

            $body = $response->json() ?? [];
            if (($body['ResponseCode'] ?? '') !== '0') {
                return self::fail('M-Pesa STK rejected', [
                    'body' => $body,
                ]);
            }

            return [
                'ok' => true,
                'provider_ref' => $body['CheckoutRequestID'] ?? $body['MerchantRequestID'] ?? null,
                'message' => $body['CustomerMessage'] ?? 'Check your phone to complete M-Pesa payment.',
            ];
        } catch (Throwable $e) {
            Log::error('M-Pesa initiate error', ['error' => $e->getMessage()]);

            return [
                'ok' => false,
                'message' => self::FAILURE_MESSAGE,
            ];
        }
    }

    /**
     * IntaSend M-Pesa STK push (same member UI; admin selects this provider).
     *
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiateIntasend(array $payload): array
    {
        $creds = self::intasendCredentials();

        if ($creds['secret_key'] === '') {
            return self::fail('IntaSend secret key missing');
        }

        $phone = self::normalizeKenyanPhone((string) ($payload['phone'] ?? ''));
        if ($phone === null) {
            return [
                'ok' => false,
                'message' => 'Enter a valid M-Pesa phone number.',
            ];
        }

        $amount = (int) round((float) ($payload['amount'] ?? 0));
        if ($amount < 1) {
            return [
                'ok' => false,
                'message' => 'Invalid payment amount.',
            ];
        }

        $apiRef = sprintf(
            'nn-%s-%s-%s',
            $payload['user_id'] ?? '0',
            $payload['to_plan'] ?? 'upgrade',
            now()->format('YmdHis'),
        );

        try {
            $body = array_filter([
                'amount' => $amount,
                'phone_number' => $phone,
                'currency' => strtoupper((string) ($payload['currency'] ?? 'KES')),
                'api_ref' => $apiRef,
                'email' => $payload['email'] ?? null,
                'narrative' => 'Nanyuki Now '.($payload['to_plan'] ?? 'upgrade'),
                'host' => url('/'),
            ], fn ($value) => $value !== null && $value !== '');

            if ($creds['public_key'] !== '') {
                $body['public_key'] = $creds['public_key'];
            }

            $response = Http::withToken($creds['secret_key'])
                ->acceptJson()
                ->asJson()
                ->timeout(30)
                ->post(self::intasendBaseUrl($creds['mode']).'/api/v1/payment/mpesa-stk-push/', $body);

            if (! $response->successful()) {
                return self::fail('IntaSend STK failed', [
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                ]);
            }

            $json = $response->json() ?? [];
            $invoice = is_array($json['invoice'] ?? null) ? $json['invoice'] : [];
            $providerRef = $invoice['invoice_id']
                ?? $invoice['id']
                ?? $json['invoice_id']
                ?? $json['id']
                ?? $apiRef;

            return [
                'ok' => true,
                'provider_ref' => is_string($providerRef) || is_numeric($providerRef)
                    ? (string) $providerRef
                    : $apiRef,
                'message' => 'Check your phone to complete M-Pesa payment.',
            ];
        } catch (Throwable $e) {
            Log::error('IntaSend initiate error', ['error' => $e->getMessage()]);

            return [
                'ok' => false,
                'message' => self::FAILURE_MESSAGE,
            ];
        }
    }

    /**
     * Palpluss M-Pesa STK push (same member UI; admin selects this provider).
     *
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiatePalpluss(array $payload): array
    {
        $creds = self::palplussCredentials();

        if ($creds['api_key'] === '') {
            return self::fail('Palpluss API key missing');
        }

        $phone = self::normalizeKenyanPhone((string) ($payload['phone'] ?? ''));
        if ($phone === null) {
            return [
                'ok' => false,
                'message' => 'Enter a valid M-Pesa phone number.',
            ];
        }

        $amount = (int) round((float) ($payload['amount'] ?? 0));
        if ($amount < 1) {
            return [
                'ok' => false,
                'message' => 'Invalid payment amount.',
            ];
        }

        $callback = trim((string) SiteSetting::getValue('palpluss_callback_url', ''));
        if ($callback === '') {
            $callback = url('/webhooks/palpluss');
        }

        $body = [
            'amount' => $amount,
            'phone' => $phone,
            'accountReference' => self::palplussAccountReference(),
            'transactionDesc' => 'Nanyuki Now',
            'callbackUrl' => $callback,
        ];

        if ($creds['channel_id'] !== '') {
            $body['channelId'] = $creds['channel_id'];
        }

        try {
            $response = Http::withBasicAuth($creds['api_key'], '')
                ->acceptJson()
                ->asJson()
                ->timeout(30)
                ->post(self::palplussBaseUrl($creds['mode']).'/payments/stk', $body);

            $json = $response->json() ?? [];
            $data = is_array($json['data'] ?? null) ? $json['data'] : [];

            if (! $response->successful() || ($json['success'] ?? false) !== true) {
                return self::fail('Palpluss STK failed', [
                    'status' => $response->status(),
                    'body' => $json !== [] ? $json : $response->body(),
                ]);
            }

            $transactionId = $data['transactionId'] ?? null;
            if (! is_string($transactionId) || $transactionId === '') {
                return self::fail('Palpluss STK response missing transaction id', [
                    'body' => $json,
                ]);
            }

            return [
                'ok' => true,
                'provider_ref' => $transactionId,
                'message' => 'Check your phone and approve the M-Pesa prompt. Your plan activates as soon as the payment succeeds.',
            ];
        } catch (Throwable $e) {
            Log::error('Palpluss initiate error', ['error' => $e->getMessage()]);

            return [
                'ok' => false,
                'message' => self::FAILURE_MESSAGE,
            ];
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiatePaypal(array $payload): array
    {
        $creds = self::paypalCredentials();

        if ($creds['client_id'] === '' || $creds['secret'] === '') {
            return self::fail('PayPal credentials missing');
        }

        $amount = (float) ($payload['amount'] ?? 0);
        if ($amount <= 0) {
            return [
                'ok' => false,
                'message' => 'Invalid payment amount.',
            ];
        }

        [$chargeAmount, $currency] = self::paypalChargeAmount(
            $amount,
            (string) ($payload['currency'] ?? 'KES'),
        );

        $returnUrl = route('account.upgrade.paypal.return');
        $cancelUrl = route('account.upgrade');

        try {
            $token = self::paypalAccessToken($creds);
            if ($token === null) {
                return self::fail('PayPal OAuth failed');
            }

            $orderPayload = [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => substr((string) ($payload['to_plan'] ?? 'upgrade'), 0, 64),
                    'description' => 'Nanyuki Now membership — '.($payload['to_plan'] ?? 'upgrade'),
                    'custom_id' => (string) ($payload['user_id'] ?? ''),
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => $chargeAmount,
                    ],
                ]],
                'application_context' => [
                    'brand_name' => (string) SiteSetting::getValue('site_name', 'Nanyuki Now'),
                    // BILLING nudges guest debit/credit card; LOGIN is PayPal wallet sign-in.
                    'landing_page' => (($payload['paypal_mode'] ?? 'wallet') === 'card')
                        ? 'BILLING'
                        : 'LOGIN',
                    'user_action' => 'PAY_NOW',
                    'shipping_preference' => 'NO_SHIPPING',
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl,
                ],
            ];

            $payerEmail = trim((string) ($payload['email'] ?? ''));
            if ($payerEmail !== '' && filter_var($payerEmail, FILTER_VALIDATE_EMAIL)) {
                $orderPayload['payer'] = ['email_address' => $payerEmail];
            }

            $response = Http::withToken($token)
                ->acceptJson()
                ->timeout(30)
                ->post(self::paypalBaseUrl($creds['mode']).'/v2/checkout/orders', $orderPayload);

            if (! $response->successful()) {
                return self::fail('PayPal order create failed', [
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                    'charge' => ['amount' => $chargeAmount, 'currency' => $currency],
                ]);
            }

            $body = $response->json() ?? [];
            $approve = collect($body['links'] ?? [])
                ->first(fn ($link) => is_array($link) && in_array($link['rel'] ?? '', ['approve', 'payer-action'], true));

            $checkoutUrl = is_array($approve) ? ($approve['href'] ?? null) : null;
            if (! $checkoutUrl) {
                return self::fail('PayPal response missing approve link', [
                    'body' => $body,
                ]);
            }

            return [
                'ok' => true,
                'provider_ref' => $body['id'] ?? null,
                'checkout_url' => $checkoutUrl,
            ];
        } catch (Throwable $e) {
            Log::error('PayPal initiate error', ['error' => $e->getMessage()]);

            return [
                'ok' => false,
                'message' => self::FAILURE_MESSAGE,
            ];
        }
    }

    /**
     * Capture an approved PayPal order. A second capture of the same order returns the completed order.
     *
     * @return array{retry: bool, order: array<string, mixed>|null}
     */
    public static function capturePaypalOrder(string $orderId): array
    {
        $creds = self::paypalCredentials();
        if ($creds['client_id'] === '' || $creds['secret'] === '' || $orderId === '') {
            return ['retry' => true, 'order' => null];
        }

        try {
            $token = self::paypalAccessToken($creds);
        } catch (Throwable $e) {
            Log::warning('PayPal capture failed', ['error' => $e->getMessage()]);

            return ['retry' => true, 'order' => null];
        }

        if ($token === null) {
            return ['retry' => true, 'order' => null];
        }

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->withBody('{}', 'application/json')
                ->timeout(30)
                ->post(self::paypalBaseUrl($creds['mode']).'/v2/checkout/orders/'.$orderId.'/capture');
        } catch (Throwable $e) {
            Log::warning('PayPal capture failed', ['error' => $e->getMessage()]);

            return ['retry' => true, 'order' => null];
        }

        $body = $response->json() ?? [];
        $issue = is_array($body['details'][0] ?? null) ? (string) ($body['details'][0]['issue'] ?? '') : '';
        if ($response->status() === 422 && $issue === 'ORDER_ALREADY_CAPTURED') {
            $fetched = self::fetchPaypalOrder($orderId);

            return ['retry' => $fetched['retry'], 'order' => $fetched['data']];
        }

        if ($response->serverError() || $response->status() === 429) {
            return ['retry' => true, 'order' => null];
        }

        if (! $response->successful() || ! is_array($body) || $body === []) {
            Log::warning('PayPal capture rejected', [
                'status' => $response->status(),
                'body' => $body !== [] ? $body : $response->body(),
            ]);

            return ['retry' => false, 'order' => null];
        }

        return ['retry' => false, 'order' => $body];
    }

    /**
     * @return array{retry: bool, data: array<string, mixed>|null}
     */
    public static function fetchPaypalOrder(string $orderId): array
    {
        $creds = self::paypalCredentials();
        if ($creds['client_id'] === '' || $creds['secret'] === '' || $orderId === '') {
            return ['retry' => true, 'data' => null];
        }

        try {
            $token = self::paypalAccessToken($creds);
        } catch (Throwable $e) {
            Log::warning('PayPal order lookup failed', ['error' => $e->getMessage()]);

            return ['retry' => true, 'data' => null];
        }

        if ($token === null) {
            return ['retry' => true, 'data' => null];
        }

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(15)
                ->get(self::paypalBaseUrl($creds['mode']).'/v2/checkout/orders/'.$orderId);
        } catch (Throwable $e) {
            Log::warning('PayPal order lookup failed', ['error' => $e->getMessage()]);

            return ['retry' => true, 'data' => null];
        }

        if ($response->serverError() || $response->status() === 429) {
            return ['retry' => true, 'data' => null];
        }

        $data = $response->json();
        if (! $response->successful() || ! is_array($data)) {
            return ['retry' => false, 'data' => null];
        }

        return ['retry' => false, 'data' => $data];
    }

    /**
     * PayPal merchant accounts often reject KES — convert to the configured checkout currency.
     *
     * @return array{0: string, 1: string} [amount, currency]
     */
    public static function paypalChargeAmount(float $amount, string $fromCurrency): array
    {
        $from = strtoupper(trim($fromCurrency)) ?: 'KES';
        $checkout = strtoupper(trim((string) SiteSetting::getValue('paypal_checkout_currency', 'USD'))) ?: 'USD';

        if ($from === $checkout) {
            return [number_format($amount, 2, '.', ''), $checkout];
        }

        if ($from === 'KES' && $checkout === 'USD') {
            $rate = (float) SiteSetting::getValue('paypal_kes_per_usd', '130');
            if ($rate <= 0) {
                $rate = 130.0;
            }
            $converted = max(round($amount / $rate, 2), 0.01);

            return [number_format($converted, 2, '.', ''), 'USD'];
        }

        // Unknown pair: send numeric amount in checkout currency (admin should align plan currency).
        return [number_format(max($amount, 0.01), 2, '.', ''), $checkout];
    }

    /**
     * @return array{mode: string, client_id: string, secret: string, webhook_id: string}
     */
    public static function paypalCredentials(): array
    {
        $mode = self::normalizeMode(SiteSetting::getValue('paypal_mode', self::MODE_SANDBOX));

        if ($mode === self::MODE_LIVE) {
            return [
                'mode' => self::MODE_LIVE,
                'client_id' => trim((string) SiteSetting::getValue('paypal_live_client_id', '')),
                'secret' => trim((string) SiteSetting::getValue('paypal_live_secret', '')),
                'webhook_id' => trim((string) SiteSetting::getValue('paypal_live_webhook_id', '')),
            ];
        }

        return [
            'mode' => self::MODE_SANDBOX,
            'client_id' => trim((string) SiteSetting::getValue(
                'paypal_sandbox_client_id',
                self::DEFAULT_PAYPAL_SANDBOX_CLIENT_ID,
            )),
            'secret' => trim((string) SiteSetting::getValue(
                'paypal_sandbox_secret',
                self::DEFAULT_PAYPAL_SANDBOX_SECRET,
            )),
            'webhook_id' => trim((string) SiteSetting::getValue('paypal_sandbox_webhook_id', '')),
        ];
    }

    /**
     * Verify PayPal webhook authenticity via /v1/notifications/verify-webhook-signature.
     *
     * @param  array<string, string|null>  $headers
     */
    public static function paypalWebhookSignatureValid(array $headers, string $rawBody): bool
    {
        $creds = self::paypalCredentials();
        if ($creds['client_id'] === '' || $creds['secret'] === '' || $creds['webhook_id'] === '') {
            return false;
        }

        $authAlgo = trim((string) ($headers['PAYPAL-AUTH-ALGO'] ?? $headers['paypal-auth-algo'] ?? ''));
        $certUrl = trim((string) ($headers['PAYPAL-CERT-URL'] ?? $headers['paypal-cert-url'] ?? ''));
        $transmissionId = trim((string) ($headers['PAYPAL-TRANSMISSION-ID'] ?? $headers['paypal-transmission-id'] ?? ''));
        $transmissionSig = trim((string) ($headers['PAYPAL-TRANSMISSION-SIG'] ?? $headers['paypal-transmission-sig'] ?? ''));
        $transmissionTime = trim((string) ($headers['PAYPAL-TRANSMISSION-TIME'] ?? $headers['paypal-transmission-time'] ?? ''));

        if ($authAlgo === '' || $certUrl === '' || $transmissionId === '' || $transmissionSig === '' || $transmissionTime === '') {
            return false;
        }

        if (! str_starts_with($certUrl, 'https://api.') && ! str_starts_with($certUrl, 'https://api-m.')) {
            return false;
        }

        $event = json_decode($rawBody, true);
        if (! is_array($event)) {
            return false;
        }

        try {
            $token = self::paypalAccessToken($creds);
            if ($token === null) {
                return false;
            }

            $response = Http::withToken($token)
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(20)
                ->post(self::paypalBaseUrl($creds['mode']).'/v1/notifications/verify-webhook-signature', [
                    'auth_algo' => $authAlgo,
                    'cert_url' => $certUrl,
                    'transmission_id' => $transmissionId,
                    'transmission_sig' => $transmissionSig,
                    'transmission_time' => $transmissionTime,
                    'webhook_id' => $creds['webhook_id'],
                    'webhook_event' => $event,
                ]);
        } catch (Throwable $e) {
            Log::warning('PayPal webhook signature verify failed', ['error' => $e->getMessage()]);

            return false;
        }

        $status = strtoupper((string) ($response->json('verification_status') ?? ''));

        return $response->successful() && $status === 'SUCCESS';
    }

    /**
     * Palpluss Standard Webhooks HMAC (webhook-id / timestamp / signature).
     *
     * @param  array<string, string|null>  $headers
     */
    public static function palplussWebhookSignatureValid(array $headers, string $rawBody): bool
    {
        $secret = trim((string) SiteSetting::getValue('palpluss_webhook_secret', ''));
        if ($secret === '' || $rawBody === '') {
            return false;
        }

        $id = trim((string) ($headers['webhook-id'] ?? $headers['Webhook-Id'] ?? ''));
        $timestamp = trim((string) ($headers['webhook-timestamp'] ?? $headers['Webhook-Timestamp'] ?? ''));
        $signatures = trim((string) ($headers['webhook-signature'] ?? $headers['Webhook-Signature'] ?? ''));

        if ($id === '' || $timestamp === '' || $signatures === '' || ! ctype_digit($timestamp)) {
            return false;
        }

        if (abs(time() - (int) $timestamp) > 300) {
            return false;
        }

        $keyMaterial = preg_replace('/^whsec_/', '', $secret) ?? $secret;
        $key = base64_decode($keyMaterial, true);
        if ($key === false || $key === '') {
            return false;
        }

        $expected = base64_encode(hash_hmac('sha256', $id.'.'.$timestamp.'.'.$rawBody, $key, true));

        foreach (explode(' ', $signatures) as $part) {
            [$version, $signature] = array_pad(explode(',', $part, 2), 2, '');
            if ($version === 'v1' && is_string($signature) && $signature !== '' && hash_equals($expected, $signature)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Paystack checkout: card (on-site Popup access_code) or M-Pesa STK charge.
     *
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, access_code?: string, checkout_url?: string, message?: string}
     */
    public static function initiatePaystack(array $payload): array
    {
        $creds = self::paystackCredentials();

        if ($creds['secret'] === '') {
            return self::fail('Paystack credentials missing');
        }

        $amount = (float) ($payload['amount'] ?? 0);
        if ($amount <= 0) {
            return [
                'ok' => false,
                'message' => 'Invalid payment amount.',
            ];
        }

        $email = trim((string) ($payload['email'] ?? ''));
        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'ok' => false,
                'message' => 'Enter a valid email address for Paystack.',
            ];
        }

        $mode = strtolower(trim((string) ($payload['paystack_mode'] ?? 'mpesa')));
        if ($mode === 'card') {
            return self::initiatePaystackCard($payload, $creds, $amount, $email);
        }

        return self::initiatePaystackMpesa($payload, $creds, $amount, $email);
    }

    /**
     * Initialize Paystack card for on-site Popup (access_code). No hosted redirect.
     *
     * @param  array<string, mixed>  $payload
     * @param  array{mode: string, public_key: string, secret: string}  $creds
     * @return array{ok: bool, provider_ref?: string, access_code?: string, checkout_url?: string, message?: string}
     */
    private static function initiatePaystackCard(array $payload, array $creds, float $amount, string $email): array
    {
        $currency = strtoupper(trim((string) ($payload['currency'] ?? 'KES'))) ?: 'KES';
        $reference = self::paystackReference((int) ($payload['user_id'] ?? 0));
        $body = [
            'email' => $email,
            'amount' => self::paystackAmountSubunits($amount, $currency),
            'currency' => $currency,
            'reference' => $reference,
            // Fallback if 3DS forces a browser redirect.
            'callback_url' => route('account.upgrade.paystack.return'),
            'channels' => ['card'],
            'metadata' => [
                'user_id' => (string) ($payload['user_id'] ?? ''),
                'to_plan' => (string) ($payload['to_plan'] ?? ''),
                'paystack_mode' => 'card',
            ],
        ];

        try {
            $response = Http::withToken($creds['secret'])
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(30)
                ->post('https://api.paystack.co/transaction/initialize', $body);

            $json = $response->json() ?? [];
            $data = is_array($json['data'] ?? null) ? $json['data'] : [];
            $accessCode = is_string($data['access_code'] ?? null) ? $data['access_code'] : null;
            $ref = is_string($data['reference'] ?? null) && $data['reference'] !== ''
                ? $data['reference']
                : $reference;

            if (! $response->successful() || ! ($json['status'] ?? false) || ! $accessCode) {
                $apiMessage = is_string($json['message'] ?? null) ? $json['message'] : '';
                if (stripos($apiMessage, 'No active channel') !== false) {
                    Log::warning('Paystack card channel unavailable', [
                        'status' => $response->status(),
                        'body' => $json,
                    ]);

                    return [
                        'ok' => false,
                        'message' => 'Card is not enabled on your Paystack account yet. Enable Card payments in Paystack (or ask Paystack support for Kenya), then try again. M-Pesa still works.',
                    ];
                }

                return self::fail('Paystack card initialize failed', [
                    'status' => $response->status(),
                    'body' => $json !== [] ? $json : $response->body(),
                ]);
            }

            return [
                'ok' => true,
                'provider_ref' => $ref,
                'access_code' => $accessCode,
            ];
        } catch (Throwable $e) {
            Log::error('Paystack card initiate error', ['error' => $e->getMessage()]);

            return [
                'ok' => false,
                'message' => self::FAILURE_MESSAGE,
            ];
        }
    }

    /**
     * Charge Paystack M-Pesa on-site (STK push). No hosted redirect.
     *
     * @param  array<string, mixed>  $payload
     * @param  array{mode: string, public_key: string, secret: string}  $creds
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    private static function initiatePaystackMpesa(array $payload, array $creds, float $amount, string $email): array
    {
        $currency = strtoupper(trim((string) ($payload['currency'] ?? 'KES'))) ?: 'KES';
        if ($currency !== 'KES') {
            return [
                'ok' => false,
                'message' => 'Paystack mobile money supports KES only.',
            ];
        }

        $phone = self::normalizeKenyanPhone((string) ($payload['phone'] ?? ''));
        if ($phone === null) {
            return [
                'ok' => false,
                'message' => 'Enter a valid phone number for Paystack M-Pesa.',
            ];
        }

        $reference = self::paystackReference((int) ($payload['user_id'] ?? 0));
        $body = [
            'email' => $email,
            'amount' => self::paystackAmountSubunits($amount, $currency),
            'currency' => $currency,
            'reference' => $reference,
            'mobile_money' => [
                'phone' => '+'.$phone,
                'provider' => 'mpesa',
            ],
            'metadata' => [
                'user_id' => (string) ($payload['user_id'] ?? ''),
                'to_plan' => (string) ($payload['to_plan'] ?? ''),
                'paystack_mode' => 'mpesa',
            ],
        ];

        try {
            $response = Http::withToken($creds['secret'])
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(30)
                ->post('https://api.paystack.co/charge', $body);

            $json = $response->json() ?? [];
            $data = is_array($json['data'] ?? null) ? $json['data'] : [];
            $ref = is_string($data['reference'] ?? null) && $data['reference'] !== ''
                ? $data['reference']
                : $reference;
            $status = strtolower((string) ($data['status'] ?? ''));

            if (! $response->successful() || ! ($json['status'] ?? false)) {
                return self::fail('Paystack charge failed', [
                    'status' => $response->status(),
                    'body' => $json !== [] ? $json : $response->body(),
                ]);
            }

            // pay_offline = STK sent; success = instant complete (rare).
            if (! in_array($status, ['pay_offline', 'success', 'pending'], true)) {
                return self::fail('Paystack charge rejected', [
                    'status' => $status,
                    'body' => $json,
                ]);
            }

            $display = trim((string) ($data['display_text'] ?? ''));

            return [
                'ok' => true,
                'provider_ref' => $ref,
                'message' => $display !== ''
                    ? $display
                    : 'Check your phone and enter your M-Pesa PIN to complete payment.',
            ];
        } catch (Throwable $e) {
            Log::error('Paystack initiate error', ['error' => $e->getMessage()]);

            return [
                'ok' => false,
                'message' => self::FAILURE_MESSAGE,
            ];
        }
    }

    /**
     * @return array{retry: bool, data: array<string, mixed>|null}
     */
    public static function verifyPaystackTransaction(string $reference): array
    {
        $creds = self::paystackCredentials();
        if ($creds['secret'] === '' || $reference === '') {
            return ['retry' => true, 'data' => null];
        }

        try {
            $response = Http::withToken($creds['secret'])
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(15)
                ->get('https://api.paystack.co/transaction/verify/'.rawurlencode($reference));
        } catch (Throwable $e) {
            Log::warning('Paystack verify failed', ['error' => $e->getMessage()]);

            return ['retry' => true, 'data' => null];
        }

        if ($response->serverError() || $response->status() === 429) {
            return ['retry' => true, 'data' => null];
        }

        $json = $response->json();
        $data = is_array($json) && is_array($json['data'] ?? null) ? $json['data'] : null;
        if (! $response->successful() || ! ($json['status'] ?? false) || $data === null) {
            return ['retry' => false, 'data' => null];
        }

        return ['retry' => false, 'data' => $data];
    }

    public static function paystackAmountSubunits(float $amount, string $currency = 'KES'): int
    {
        // Paystack expects the smallest currency unit (kobo / cents).
        return (int) max(round($amount * 100), 1);
    }

    /**
     * Validate classic x-paystack-signature (HMAC SHA512 of raw body with secret key).
     */
    public static function paystackSignatureValid(?string $signature, string $rawBody): bool
    {
        if (! is_string($signature) || $signature === '' || $rawBody === '') {
            return false;
        }

        $creds = self::paystackCredentials();
        if ($creds['secret'] === '') {
            return false;
        }

        $expected = hash_hmac('sha512', $rawBody, $creds['secret']);

        return hash_equals($expected, $signature);
    }

    /**
     * @return array{mode: string, public_key: string, secret: string}
     */
    public static function paystackCredentials(): array
    {
        $mode = self::normalizeMode(SiteSetting::getValue('paystack_mode', self::MODE_LIVE));
        $prefix = $mode === self::MODE_LIVE ? 'paystack_live_' : 'paystack_sandbox_';

        return [
            'mode' => $mode,
            'public_key' => trim((string) SiteSetting::getValue($prefix.'public_key', '')),
            'secret' => trim((string) SiteSetting::getValue($prefix.'secret_key', '')),
        ];
    }

    /**
     * @return list<string>
     */
    public static function paystackChannels(): array
    {
        $raw = trim((string) SiteSetting::getValue('paystack_channels', ''));
        if ($raw === '') {
            return [];
        }

        $allowed = [
            'card',
            'bank',
            'apple_pay',
            'ussd',
            'qr',
            'mobile_money',
            'bank_transfer',
            'eft',
            'capitec_pay',
            'payattitude',
        ];

        $channels = array_values(array_filter(array_map(
            static fn (string $channel): string => strtolower(trim($channel)),
            explode(',', $raw),
        )));

        return array_values(array_intersect($channels, $allowed));
    }

    private static function paystackReference(int $userId): string
    {
        $suffix = bin2hex(random_bytes(6));

        return 'nnup_'.($userId > 0 ? $userId.'_' : '').$suffix;
    }

    /**
     * @return array{mode: string, consumer_key: string, consumer_secret: string, shortcode: string, passkey: string}
     */
    public static function mpesaCredentials(): array
    {
        $mode = self::normalizeMode(SiteSetting::getValue('mpesa_mode', self::MODE_SANDBOX));
        $prefix = $mode === self::MODE_LIVE ? 'mpesa_live_' : 'mpesa_sandbox_';

        return [
            'mode' => $mode,
            'consumer_key' => trim((string) SiteSetting::getValue($prefix.'consumer_key', '')),
            'consumer_secret' => trim((string) SiteSetting::getValue($prefix.'consumer_secret', '')),
            'shortcode' => trim((string) SiteSetting::getValue($prefix.'shortcode', '')),
            'passkey' => trim((string) SiteSetting::getValue($prefix.'passkey', '')),
        ];
    }

    /**
     * @return array{mode: string, public_key: string, secret_key: string}
     */
    public static function intasendCredentials(): array
    {
        $mode = self::normalizeMode(SiteSetting::getValue('intasend_mode', self::MODE_SANDBOX));
        $prefix = $mode === self::MODE_LIVE ? 'intasend_live_' : 'intasend_sandbox_';

        return [
            'mode' => $mode,
            'public_key' => trim((string) SiteSetting::getValue($prefix.'public_key', '')),
            'secret_key' => trim((string) SiteSetting::getValue($prefix.'secret_key', '')),
        ];
    }

    /**
     * Confirm a transaction with Palpluss before activating a membership.
     *
     * @return array{retry: bool, data: array<string, mixed>|null}
     */
    public static function fetchPalplussTransaction(string $transactionId): array
    {
        $creds = self::palplussCredentials();

        if ($creds['api_key'] === '' || $transactionId === '') {
            return ['retry' => true, 'data' => null];
        }

        try {
            $response = Http::withBasicAuth($creds['api_key'], '')
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(15)
                ->get(self::palplussBaseUrl($creds['mode']).'/transactions/'.$transactionId);
        } catch (Throwable $e) {
            Log::warning('Palpluss transaction lookup failed', ['error' => $e->getMessage()]);

            return ['retry' => true, 'data' => null];
        }

        if ($response->serverError() || $response->status() === 429) {
            Log::warning('Palpluss transaction lookup was not ready', [
                'status' => $response->status(),
                'transaction_id' => $transactionId,
            ]);

            return ['retry' => true, 'data' => null];
        }

        $data = $response->json('data');
        if (! $response->successful() || ! is_array($data)) {
            return ['retry' => false, 'data' => null];
        }

        return ['retry' => false, 'data' => $data];
    }

    /**
     * @return array{mode: string, api_key: string, channel_id: string}
     */
    public static function palplussCredentials(): array
    {
        $mode = self::normalizeMode(SiteSetting::getValue('palpluss_mode', self::MODE_SANDBOX));
        $prefix = $mode === self::MODE_LIVE ? 'palpluss_live_' : 'palpluss_sandbox_';

        return [
            'mode' => $mode,
            'api_key' => trim((string) SiteSetting::getValue($prefix.'api_key', '')),
            'channel_id' => trim((string) SiteSetting::getValue($prefix.'channel_id', '')),
        ];
    }

    public static function mobileMoneyProvider(): string
    {
        $provider = strtolower(trim((string) SiteSetting::getValue(
            'mobile_money_provider',
            self::PROVIDER_MPESA,
        )));

        return match ($provider) {
            self::PROVIDER_INTASEND => self::PROVIDER_INTASEND,
            self::PROVIDER_PALPLUSS => self::PROVIDER_PALPLUSS,
            default => self::PROVIDER_MPESA,
        };
    }

    public static function normalizeMode(mixed $mode): string
    {
        return strtolower((string) $mode) === self::MODE_LIVE
            ? self::MODE_LIVE
            : self::MODE_SANDBOX;
    }

    /**
     * @param  array{mode: string, client_id: string, secret: string}  $creds
     */
    private static function paypalAccessToken(array $creds): ?string
    {
        $response = Http::asForm()
            ->withBasicAuth($creds['client_id'], $creds['secret'])
            ->acceptJson()
            ->timeout(20)
            ->post(self::paypalBaseUrl($creds['mode']).'/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (! $response->successful()) {
            Log::warning('PayPal OAuth failed', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            return null;
        }

        $token = $response->json('access_token');

        return is_string($token) && $token !== '' ? $token : null;
    }

    /**
     * @param  array{mode: string, consumer_key: string, consumer_secret: string, shortcode: string, passkey: string}  $creds
     */
    private static function darajaAccessToken(array $creds): ?string
    {
        $response = Http::withBasicAuth($creds['consumer_key'], $creds['consumer_secret'])
            ->acceptJson()
            ->timeout(20)
            ->get(self::darajaBaseUrl($creds['mode']).'/oauth/v1/generate', [
                'grant_type' => 'client_credentials',
            ]);

        if (! $response->successful()) {
            Log::warning('Daraja OAuth failed', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            return null;
        }

        $token = $response->json('access_token');

        return is_string($token) && $token !== '' ? $token : null;
    }

    private static function paypalBaseUrl(string $mode): string
    {
        return $mode === self::MODE_LIVE
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    private static function darajaBaseUrl(string $mode): string
    {
        return $mode === self::MODE_LIVE
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    private static function intasendBaseUrl(string $mode): string
    {
        return $mode === self::MODE_LIVE
            ? 'https://payment.intasend.com'
            : 'https://sandbox.intasend.com';
    }

    private static function palplussBaseUrl(string $_mode): string
    {
        // Palpluss has no separate sandbox host. Test and live keys share this API.
        // Mode only selects which stored API key (pp_test_ vs pp_live_) we send.
        return 'https://api.palpluss.com/v1';
    }

    private static function palplussAccountReference(): string
    {
        $raw = (string) SiteSetting::getValue('upgrade_mpesa_account', 'NANYUKINOW');
        $clean = substr(preg_replace('/[^A-Za-z0-9]/', '', $raw) ?? '', 0, 12);

        return $clean !== '' ? $clean : 'NANYUKINOW';
    }

    private static function normalizeKenyanPhone(string $raw): ?string
    {
        $digits = preg_replace('/\D+/', '', $raw) ?? '';

        if (str_starts_with($digits, '0') && strlen($digits) === 10) {
            $digits = '254'.substr($digits, 1);
        } elseif (str_starts_with($digits, '7') && strlen($digits) === 9) {
            $digits = '254'.$digits;
        } elseif (str_starts_with($digits, '254') && strlen($digits) === 12) {
            // already ok
        } else {
            return null;
        }

        return $digits;
    }
}
