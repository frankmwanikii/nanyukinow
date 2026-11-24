<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPreviewAccessSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_settings_include_preview_gate_toggle(): void
    {
        config(['site.preview_gate_enabled' => true]);

        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index')
                ->has('groupedSettings.access')
                ->where('groupedSettings.access.0.key', 'preview_gate_enabled')
                ->where('groupedSettings.access.0.value', '1')
                ->where('groupedSettings.access.0.options.0.value', '1')
                ->where('groupedSettings.access.0.options.1.value', '0')
                ->etc());
    }

    public function test_admin_can_turn_off_preview_lock_and_open_the_site(): void
    {
        config(['site.preview_gate_enabled' => true]);

        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertOk();

        $this->get('/')->assertNotFound();

        $this->actingAs($admin)
            ->put(route('admin.settings.update'), [
                'settings' => [
                    ['key' => 'preview_gate_enabled', 'value' => '0'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_settings', [
            'key' => 'preview_gate_enabled',
            'value' => '0',
        ]);

        $this->get('/')->assertOk();
    }

    public function test_admin_can_turn_preview_lock_back_on(): void
    {
        config(['site.preview_gate_enabled' => false]);

        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertOk();

        SiteSetting::query()
            ->where('key', 'preview_gate_enabled')
            ->update(['value' => '0']);
        SiteSetting::forgetCache();

        $this->get('/')->assertOk();

        $this->actingAs($admin)
            ->put(route('admin.settings.update'), [
                'settings' => [
                    ['key' => 'preview_gate_enabled', 'value' => '1'],
                ],
            ])
            ->assertRedirect();

        $this->get('/')
            ->assertNotFound()
            ->assertViewIs('coming-soon');
    }
}
