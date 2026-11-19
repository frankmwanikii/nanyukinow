<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\VerifyEmailCodeNotification;
use App\Support\EmailVerificationCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Auth/VerifyEmail')
            ->where('email', $user->email));
    }

    public function test_email_can_be_verified_with_code(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        $code = EmailVerificationCode::issue($user);

        Event::fake();

        $response = $this->actingAs($user)->post(route('verification.verify-code'), [
            'code' => $code,
        ]);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('account.index', absolute: false));
    }

    public function test_email_is_not_verified_with_invalid_code(): void
    {
        $user = User::factory()->unverified()->create();
        EmailVerificationCode::issue($user);

        $this->actingAs($user)->from(route('verification.notice'))->post(route('verification.verify-code'), [
            'code' => '000000',
        ])->assertSessionHasErrors('code');

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_verification_code_can_be_resent(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->post(route('verification.send'))
            ->assertRedirect();

        Notification::assertSentTo($user, VerifyEmailCodeNotification::class);
    }

    public function test_signed_verification_link_still_works(): void
    {
        $user = User::factory()->unverified()->create();

        Event::fake();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('account.index', absolute: false));
    }

    public function test_unverified_users_cannot_create_listings(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get(route('account.listings.create'))
            ->assertRedirect(route('verification.notice'));
    }

    public function test_unverified_users_cannot_open_upgrade(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get(route('account.upgrade'))
            ->assertRedirect(route('verification.notice'));
    }
}
