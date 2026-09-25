<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminClaimsTest extends TestCase
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
            'title' => 'Trout Tree',
            'slug' => 'trout-tree-claim-test',
            'location' => 'Nanyuki',
            'status' => 'published',
            'is_published' => true,
            'claim_status' => 'unclaimed',
        ], $overrides));
    }

    public function test_guest_can_submit_a_listing_claim(): void
    {
        Storage::fake('public');
        $listing = $this->makeListing();

        $response = $this->post(route('listings.claim', $listing->slug), [
            'first_name' => 'Jane',
            'last_name' => 'Wanjiru',
            'email' => 'jane@example.com',
            'phone' => '+254700000000',
            'reason' => 'I own this restaurant and can provide business documents.',
            'confirmed' => '1',
            'documents' => [
                UploadedFile::fake()->image('license.jpg'),
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('listing_claims', [
            'listing_id' => $listing->id,
            'email' => 'jane@example.com',
            'status' => ListingClaim::STATUS_PENDING,
        ]);
        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'claim_status' => 'pending',
        ]);
    }

    public function test_admin_claims_index_lists_pending_claims(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing();

        ListingClaim::query()->create([
            'listing_id' => $listing->id,
            'first_name' => 'Jane',
            'last_name' => 'Wanjiru',
            'email' => 'jane@example.com',
            'phone' => '+254700000000',
            'reason' => 'I manage this place.',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.claims.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Claims/Index')
                ->where('filters.status', 'pending')
                ->has('claims.data', 1)
                ->where('counts.pending', 1)
                ->etc());
    }

    public function test_admin_can_approve_a_claim(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing(['claim_status' => 'pending']);

        $claim = ListingClaim::query()->create([
            'listing_id' => $listing->id,
            'first_name' => 'Jane',
            'last_name' => 'Wanjiru',
            'email' => 'jane.owner@example.com',
            'phone' => '+254711111111',
            'reason' => 'I own this business.',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.claims.approve', $claim), [
                'admin_notes' => 'Documents look good.',
            ])
            ->assertRedirect(route('admin.claims.index', ['status' => 'pending']));

        $claim->refresh();
        $listing->refresh();

        $this->assertSame(ListingClaim::STATUS_APPROVED, $claim->status);
        $this->assertSame('claimed', $listing->claim_status);
        $this->assertNotNull($listing->user_id);
        $this->assertDatabaseHas('users', [
            'email' => 'jane.owner@example.com',
            'id' => $listing->user_id,
        ]);
    }

    public function test_admin_can_reject_a_claim(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing(['claim_status' => 'pending']);

        $claim = ListingClaim::query()->create([
            'listing_id' => $listing->id,
            'first_name' => 'Sam',
            'last_name' => 'Otieno',
            'email' => 'sam@example.com',
            'phone' => '+254722222222',
            'reason' => 'Please give me this listing.',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.claims.reject', $claim), [
                'admin_notes' => 'Insufficient proof of ownership.',
            ])
            ->assertRedirect(route('admin.claims.index', ['status' => 'pending']));

        $this->assertDatabaseHas('listing_claims', [
            'id' => $claim->id,
            'status' => ListingClaim::STATUS_REJECTED,
        ]);
        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'claim_status' => 'unclaimed',
        ]);
    }

    public function test_pending_claims_count_is_shared_with_admin(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing(['claim_status' => 'pending']);

        ListingClaim::query()->create([
            'listing_id' => $listing->id,
            'first_name' => 'A',
            'last_name' => 'B',
            'email' => 'ab@example.com',
            'phone' => '0700',
            'reason' => 'Owner',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('pendingClaims', 1)
                ->etc());
    }
}
