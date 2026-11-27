<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tighten\Ziggy\Ziggy;

class AdminPathSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_is_rate_limited(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
            'is_admin' => true,
        ]);

        foreach (range(1, 5) as $attempt) {
            $this->post(route('admin.login.store'), [
                'login' => 'wrong@example.com',
                'password' => 'bad-password',
            ])->assertSessionHasErrors('login');
        }

        $this->post(route('admin.login.store'), [
            'login' => 'wrong@example.com',
            'password' => 'bad-password',
        ])->assertStatus(429);
    }

    public function test_guest_ziggy_group_excludes_admin_routes(): void
    {
        $routes = (new Ziggy('guest'))->toArray()['routes'] ?? [];

        $this->assertArrayNotHasKey('admin.login', $routes);
        $this->assertArrayNotHasKey('admin.dashboard', $routes);
        $this->assertArrayHasKey('login', $routes);
    }
}
