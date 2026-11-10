<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitePreviewGateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'site.preview_gate_enabled' => true,
            'site.preview_path' => 'nn-dev-preview',
            'site.preview_session_key' => 'site_preview_unlocked',
        ]);
    }

    public function test_public_home_is_hidden_without_preview_unlock(): void
    {
        $response = $this->get('/');

        $response->assertNotFound();
        $response->assertSee('Almost ready', false);
        $response->assertSee('Notify me', false);
        $response->assertSee('Enter your email', false);
        $response->assertSee('slide-2.webp', false);
        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $response->assertViewIs('coming-soon');
    }

    public function test_newsletter_remains_reachable_while_locked(): void
    {
        $this->postJson('/newsletter', [
            'email' => 'early@example.com',
        ])->assertOk();

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'early@example.com',
        ]);
    }

    public function test_preview_path_unlocks_the_site_for_the_session(): void
    {
        $this->get('/nn-dev-preview')
            ->assertRedirect(route('home'));

        $this->assertTrue(session('site_preview_unlocked'));

        $this->get('/')
            ->assertOk();
    }

    public function test_webhooks_remain_reachable_while_locked(): void
    {
        $this->post('/webhooks/paypal', [])
            ->assertStatus(400);
    }

    public function test_gate_can_be_disabled(): void
    {
        config(['site.preview_gate_enabled' => false]);

        $this->get('/')->assertOk();
    }
}
