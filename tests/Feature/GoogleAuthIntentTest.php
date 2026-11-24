<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\MemberAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;

class GoogleAuthIntentTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUser(
        string $email = 'fresh@example.com',
        string $name = 'Fresh Member',
    ): object {
        return new class($email, $name)
        {
            public function __construct(
                private string $email,
                private string $name,
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
                return 'https://lh3.googleusercontent.com/a/photo=s96-c';
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
                    return redirect('/auth/google/callback');
                }
            });

        config([
            'services.google.client_id' => 'test-id',
            'services.google.client_secret' => 'test-secret',
        ]);
    }

    public function test_google_login_intent_does_not_create_missing_account(): void
    {
        $this->fakeSocialite($this->fakeGoogleUser());

        $this->get(route('auth.google', ['intent' => 'login']))
            ->assertRedirect('/auth/google/callback');

        $this->get('/auth/google/callback')
            ->assertRedirect(route('login'))
            ->assertSessionHas(
                'status',
                'No account found with those details. Join first, then sign in with Google.',
            );

        $this->assertGuest();
        $this->assertSame(0, User::query()->count());
    }

    public function test_google_register_intent_creates_account(): void
    {
        Storage::fake('public');
        Http::fake([
            'https://lh3.googleusercontent.com/*' => Http::response('img', 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);
        $this->fakeSocialite($this->fakeGoogleUser());

        $this->get(route('auth.google', ['intent' => 'register']))
            ->assertRedirect('/auth/google/callback');

        $this->get('/auth/google/callback')
            ->assertRedirect(route('account.index', absolute: false));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'fresh@example.com',
        ]);
    }

    public function test_deleted_member_cannot_sign_in_again_with_google_login(): void
    {
        Storage::fake('public');
        $member = User::factory()->create([
            'email' => 'deleted.member@example.com',
        ]);

        MemberAccount::delete($member);
        $this->assertNull(User::query()->where('email', 'deleted.member@example.com')->first());

        $this->fakeSocialite($this->fakeGoogleUser(
            email: 'deleted.member@example.com',
            name: 'Deleted Member',
        ));

        $this->get(route('auth.google', ['intent' => 'login']))
            ->assertRedirect('/auth/google/callback');

        $this->get('/auth/google/callback')
            ->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertSame(0, User::query()->where('email', 'deleted.member@example.com')->count());
    }
}
