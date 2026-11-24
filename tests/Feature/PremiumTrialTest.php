<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Notifications\VerifyEmailCodeNotification;
use App\Support\Membership;
use App\Support\Recaptcha;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PremiumTrialTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_starts_on_free_with_trial_banner_available(): void
    {
        Notification::fake();

        $this->post('/register', [
            'first_name' => 'Trial',
            'last_name' => 'Member',
            'username' => 'trial_member',
            'email' => 'trial.member@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'g-recaptcha-response' => Recaptcha::FALLBACK_TOKEN,
        ])->assertRedirect(route('verification.notice', absolute: false));

        $user = User::query()->where('email', 'trial.member@example.com')->firstOrFail();

        $this->assertSame(Membership::FREE, $user->plan);
        $this->assertFalse((bool) $user->plan_is_trial);
        $this->assertNull($user->premium_trial_claimed_at);
        $this->assertNull($user->trial_banner_dismissed_at);
        $this->assertTrue(Membership::canOfferPremiumTrial($user));

        Notification::assertSentTo($user, VerifyEmailCodeNotification::class);

        $user->forceFill(['email_verified_at' => now()])->save();

        $this->actingAs($user)
            ->get(route('account.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Index')
                ->where('plan.key', Membership::FREE)
                ->where('plan.label', 'Free')
                ->where('plan.show_trial_banner', true)
                ->where('plan.is_trial', false));
    }

    public function test_member_can_claim_three_month_premium_trial(): void
    {
        $user = User::factory()->create([
            'plan' => Membership::FREE,
            'plan_expires_at' => null,
        ]);
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);
        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Free Stay',
            'slug' => 'free-stay-trial',
            'status' => 'published',
            'tier' => Membership::FREE,
            'priority' => Membership::listingPriority(Membership::FREE),
            'claim_status' => 'claimed',
            'is_published' => true,
            'is_featured' => false,
        ]);

        $this->actingAs($user)
            ->post(route('account.premium-trial.claim'))
            ->assertRedirect()
            ->assertSessionHas('success');

        $user->refresh();
        $listing->refresh();

        $this->assertSame(Membership::PREMIUM, $user->plan);
        $this->assertTrue((bool) $user->plan_is_trial);
        $this->assertNotNull($user->premium_trial_claimed_at);
        $this->assertNotNull($user->trial_banner_dismissed_at);
        $this->assertNull($user->last_paid_plan);
        $this->assertTrue($user->plan_expires_at->isAfter(now()->addDays(Membership::PREMIUM_TRIAL_DAYS - 2)));
        $this->assertSame(Membership::PREMIUM, $listing->tier);
        $this->assertTrue((bool) $listing->is_featured);
        $this->assertFalse(Membership::canOfferPremiumTrial($user));

        $this->actingAs($user)
            ->get(route('account.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Index')
                ->where('plan.key', Membership::PREMIUM)
                ->where('plan.label', 'Premium trial')
                ->where('plan.is_trial', true)
                ->where('plan.show_trial_banner', false)
                ->where('plan.is_paid', false)
                ->where('plan.can_renew', false));
    }

    public function test_trial_can_only_be_claimed_once(): void
    {
        $user = User::factory()->create([
            'plan' => Membership::FREE,
            'premium_trial_claimed_at' => now()->subMonth(),
            'trial_banner_dismissed_at' => now()->subMonth(),
        ]);

        $this->actingAs($user)
            ->post(route('account.premium-trial.claim'))
            ->assertRedirect()
            ->assertSessionHas('error');

        $user->refresh();
        $this->assertSame(Membership::FREE, $user->plan);
        $this->assertFalse((bool) $user->plan_is_trial);
    }

    public function test_dismissing_trial_banner_hides_offer_without_claiming(): void
    {
        $user = User::factory()->create([
            'plan' => Membership::FREE,
        ]);

        $this->actingAs($user)
            ->post(route('account.premium-trial.dismiss'))
            ->assertRedirect();

        $user->refresh();
        $this->assertNotNull($user->trial_banner_dismissed_at);
        $this->assertNull($user->premium_trial_claimed_at);
        $this->assertSame(Membership::FREE, $user->plan);
        $this->assertFalse(Membership::canOfferPremiumTrial($user));

        $this->actingAs($user)
            ->get(route('account.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('plan.show_trial_banner', false)
                ->where('plan.key', Membership::FREE));
    }

    public function test_expired_trial_returns_to_free_without_last_paid_plan(): void
    {
        $user = User::factory()->create([
            'plan' => Membership::PREMIUM,
            'plan_is_trial' => true,
            'premium_trial_claimed_at' => now()->subMonths(4),
            'trial_banner_dismissed_at' => now()->subMonths(4),
            'plan_started_at' => now()->subDays(Membership::PREMIUM_TRIAL_DAYS + 1),
            'plan_expires_at' => now()->subDay(),
            'last_paid_plan' => null,
        ]);
        $category = Category::query()->create([
            'name' => 'Eat',
            'slug' => 'eat-drink',
            'sort_order' => 1,
        ]);
        Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Trial Cafe',
            'slug' => 'trial-cafe',
            'status' => 'published',
            'tier' => Membership::PREMIUM,
            'priority' => Membership::listingPriority(Membership::PREMIUM),
            'claim_status' => 'claimed',
            'is_published' => true,
            'is_featured' => true,
            'suppressed_by_plan_expiry' => false,
        ]);

        $this->assertTrue(Membership::expireToFree($user));

        $user->refresh();
        $listing = $user->listings()->first();

        $this->assertSame(Membership::FREE, $user->plan);
        $this->assertFalse((bool) $user->plan_is_trial);
        $this->assertNull($user->last_paid_plan);
        $this->assertFalse((bool) $listing->is_published);
        $this->assertTrue((bool) $listing->suppressed_by_plan_expiry);
        $this->assertFalse(Membership::canOfferPremiumTrial($user));
        $this->assertNull(Membership::renewPlanFor($user));
    }

    public function test_guests_cannot_claim_or_dismiss_trial(): void
    {
        $this->post(route('account.premium-trial.claim'))
            ->assertRedirect(route('login'));

        $this->post(route('account.premium-trial.dismiss'))
            ->assertRedirect(route('login'));
    }

    public function test_paid_members_cannot_claim_trial(): void
    {
        $user = User::factory()->premium()->create();

        $this->actingAs($user)
            ->post(route('account.premium-trial.claim'))
            ->assertRedirect()
            ->assertSessionHas('error');

        $user->refresh();
        $this->assertSame(Membership::PREMIUM, $user->plan);
        $this->assertFalse((bool) $user->plan_is_trial);
        $this->assertNull($user->premium_trial_claimed_at);
    }
}
