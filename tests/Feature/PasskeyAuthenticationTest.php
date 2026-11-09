<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passkeys\Passkey;
use Tests\TestCase;

class PasskeyAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_fetch_passkey_login_options(): void
    {
        $response = $this->getJson(route('passkey.login-options'));

        $response->assertOk();
        $response->assertJsonStructure(['options' => ['challenge', 'rpId', 'timeout']]);
    }

    public function test_passkey_availability_reports_missing_and_ready(): void
    {
        $user = User::factory()->create([
            'email' => 'frank@example.com',
            'username' => 'frank',
        ]);

        $this->postJson(route('passkey.availability'), ['login' => 'frank@example.com'])
            ->assertOk()
            ->assertJson(['status' => 'missing']);

        $this->createPasskeyFor($user, 'Chrome');

        $this->postJson(route('passkey.availability'), ['login' => 'frank'])
            ->assertOk()
            ->assertJson(['status' => 'ready']);

        $this->postJson(route('passkey.availability'), ['login' => 'nobody@example.com'])
            ->assertOk()
            ->assertJson(['status' => 'unknown']);
    }

    public function test_account_login_options_can_scope_to_user_passkeys(): void
    {
        $user = User::factory()->create(['email' => 'passkey@example.com']);
        $this->createPasskeyFor($user, 'Windows PC');

        $response = $this->getJson(
            route('passkey.account-login-options', ['login' => 'passkey@example.com'])
        );

        $response->assertOk();
        $response->assertJsonStructure(['options' => ['challenge', 'rpId', 'allowCredentials']]);
        $this->assertNotEmpty($response->json('options.allowCredentials'));
    }

    public function test_registration_options_prefer_platform_authenticator(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson(route('passkey.registration-options'));

        $response->assertOk();
        $response->assertJsonPath(
            'options.authenticatorSelection.authenticatorAttachment',
            'platform',
        );
        $response->assertJsonPath('options.hints', ['client-device']);
    }

    public function test_login_options_prefer_client_device_hint(): void
    {
        $response = $this->getJson(route('passkey.login-options'));

        $response->assertOk();
        $response->assertJsonPath('options.hints', ['client-device']);
    }

    public function test_guest_cannot_fetch_passkey_registration_options(): void
    {
        $response = $this->getJson(route('passkey.registration-options'));

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_fetch_passkey_registration_options(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson(route('passkey.registration-options'));

        $response->assertOk();
        $response->assertJsonStructure([
            'options' => [
                'challenge',
                'rp' => ['id', 'name'],
                'user' => ['id', 'name', 'displayName'],
                'authenticatorSelection',
            ],
        ]);
    }

    public function test_profile_page_includes_passkeys(): void
    {
        $user = User::factory()->create();
        $this->createPasskeyFor($user, 'iPhone');

        $response = $this->actingAs($user)->get(route('profile.edit'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Profile/Edit')
            ->has('passkeys', 1)
            ->where('passkeys.0.name', 'iPhone')
            ->missing('passkeys.0.credential')
            ->missing('passkeys.0.credential_id'));
    }

    public function test_user_can_delete_own_passkey(): void
    {
        $user = User::factory()->create();
        $passkey = $this->createPasskeyFor($user, 'Mac');

        $response = $this->actingAs($user)->delete(route('passkey.destroy', $passkey));

        $response->assertRedirect();
        $this->assertDatabaseMissing('passkeys', ['id' => $passkey->id]);
    }

    public function test_user_cannot_delete_another_users_passkey(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $passkey = $this->createPasskeyFor($owner, 'Android phone');

        $response = $this->actingAs($other)->delete(route('passkey.destroy', $passkey));

        $response->assertForbidden();
        $this->assertDatabaseHas('passkeys', ['id' => $passkey->id]);
    }

    private function createPasskeyFor(User $user, string $name): Passkey
    {
        return $user->passkeys()->create([
            'name' => $name,
            'credential_id' => bin2hex(random_bytes(16)),
            'credential' => [
                'publicKeyCredentialId' => bin2hex(random_bytes(16)),
                'type' => 'public-key',
                'transports' => ['internal'],
                'attestationType' => 'none',
                'trustPath' => ['type' => 'empty'],
                'aaguid' => '00000000-0000-0000-0000-000000000000',
                'credentialPublicKey' => base64_encode(random_bytes(32)),
                'counter' => 0,
            ],
        ]);
    }
}
