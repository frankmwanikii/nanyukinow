<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '0712345678',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertSame('0712345678', $user->phone);
        $this->assertNull($user->email_verified_at);
    }

    public function test_updated_phone_is_visible_on_admin_member_profile(): void
    {
        $member = User::factory()->create(['phone' => null]);
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($member)
            ->patch('/profile', [
                'name' => $member->name,
                'email' => $member->email,
                'phone' => '0700111222',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->actingAs($admin)
            ->get(route('admin.users.show', $member->username ?: $member->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Show')
                ->where('user.phone', '0700111222'));
    }

    public function test_profile_avatar_can_be_uploaded(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['avatar_url' => null]);
        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $response = $this
            ->actingAs($user)
            ->post('/profile', [
                '_method' => 'patch',
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $file,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertNotNull($user->avatar_url);
        $this->assertStringStartsWith('/storage/avatars/', $user->avatar_url);

        $relative = Str::after($user->avatar_url, '/storage/');
        Storage::disk('public')->assertExists($relative);
    }

    public function test_profile_avatar_can_be_removed(): void
    {
        Storage::fake('public');

        $path = UploadedFile::fake()->image('old.jpg')->store('avatars', 'public');
        $user = User::factory()->create([
            'avatar_url' => '/storage/'.$path,
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/profile', [
                '_method' => 'patch',
                'name' => $user->name,
                'email' => $user->email,
                'remove_avatar' => true,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNull($user->refresh()->avatar_url);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
