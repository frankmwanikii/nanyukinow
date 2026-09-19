<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\UserAvatar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GoogleAvatarImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_from_url_stores_remote_image(): void
    {
        Storage::fake('public');

        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            true,
        );

        Http::fake([
            'https://lh3.googleusercontent.com/*' => Http::response($png, 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);

        $path = UserAvatar::importFromUrl('https://lh3.googleusercontent.com/a/test=s96-c');

        $this->assertNotNull($path);
        $this->assertStringStartsWith('/storage/avatars/', $path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $path));
    }

    public function test_google_login_imports_avatar_for_new_user(): void
    {
        Storage::fake('public');

        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            true,
        );

        Http::fake([
            'https://lh3.googleusercontent.com/*' => Http::response($png, 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);

        $googleUser = new class
        {
            public function getEmail(): string
            {
                return 'frank@example.com';
            }

            public function getName(): string
            {
                return 'Frank Member';
            }

            public function getAvatar(): string
            {
                return 'https://lh3.googleusercontent.com/a/photo=s96-c';
            }
        };

        \Laravel\Socialite\Facades\Socialite::shouldReceive('driver')
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

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(route('account.index', absolute: false));

        $user = User::query()->where('email', 'frank@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->avatar_url);
        $this->assertStringStartsWith('/storage/avatars/', $user->avatar_url);
    }

    public function test_google_login_does_not_overwrite_existing_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'email' => 'frank@example.com',
            'avatar_url' => '/storage/avatars/custom.jpg',
            'email_verified_at' => now(),
        ]);

        Http::fake();

        $googleUser = new class
        {
            public function getEmail(): string
            {
                return 'frank@example.com';
            }

            public function getName(): string
            {
                return 'Frank Member';
            }

            public function getAvatar(): string
            {
                return 'https://lh3.googleusercontent.com/a/photo=s96-c';
            }
        };

        \Laravel\Socialite\Facades\Socialite::shouldReceive('driver')
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

        $this->get('/auth/google/callback')->assertRedirect(route('account.index', absolute: false));

        $this->assertSame('/storage/avatars/custom.jpg', $user->refresh()->avatar_url);
        Http::assertNothingSent();
    }
}
