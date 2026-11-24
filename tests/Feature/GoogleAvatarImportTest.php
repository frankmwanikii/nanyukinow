<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\UserAvatar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;

class GoogleAvatarImportTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUser(
        string $email = 'frank@example.com',
        string $name = 'Frank Member',
        string $avatar = 'https://lh3.googleusercontent.com/a/photo=s96-c',
    ): object {
        return new class($email, $name, $avatar)
        {
            public function __construct(
                private string $email,
                private string $name,
                private string $avatar,
            ) {}

            public function getEmail(): string
            {
                return $this->email;
            }

            public function getName(): string
            {
                return $this->name;
            }

            public function getAvatar(): string
            {
                return $this->avatar;
            }
        };
    }

    private function fakeSocialite(object $googleUser): void
    {
        Socialite::shouldReceive('driver')
            ->with('google')
            ->andReturn(new class($googleUser)
            {
                public function __construct(private object $user) {}

                public function user(): object
                {
                    return $this->user;
                }

                public function redirect()
                {
                    return redirect('/');
                }
            });

        config([
            'services.google.client_id' => 'test-id',
            'services.google.client_secret' => 'test-secret',
        ]);
    }

    private function fakeGoogleAvatarHttp(): void
    {
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            true,
        );

        Http::fake([
            'https://lh3.googleusercontent.com/*' => Http::response($png, 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);
    }

    public function test_import_from_url_stores_remote_image(): void
    {
        Storage::fake('public');
        $this->fakeGoogleAvatarHttp();

        $path = UserAvatar::importFromUrl('https://lh3.googleusercontent.com/a/test=s96-c');

        $this->assertNotNull($path);
        $this->assertStringStartsWith('/storage/avatars/', $path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $path));
    }

    public function test_google_login_imports_avatar_for_new_user(): void
    {
        Storage::fake('public');
        $this->fakeGoogleAvatarHttp();
        $this->fakeSocialite($this->fakeGoogleUser());

        $response = $this->withSession(['google_auth_intent' => 'register'])
            ->get('/auth/google/callback');

        $response->assertRedirect(route('account.index', absolute: false));

        $user = User::query()->where('email', 'frank@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->avatar_url);
        $this->assertStringStartsWith('/storage/avatars/', $user->avatar_url);
    }

    public function test_google_login_normalizes_email_to_lowercase(): void
    {
        Storage::fake('public');
        $this->fakeGoogleAvatarHttp();
        $this->fakeSocialite($this->fakeGoogleUser(email: 'Frank@Example.com'));

        $this->withSession(['google_auth_intent' => 'register'])
            ->get('/auth/google/callback')
            ->assertRedirect(route('account.index', absolute: false));

        $this->assertSame(1, User::query()->count());
        $this->assertSame('frank@example.com', User::query()->value('email'));
    }

    public function test_google_login_does_not_overwrite_existing_usable_avatar(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/custom.webp', 'custom-bytes');

        $user = User::factory()->create([
            'email' => 'frank@example.com',
            'avatar_url' => '/storage/avatars/custom.webp',
            'email_verified_at' => now(),
        ]);

        Http::fake();
        $this->fakeSocialite($this->fakeGoogleUser());

        $this->get('/auth/google/callback')->assertRedirect(route('account.index', absolute: false));

        $this->assertSame('/storage/avatars/custom.webp', $user->refresh()->avatar_url);
        Http::assertNothingSent();
    }

    public function test_google_login_replaces_broken_avatar_path_with_google_photo(): void
    {
        Storage::fake('public');
        $this->fakeGoogleAvatarHttp();

        $user = User::factory()->create([
            'email' => 'frank@example.com',
            'avatar_url' => '/storage/',
            'email_verified_at' => now(),
        ]);

        $this->fakeSocialite($this->fakeGoogleUser());

        $this->get('/auth/google/callback')->assertRedirect(route('account.index', absolute: false));

        $user->refresh();
        $this->assertNotNull($user->avatar_url);
        $this->assertStringStartsWith('/storage/avatars/', $user->avatar_url);
        $this->assertNotSame('/storage/', $user->avatar_url);
    }

    public function test_google_login_keeps_avatar_uploaded_via_profile_for_same_email(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/profile-upload.webp', 'upload-bytes');

        $user = User::factory()->create([
            'email' => 'frank@example.com',
            'avatar_url' => '/storage/avatars/profile-upload.webp',
            'email_verified_at' => now(),
        ]);

        Http::fake();
        $this->fakeSocialite($this->fakeGoogleUser(email: 'FRANK@example.com'));

        $this->get('/auth/google/callback')->assertRedirect(route('account.index', absolute: false));

        $this->assertSame(
            '/storage/avatars/profile-upload.webp',
            $user->refresh()->avatar_url,
        );
        $this->assertSame(
            '/storage/avatars/profile-upload.webp',
            UserAvatar::publicUrl($user->avatar_url),
        );
        Http::assertNothingSent();
    }
}
