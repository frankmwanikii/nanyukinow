<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUnlimitedListingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_listings_beyond_plan_limit(): void
    {
        $admin = User::factory()->admin()->create([
            'plan' => Membership::FREE,
        ]);
        $category = Category::query()->first()
            ?? Category::query()->create([
                'name' => 'Stay',
                'slug' => 'stay-admin-unlimited-'.uniqid(),
                'sort_order' => 1,
            ]);

        $limit = Membership::listingLimit(Membership::FREE);

        for ($i = 0; $i < $limit + 2; $i++) {
            Listing::query()->create([
                'user_id' => $admin->id,
                'category_id' => $category->id,
                'title' => 'Admin Lodge '.$i,
                'slug' => 'admin-lodge-'.$i.'-'.uniqid(),
                'status' => 'published',
                'tier' => Membership::FREE,
                'claim_status' => 'claimed',
                'is_published' => true,
            ]);
        }

        $this->assertTrue(Membership::canCreateListing($admin));
        $this->assertSame(PHP_INT_MAX, Membership::remainingSlots($admin));

        $summary = Membership::planSummary($admin);
        $this->assertTrue($summary['unlimited_listings']);
        $this->assertNull($summary['listing_limit']);
        $this->assertTrue($summary['can_create']);
        $this->assertSame(
            [Membership::FREE, Membership::STANDARD, Membership::PREMIUM],
            $summary['allowed_tiers'],
        );

        $this->actingAs($admin)
            ->get(route('account.listings.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Account/Listings/Form')
                ->where('plan.unlimited_listings', true)
                ->where('plan.can_create', true)
                ->where('allowedTiers', [
                    Membership::FREE,
                    Membership::STANDARD,
                    Membership::PREMIUM,
                ]));

        $this->actingAs($admin)
            ->post(route('account.listings.store'), [
                'title' => 'Extra Admin Spot',
                'category_id' => $category->id,
                'location' => 'Nanyuki',
                'status' => 'pending',
                'tier' => Membership::PREMIUM,
                'claim_status' => 'claimed',
                'is_published' => false,
                'is_featured' => true,
                'is_trending' => false,
                'priority' => 3,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('listings', [
            'user_id' => $admin->id,
            'title' => 'Extra Admin Spot',
            'tier' => Membership::PREMIUM,
        ]);
    }

    public function test_member_still_hits_listing_limit(): void
    {
        $member = User::factory()->create([
            'plan' => Membership::FREE,
            'is_admin' => false,
        ]);
        $category = Category::query()->first()
            ?? Category::query()->create([
                'name' => 'Eat',
                'slug' => 'eat-admin-unlimited-'.uniqid(),
                'sort_order' => 1,
            ]);

        Listing::query()->create([
            'user_id' => $member->id,
            'category_id' => $category->id,
            'title' => 'Member Spot',
            'slug' => 'member-spot-'.uniqid(),
            'status' => 'published',
            'tier' => Membership::FREE,
            'claim_status' => 'claimed',
            'is_published' => true,
        ]);

        $this->assertFalse(Membership::canCreateListing($member));

        $this->actingAs($member)
            ->get(route('account.listings.create'))
            ->assertRedirect(route('account.listings.index'));
    }
}
