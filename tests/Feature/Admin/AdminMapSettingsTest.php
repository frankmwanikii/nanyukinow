<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMapSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_settings_include_map_provider_switch(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index')
                ->has('groupedSettings.maps')
                ->where('groupedSettings.maps.0.key', 'map_provider')
                ->where('groupedSettings.maps.0.value', 'google')
                ->where('groupedSettings.maps.0.options.0.value', 'google')
                ->where('groupedSettings.maps.0.options.1.value', 'leaflet')
                ->where('groupedSettings.maps.1.key', 'google_maps_api_key')
                ->where('groupedSettings.maps.1.type', 'password')
                ->etc());
    }

    public function test_admin_can_save_google_maps_api_key(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertOk();

        $this->actingAs($admin)
            ->put(route('admin.settings.update'), [
                'settings' => [
                    ['key' => 'map_provider', 'value' => 'google'],
                    ['key' => 'google_maps_api_key', 'value' => 'AIzaSyTestMapsKeyFromAdmin'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_settings', [
            'key' => 'google_maps_api_key',
            'value' => 'AIzaSyTestMapsKeyFromAdmin',
        ]);

        $this->actingAs($admin)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('mapsApiKey', 'AIzaSyTestMapsKeyFromAdmin')
                ->etc());
    }

    public function test_admin_can_switch_map_provider_to_leaflet(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertOk();

        $this->actingAs($admin)
            ->put(route('admin.settings.update'), [
                'settings' => [
                    ['key' => 'map_provider', 'value' => 'leaflet'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_settings', [
            'key' => 'map_provider',
            'value' => 'leaflet',
        ]);

        $this->actingAs($admin)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('mapProvider', 'leaflet')
                ->etc());
    }

    public function test_map_provider_defaults_to_google_when_unset(): void
    {
        $user = User::factory()->create();

        SiteSetting::query()->where('key', 'map_provider')->delete();
        SiteSetting::forgetCache();

        $this->actingAs($user)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('mapProvider', 'google')
                ->etc());
    }
}
