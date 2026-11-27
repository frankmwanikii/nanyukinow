<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureSitePreviewAccess;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitePreviewGateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // TestCase disables this for most feature tests; this suite needs it on.
        $this->withMiddleware(EnsureSitePreviewAccess::class);

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

    public function test_admin_login_remains_reachable_while_locked(): void
    {
        $this->get(route('admin.login'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Login'));
    }

    public function test_preview_path_unlocks_the_site_for_the_session(): void
    {
        $this->get('/nn-dev-preview')
            ->assertRedirect(route('home'));

        $this->assertTrue(session('site_preview_unlocked'));

        $this->get('/')
            ->assertOk();
    }

    public function test_admin_can_sign_in_after_preview_unlock(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
            'is_admin' => true,
        ]);

        $this->get('/nn-dev-preview')->assertRedirect(route('home'));
        $this->assertTrue(session('site_preview_unlocked'));

        $this->from(route('admin.login'))
            ->post(route('admin.login.store'), [
                'login' => 'admin@example.com',
                'password' => 'password',
                'remember' => true,
            ])
            ->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticated();
        $this->assertTrue(session('site_preview_unlocked'));

        $this->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
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

    public function test_admin_setting_can_disable_gate_while_config_is_on(): void
    {
        SiteSetting::query()->create([
            'group' => 'access',
            'key' => 'preview_gate_enabled',
            'label' => 'Dev preview lock',
            'type' => 'select',
            'value' => '0',
            'help' => null,
            'sort_order' => 1,
        ]);
        SiteSetting::forgetCache();

        $this->get('/')->assertOk();
    }

    public function test_admin_setting_can_enable_gate_while_config_is_off(): void
    {
        config(['site.preview_gate_enabled' => false]);

        SiteSetting::query()->create([
            'group' => 'access',
            'key' => 'preview_gate_enabled',
            'label' => 'Dev preview lock',
            'type' => 'select',
            'value' => '1',
            'help' => null,
            'sort_order' => 1,
        ]);
        SiteSetting::forgetCache();

        $this->get('/')
            ->assertNotFound()
            ->assertViewIs('coming-soon');
    }
}
