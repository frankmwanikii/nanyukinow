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

    /** @var string Default PayPal sandbox client id (overridable in admin). */
    public const DEFAULT_PAYPAL_SANDBOX_CLIENT_ID = 'BAArAU7QuOwie6GylyZKkHtHBsUIvyjvKrJX-UPEurvQOic1-upqESJEfsT950Bc4YcpCz7mBdCw1-qO2Y';

    /** @var string Default PayPal sandbox secret (overridable in admin). */
    public const DEFAULT_PAYPAL_SANDBOX_SECRET = 'EOFR-tNNYN4XtEH49K8Ej82xJGNvCnAtRFZMwjMXiZpAH6MgFsS4Mwds_uDQjQJHQv4_rOoRuNfrT35h';

    /** Generic member-facing failure — never expose admin/config details. */
    public const FAILURE_MESSAGE = 'Payment failed. Please try again.';

    /**
     * Member checkout still sends payment_method=mpesa; admin chooses Daraja vs IntaSend.
     *
     * @param  array<string, mixed>  $payload
     * @return array{ok: bool, provider_ref?: string, checkout_url?: string, message?: string}
     */
    public static function initiateMpesa(array $payload): array
    {
        return match (self::mobileMoneyProvider()) {
            self::PROVIDER_INTASEND => self::initiateIntasend($payload),
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

        $returnUrl = (string) ($payload['return_url'] ?? route('account.billing'));
        $cancelUrl = (string) ($payload['cancel_url'] ?? route('account.upgrade'));

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
                    'landing_page' => 'LOGIN',
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
     * @return array{mode: string, client_id: string, secret: string}
     */
    public static function paypalCredentials(): array
    {
        $mode = self::normalizeMode(SiteSetting::getValue('paypal_mode', self::MODE_SANDBOX));

        if ($mode === self::MODE_LIVE) {
            return [
                'mode' => self::MODE_LIVE,
                'client_id' => trim((string) SiteSetting::getValue('paypal_live_client_id', '')),
                'secret' => trim((string) SiteSetting::getValue('paypal_live_secret', '')),
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
        ];
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

    public static function mobileMoneyProvider(): string
    {
        $provider = strtolower(trim((string) SiteSetting::getValue(
            'mobile_money_provider',
            self::PROVIDER_MPESA,
        )));

        return $provider === self::PROVIDER_INTASEND
            ? self::PROVIDER_INTASEND
            : self::PROVIDER_MPESA;
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
