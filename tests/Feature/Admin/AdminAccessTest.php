<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_admin_login(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_non_admin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.dashboard'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_view_dashboard(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('stats')
                ->has('stats.pending_upgrades')
                ->has('stats.pending_listings')
                ->has('charts.activity')
                ->has('charts.categories')
                ->has('charts.statuses')
                ->has('charts.tiers')
                ->has('recentListings')
                ->has('expiringListings'));
    }

    public function test_admin_login_rejects_non_admin(): void
    {
        User::factory()->create([
            'email' => 'member@example.com',
            'password' => 'password',
            'is_admin' => false,
        ]);

        $this->post(route('admin.login.store'), [
            'login' => 'member@example.com',
            'password' => 'password',
        ])->assertSessionHasErrors('login');
    }

    public function test_admin_can_sign_in(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
            'is_admin' => true,
        ]);

        $this->post(route('admin.login.store'), [
            'login' => 'admin@example.com',
            'password' => 'password',
            'remember' => true,
        ])->assertRedirect(route('admin.dashboard'));
    }
}
