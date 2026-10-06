<?php

namespace Tests\Feature\Admin;

use App\Models\PricingPlan;
use App\Models\User;
use App\Support\CategoryKey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_pricing_page_and_must_pick_category(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.pricing.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Pricing/Index')
                ->has('categories', 7)
                ->where('selectedCategory', null)
                ->has('plans', 0));
    }

    public function test_admin_can_view_category_pricing_tiers(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();

        $this->actingAs($admin)
            ->get(route('admin.pricing.index', ['category' => 'eat-drink']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Pricing/Index')
                ->where('selectedCategory', 'eatDrink')
                ->has('plans', 3)
                ->where('plans.0.key', 'free')
                ->where('plans.0.category_key', 'eatDrink')
                ->where('plans.1.key', 'featured')
                ->where('plans.2.key', 'premium'));
    }

    public function test_guest_cannot_view_pricing(): void
    {
        $this->get(route('admin.pricing.index'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_update_a_category_pricing_plan(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();
        $plan = PricingPlan::query()
            ->where('key', 'featured')
            ->where('category_key', 'stay')
            ->firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.pricing.update', $plan), [
                'name' => 'Featured Plus',
                'tagline' => 'Updated tagline',
                'price_amount' => 3200,
                'yearly_price_amount' => 32000,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => null,
                'inclusions' => ['Gallery', 'Map pin'],
                'cta_label' => 'Upgrade',
                'is_highlighted' => true,
                'is_active' => true,
                'sort_order' => 2,
                'listing_limit' => 3,
            ])
            ->assertRedirect();

        $plan->refresh();
        $this->assertSame('Featured Plus', $plan->name);
        $this->assertSame(3200, $plan->price_amount);
        $this->assertSame(32000, $plan->yearly_price_amount);
        $this->assertSame('stay', $plan->category_key);

        $eatDrink = PricingPlan::query()
            ->where('key', 'featured')
            ->where('category_key', 'eatDrink')
            ->firstOrFail();
        $this->assertNotSame(3200, $eatDrink->price_amount);
    }

    public function test_highlighting_one_tier_clears_others_in_same_category_only(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();

        $featured = PricingPlan::query()
            ->where('key', 'featured')
            ->where('category_key', 'events')
            ->firstOrFail();
        $premium = PricingPlan::query()
            ->where('key', 'premium')
            ->where('category_key', 'events')
            ->firstOrFail();
        $otherCategoryFeatured = PricingPlan::query()
            ->where('key', 'featured')
            ->where('category_key', 'shopping')
            ->firstOrFail();

        $otherCategoryFeatured->update(['is_highlighted' => true]);

        $this->actingAs($admin)
            ->put(route('admin.pricing.update', $premium), [
                'name' => $premium->name,
                'tagline' => $premium->tagline,
                'price_amount' => $premium->price_amount,
                'yearly_price_amount' => $premium->yearly_price_amount,
                'currency' => $premium->currency,
                'billing_period' => $premium->billing_period,
                'price_label' => $premium->price_label,
                'inclusions' => $premium->inclusions,
                'cta_label' => $premium->cta_label,
                'is_highlighted' => true,
                'is_active' => true,
                'sort_order' => $premium->sort_order,
                'listing_limit' => $premium->listing_limit,
            ])
            ->assertRedirect();

        $this->assertFalse($featured->fresh()->is_highlighted);
        $this->assertTrue($premium->fresh()->is_highlighted);
        $this->assertTrue($otherCategoryFeatured->fresh()->is_highlighted);
    }

    public function test_admin_can_delete_a_pricing_plan(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();
        $plan = PricingPlan::query()
            ->where('key', 'featured')
            ->where('category_key', 'services')
            ->firstOrFail();

        $this->actingAs($admin)
            ->delete(route('admin.pricing.destroy', $plan))
            ->assertRedirect(route('admin.pricing.index', ['category' => 'services']));

        $this->assertDatabaseMissing('pricing_plans', ['id' => $plan->id]);
        $this->assertSame(count(CategoryKey::keys()) * 3 - 1, PricingPlan::query()->count());
    }
}
