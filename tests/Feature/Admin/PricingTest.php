<?php

namespace Tests\Feature\Admin;

use App\Models\PricingPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_pricing_page_with_default_plans(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.pricing.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Pricing/Index')
                ->has('plans', 3)
                ->has('billingPeriods')
                ->where('plans.0.key', 'free')
                ->where('plans.1.key', 'featured')
                ->where('plans.2.key', 'premium'));
    }

    public function test_guest_cannot_view_pricing(): void
    {
        $this->get(route('admin.pricing.index'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_update_a_pricing_plan(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();
        $plan = PricingPlan::query()->where('key', 'featured')->firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.pricing.update', $plan), [
                'name' => 'Featured Plus',
                'tagline' => 'Updated tagline',
                'price_amount' => 3200,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => null,
                'inclusions' => [
                    'Everything in Free',
                    'Featured badge on cards',
                    'Priority support',
                ],
                'cta_label' => 'Upgrade now',
                'is_highlighted' => true,
                'is_active' => true,
                'sort_order' => 2,
                'listing_limit' => 5,
            ])
            ->assertRedirect();

        $plan->refresh();

        $this->assertSame('Featured Plus', $plan->name);
        $this->assertSame(3200, $plan->price_amount);
        $this->assertSame(5, $plan->listing_limit);
        $this->assertTrue($plan->is_highlighted);
        $this->assertContains('Priority support', $plan->inclusions);
    }

    public function test_highlighting_a_plan_clears_other_highlights(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();

        $featured = PricingPlan::query()->where('key', 'featured')->firstOrFail();
        $premium = PricingPlan::query()->where('key', 'premium')->firstOrFail();

        $featured->update(['is_highlighted' => true]);
        $premium->update(['is_highlighted' => false]);

        $this->actingAs($admin)
            ->put(route('admin.pricing.update', $premium), [
                'name' => $premium->name,
                'tagline' => $premium->tagline,
                'price_amount' => $premium->price_amount,
                'currency' => $premium->currency,
                'billing_period' => $premium->billing_period,
                'price_label' => $premium->price_label,
                'inclusions' => $premium->inclusions,
                'cta_label' => $premium->cta_label,
                'is_highlighted' => true,
                'is_active' => true,
                'sort_order' => $premium->sort_order,
                'listing_limit' => $premium->listing_limit ?? 10,
            ])
            ->assertRedirect();

        $this->assertFalse($featured->fresh()->is_highlighted);
        $this->assertTrue($premium->fresh()->is_highlighted);
    }

    public function test_admin_can_delete_a_pricing_plan(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();
        $plan = PricingPlan::query()->where('key', 'featured')->firstOrFail();

        $this->actingAs($admin)
            ->delete(route('admin.pricing.destroy', $plan))
            ->assertRedirect();

        $this->assertDatabaseMissing('pricing_plans', ['id' => $plan->id]);
        $this->assertSame(2, PricingPlan::query()->count());
    }
}
