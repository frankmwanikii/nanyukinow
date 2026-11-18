<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\User;
use App\Support\ClaimPlanGrace;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ClaimPlanGraceTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(array $overrides = []): Listing
    {
        $category = Category::query()->first()
            ?? Category::query()->create([
                'name' => 'Eat & Drink',
                'slug' => 'eat-drink',
                'is_active' => true,
                'sort_order' => 1,
            ]);

        return Listing::query()->create(array_merge([
            'category_id' => $category->id,
            'title' => 'Grace Lodge',
            'slug' => 'grace-lodge-'.uniqid(),
            'location' => 'Nanyuki',
            'status' => 'published',
            'is_published' => true,
            'claim_status' => 'pending',
            'tier' => Membership::FREE,
            'priority' => 1,
            'is_featured' => false,
        ], $overrides));
    }

    public function test_approving_claim_on_paid_listing_starts_grace_window(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing([
            'tier' => Membership::PREMIUM,
            'priority' => Membership::listingPriority(Membership::PREMIUM),
            'is_featured' => true,
        ]);

        $claim = ListingClaim::query()->create([
            'listing_id' => $listing->id,
            'first_name' => 'Jane',
            'last_name' => 'Wanjiru',
            'email' => 'grace.owner@example.com',
            'phone' => '+254700000001',
            'reason' => 'I own this business.',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.claims.approve', $claim))
            ->assertRedirect();

        $listing->refresh();

        $this->assertTrue($listing->is_verified);
        $this->assertSame(Membership::PREMIUM, $listing->tier);
        $this->assertNotNull($listing->claim_grace_ends_at);
        $this->assertTrue(
            $listing->claim_grace_ends_at->between(
                now()->addDays(ClaimPlanGrace::days() - 1),
                now()->addDays(ClaimPlanGrace::days() + 1),
            ),
        );
    }

    public function test_approving_claim_on_free_listing_skips_grace_window(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing([
            'tier' => Membership::FREE,
            'priority' => 1,
            'is_featured' => false,
        ]);

        $claim = ListingClaim::query()->create([
            'listing_id' => $listing->id,
            'first_name' => 'Sam',
            'last_name' => 'Otieno',
            'email' => 'free.owner@example.com',
            'phone' => '+254700000002',
            'reason' => 'I own this place.',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.claims.approve', $claim))
            ->assertRedirect();

        $listing->refresh();

        $this->assertTrue($listing->is_verified);
        $this->assertNull($listing->claim_grace_ends_at);
    }

    public function test_claim_grace_command_demotes_to_free_and_keeps_verified(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeListing([
            'user_id' => $owner->id,
            'claim_status' => 'claimed',
            'is_verified' => true,
            'tier' => Membership::STANDARD,
            'priority' => Membership::listingPriority(Membership::STANDARD),
            'is_featured' => true,
            'claim_grace_ends_at' => now()->subMinute(),
        ]);

        Artisan::call('listings:process-claim-grace');

        $listing->refresh();

        $this->assertSame(Membership::FREE, $listing->tier);
        $this->assertSame(1, $listing->priority);
        $this->assertFalse($listing->is_featured);
        $this->assertTrue($listing->is_verified);
        $this->assertNull($listing->claim_grace_ends_at);
        $this->assertSame('claimed', $listing->claim_status);
    }

    public function test_activating_paid_plan_clears_claim_grace(): void
    {
        $owner = User::factory()->create(['plan' => Membership::FREE]);
        $listing = $this->makeListing([
            'user_id' => $owner->id,
            'claim_status' => 'claimed',
            'is_verified' => true,
            'tier' => Membership::PREMIUM,
            'priority' => Membership::listingPriority(Membership::PREMIUM),
            'is_featured' => true,
            'claim_grace_ends_at' => now()->addDays(10),
        ]);

        Membership::activate($owner, Membership::PREMIUM, 30);

        $listing->refresh();

        $this->assertNull($listing->claim_grace_ends_at);
        $this->assertSame(Membership::PREMIUM, $listing->tier);
    }

    public function test_account_listings_index_exposes_active_claim_grace(): void
    {
        $owner = User::factory()->create();
        $endsAt = now()->addDays(12);

        $this->makeListing([
            'user_id' => $owner->id,
            'claim_status' => 'claimed',
            'is_verified' => true,
            'tier' => Membership::PREMIUM,
            'priority' => Membership::listingPriority(Membership::PREMIUM),
            'is_featured' => true,
            'claim_grace_ends_at' => $endsAt,
        ]);

        $this->actingAs($owner)
            ->get(route('account.listings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Listings/Index')
                ->where('listings.0.claim_grace_active', true)
                ->where('listings.0.claim_grace_ends_at', fn ($value) => is_string($value) && $value !== '')
                ->etc());
    }
}
