<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_redirects_to_home_auth_modal(): void
    {
        $response = $this->get('/register');

        $response->assertRedirect('/?auth=register');
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'username' => 'test_user',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('account.index', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'plan' => 'free',
        ]);
    }
}
