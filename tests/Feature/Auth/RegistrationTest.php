<?php

namespace Tests\Feature\Auth;

use App\Models\User;
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
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('account.index', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'plan' => 'free',
        ]);
    }

    public function test_registration_rejects_weak_passwords(): void
    {
        $response = $this->from('/?auth=register')->post('/register', [
            'name' => 'Test User',
            'username' => 'test_user',
            'email' => 'test@example.com',
            'password' => '12345678',
            'password_confirmation' => '12345678',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    public function test_check_email_reports_when_already_registered(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->getJson(route('register.check-email', [
            'email' => 'taken@example.com',
        ]))
            ->assertOk()
            ->assertJson([
                'available' => false,
                'message' => 'This email is already registered. Please sign in.',
            ]);

        $this->getJson(route('register.check-email', [
            'email' => 'free@example.com',
        ]))
            ->assertOk()
            ->assertJson([
                'available' => true,
                'message' => null,
            ]);
    }

    public function test_registration_rejects_duplicate_email_with_sign_in_prompt(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->from('/?auth=register')->post('/register', [
            'name' => 'Test User',
            'username' => 'fresh_user',
            'email' => 'taken@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertSessionHasErrors([
            'email' => 'This email is already registered. Please sign in.',
        ]);
        $this->assertGuest();
    }
}
