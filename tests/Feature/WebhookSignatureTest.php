<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Support\PaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookSignatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_paypal_webhook_rejects_missing_signature(): void
    {
        $this->seedPaypalWebhookId();

        $this->postJson(route('webhooks.paypal'), [
            'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
        ])
            ->assertStatus(401)
            ->assertJson(['error' => 'Invalid signature']);
    }

    public function test_paypal_webhook_accepts_verified_signature(): void
    {
        $this->seedPaypalWebhookId();

        Http::fake([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response(['access_token' => 'TOKEN'], 200),
            'api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
                'verification_status' => 'SUCCESS',
            ], 200),
        ]);

        $payload = [
            'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
            'resource' => [
                'supplementary_data' => [
                    'related_ids' => ['order_id' => 'ORDER-UNKNOWN'],
                ],
            ],
        ];
        $raw = json_encode($payload, JSON_THROW_ON_ERROR);

        $this->call(
            'POST',
            route('webhooks.paypal'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_PAYPAL_AUTH_ALGO' => 'SHA256withRSA',
                'HTTP_PAYPAL_CERT_URL' => 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-1',
                'HTTP_PAYPAL_TRANSMISSION_ID' => 'tx-1',
                'HTTP_PAYPAL_TRANSMISSION_SIG' => 'sig',
                'HTTP_PAYPAL_TRANSMISSION_TIME' => '2026-01-01T00:00:00Z',
            ],
            $raw,
        )->assertOk()->assertJson(['received' => true]);
    }

    public function test_palpluss_webhook_rejects_missing_signature(): void
    {
        $this->seedPalplussWebhookSecret();

        $this->postJson(route('webhooks.palpluss'), [
            'event_type' => 'transaction.success',
            'transaction' => ['id' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4'],
        ])
            ->assertStatus(401)
            ->assertJson(['error' => 'Invalid signature']);
    }

    public function test_palpluss_webhook_signature_round_trip(): void
    {
        $secret = 'whsec_'.base64_encode('test-signing-key-bytes!!');
        $this->seedPalplussWebhookSecret($secret);

        $raw = json_encode([
            'event' => 'webhook.test',
            'event_type' => 'webhook.test',
            'message' => 'ok',
        ], JSON_THROW_ON_ERROR);
        $headers = $this->palplussSignedHeaders($raw, $secret);

        $this->assertTrue(PaymentGateway::palplussWebhookSignatureValid($headers, $raw));

        $this->call(
            'POST',
            route('webhooks.palpluss'),
            [],
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $this->httpHeaders($headers)),
            $raw,
        )->assertOk()->assertJson(['received' => true]);
    }

    private function seedPaypalWebhookId(): void
    {
        SiteSetting::query()->updateOrCreate(
            ['key' => 'paypal_mode'],
            [
                'group' => 'payments',
                'label' => 'PayPal mode',
                'type' => 'select',
                'value' => 'sandbox',
                'sort_order' => 10,
            ],
        );
        SiteSetting::query()->updateOrCreate(
            ['key' => 'paypal_sandbox_webhook_id'],
            [
                'group' => 'payments',
                'label' => 'PayPal sandbox webhook ID',
                'type' => 'text',
                'value' => 'WH-TEST-123',
                'sort_order' => 15,
            ],
        );
        SiteSetting::forgetCache();
    }

    private function seedPalplussWebhookSecret(?string $secret = null): void
    {
        SiteSetting::query()->updateOrCreate(
            ['key' => 'palpluss_webhook_secret'],
            [
                'group' => 'payments',
                'label' => 'Palpluss webhook signing secret',
                'type' => 'password',
                'value' => $secret ?? ('whsec_'.base64_encode('test-signing-key-bytes!!')),
                'sort_order' => 36,
            ],
        );
        SiteSetting::forgetCache();
    }

    /**
     * @return array{webhook-id: string, webhook-timestamp: string, webhook-signature: string}
     */
    private function palplussSignedHeaders(string $rawBody, string $secret): array
    {
        $id = 'msg_test_1';
        $timestamp = (string) time();
        $key = base64_decode(preg_replace('/^whsec_/', '', $secret) ?? '', true);
        $sig = base64_encode(hash_hmac('sha256', $id.'.'.$timestamp.'.'.$rawBody, $key, true));

        return [
            'webhook-id' => $id,
            'webhook-timestamp' => $timestamp,
            'webhook-signature' => 'v1,'.$sig,
        ];
    }

    /**
     * @param  array<string, string>  $headers
     * @return array<string, string>
     */
    private function httpHeaders(array $headers): array
    {
        $out = [];
        foreach ($headers as $key => $value) {
            $out['HTTP_'.strtoupper(str_replace('-', '_', $key))] = $value;
        }

        return $out;
    }
}
