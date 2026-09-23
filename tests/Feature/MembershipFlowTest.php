<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\User;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_start_on_free_plan(): void
    {
        $user = User::factory()->create();

        $this->assertSame(Membership::FREE, $user->plan);
        $this->assertSame(1, Membership::listingLimit($user->plan));
    }

    public function test_guest_can_view_pricing_page(): void
    {
        PricingPlan::ensureDefaults();

        $this->get(route('pricing'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Pricing')
                ->has('plans', 3)
                ->where('plans.1.name', 'Standard'));
    }

    public function test_member_can_create_one_free_listing_then_is_blocked(): void
    {
        $user = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $this->actingAs($user)
            ->post(route('account.listings.store'), [
                'title' => 'Highland Cafe',
                'category_id' => $category->id,
                'location' => 'Nanyuki',
                'description' => 'Coffee and views.',
                'tier' => 'free',
            ])
            ->assertRedirect(route('account.index'));

        $this->assertDatabaseHas('listings', [
            'title' => 'Highland Cafe',
            'user_id' => $user->id,
            'tier' => 'free',
            'status' => 'pending',
            'is_published' => false,
        ]);

        $this->actingAs($user)
            ->post(route('account.listings.store'), [
                'title' => 'Second Spot',
                'category_id' => $category->id,
                'tier' => 'free',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame(1, Listing::query()->where('user_id', $user->id)->count());
    }

    public function test_member_can_request_upgrade_and_admin_can_approve(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Free Spot',
            'slug' => 'free-spot',
            'status' => 'pending',
            'tier' => Membership::FREE,
            'claim_status' => 'claimed',
            'is_published' => false,
            'is_featured' => false,
        ]);

        $this->actingAs($user)
            ->post(route('account.upgrade.store'), [
                'to_plan' => Membership::STANDARD,
                'payment_reference' => 'QJX7TESTCODE',
                'payment_method' => 'mpesa',
                'member_notes' => 'Paid from 07xx',
            ])
            ->assertRedirect(route('account.index'));

        $upgrade = PlanUpgrade::query()->first();
        $this->assertNotNull($upgrade);
        $this->assertSame(PlanUpgrade::STATUS_PENDING, $upgrade->status);
        $this->assertSame('mpesa', $upgrade->payment_method);
        $this->assertSame('month', $upgrade->billing_period);

        $this->actingAs($admin)
            ->post(route('admin.upgrades.approve', $upgrade))
            ->assertRedirect();

        $user->refresh();
        $listing->refresh();
        $upgrade->refresh();

        $this->assertSame(Membership::STANDARD, $user->plan);
        $this->assertSame(Membership::STANDARD, $user->effectivePlan());
        $this->assertSame(PlanUpgrade::STATUS_APPROVED, $upgrade->status);
        $this->assertNotNull($user->plan_expires_at);
        $this->assertTrue($user->plan_expires_at->isAfter(now()->addDays(28)));
        $this->assertTrue($user->plan_expires_at->isBefore(now()->addDays(32)));
        $this->assertSame(Membership::STANDARD, $listing->tier);
        $this->assertTrue($listing->is_featured);
        $this->assertTrue(Membership::canCreateListing($user));
        $this->assertSame(3, Membership::listingLimit($user->effectivePlan()));
    }

    public function test_approving_premium_upgrade_boosts_standard_listings_and_uses_billing_period(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->standard()->create();
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Eat',
            'slug' => 'eat',
            'sort_order' => 1,
        ]);

        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Featured Cafe',
            'slug' => 'featured-cafe',
            'status' => 'approved',
            'tier' => Membership::STANDARD,
            'claim_status' => 'claimed',
            'is_published' => true,
            'is_featured' => true,
        ]);

        $upgrade = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::STANDARD,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5500,
            'currency' => 'KES',
            'billing_period' => 'year',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'YEARLYPREM1',
            'payment_method' => 'mpesa',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.upgrades.approve', $upgrade))
            ->assertRedirect();

        $user->refresh();
        $listing->refresh();

        $this->assertSame(Membership::PREMIUM, $user->plan);
        $this->assertSame(Membership::PREMIUM, $listing->tier);
        $this->assertTrue($user->plan_expires_at->isAfter(now()->addDays(360)));
        $this->assertSame(10, Membership::listingLimit($user->effectivePlan()));
    }

    public function test_standard_member_can_create_up_to_three_listings(): void
    {
        $user = User::factory()->standard()->create();
        $category = Category::query()->create([
            'name' => 'Eat',
            'slug' => 'eat',
            'sort_order' => 1,
        ]);

        for ($i = 1; $i <= 3; $i++) {
            $this->actingAs($user)
                ->post(route('account.listings.store'), [
                    'title' => "Spot {$i}",
                    'category_id' => $category->id,
                    'tier' => 'featured',
                ])
                ->assertRedirect(route('account.index'));
        }

        $this->assertSame(3, $user->listings()->count());

        $this->actingAs($user)
            ->get(route('account.listings.create'))
            ->assertRedirect(route('account.index'));
    }

    public function test_member_can_view_billing_page(): void
    {
        $user = User::factory()->standard()->create([
            'plan_started_at' => now()->subDays(10),
            'plan_expires_at' => now()->addDays(20),
        ]);

        $this->actingAs($user)
            ->get(route('account.billing'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Billing')
                ->where('plan.key', Membership::STANDARD)
                ->where('plan.days_remaining', 20)
                ->has('history')
                ->has('pendingUpgrade'));
    }

    public function test_account_dashboard_requires_auth(): void
    {
        $this->get(route('account.index'))
            ->assertRedirect(route('login'));
    }

    public function test_dashboard_route_redirects_to_account(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('account.index'));
    }
}
