<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ServicesListingTabsTest extends TestCase
{
    use RefreshDatabase;

    private function servicesCategory(): Category
    {
        return Category::query()->firstOrCreate(
            ['slug' => 'services'],
            ['name' => 'Services', 'sort_order' => 4],
        );
    }

    private function makeServicesListing(User $owner, array $details = []): Listing
    {
        return Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $this->servicesCategory()->id,
            'title' => 'Highland Auto Care',
            'slug' => 'highland-auto-care',
            'location' => 'Nanyuki',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'tier' => Membership::PREMIUM,
            'priority' => 3,
            'details' => $details,
        ]);
    }

    public function test_account_store_keeps_priced_services_and_portfolio_for_standard_tier(): void
    {
        $user = User::factory()->create([
            'plan' => Membership::STANDARD,
        ]);
        $category = $this->servicesCategory();

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Town Electricians',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Repairs']),
            'location' => 'Nanyuki',
            'city' => 'Nanyuki',
            'description' => '<p>Licensed electrical work</p>',
            'phone' => '0712345678',
            'tier' => Membership::STANDARD,
            'details' => json_encode([
                'service_area' => 'Nanyuki & Timau',
                'services' => [
                    [
                        'name' => 'Fault finding',
                        'category' => 'Repairs',
                        'price' => 3500,
                        'currency' => 'KES',
                        'description' => '<p>Diagnostics and report</p>',
                        'images' => ['/storage/fault.jpg'],
                        'image' => '/storage/fault.jpg',
                    ],
                ],
                'portfolio' => [
                    [
                        'title' => 'Lodge rewiring',
                        'url' => 'https://example.com/lodge',
                        'description' => 'Full lodge electrical upgrade',
                        'images' => ['/storage/lodge.jpg'],
                        'image' => '/storage/lodge.jpg',
                    ],
                ],
            ]),
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([]),
            'amenities' => json_encode([]),
        ])->assertRedirect(route('account.listings.index'));

        $listing = Listing::query()->where('title', 'Town Electricians')->first();
        $this->assertNotNull($listing);
        $this->assertSame('Fault finding', $listing->details['services'][0]['name']);
        $this->assertSame(3500, $listing->details['services'][0]['price']);
        $this->assertSame('KES', $listing->details['services'][0]['currency']);
        $this->assertSame('Lodge rewiring', $listing->details['portfolio'][0]['title']);
        $this->assertSame('/storage/lodge.jpg', $listing->details['portfolio'][0]['image']);
    }

    public function test_public_listing_includes_services_and_portfolio_payload(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeServicesListing($owner, [
            'services' => [
                [
                    'name' => 'Full service',
                    'category' => 'Maintenance',
                    'price' => 8500,
                    'currency' => 'KES',
                    'description' => '<p>Oil, filters, and check</p>',
                    'images' => ['/storage/service.jpg'],
                    'image' => '/storage/service.jpg',
                ],
            ],
            'portfolio' => [
                [
                    'title' => 'Safari fleet prep',
                    'url' => 'https://example.com/fleet',
                    'description' => 'Pre-safari servicing',
                    'images' => ['/storage/fleet.jpg'],
                    'image' => '/storage/fleet.jpg',
                ],
            ],
        ]);

        $this->get(route('listings.show', $listing->slug))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Listings/Show')
                ->where('listing.details.services.0.name', 'Full service')
                ->where('listing.details.services.0.price', 8500)
                ->where('listing.details.portfolio.0.title', 'Safari fleet prep')
                ->where('listing.details.portfolio.0.image', '/storage/fleet.jpg'));
    }

    public function test_free_tier_strips_services_and_portfolio_on_update(): void
    {
        $owner = User::factory()->create([
            'plan' => Membership::PREMIUM,
        ]);
        $listing = $this->makeServicesListing($owner, [
            'services' => [
                ['name' => 'Should strip', 'price' => 1000, 'currency' => 'KES'],
            ],
            'portfolio' => [
                ['title' => 'Should strip', 'url' => 'https://example.com'],
            ],
        ]);

        $this->actingAs($owner)->put(route('account.listings.update', $listing), [
            'title' => $listing->title,
            'category_id' => $listing->category_id,
            'subcategory' => json_encode(['Repairs']),
            'location' => 'Nanyuki',
            'city' => 'Nanyuki',
            'description' => '<p>Basic listing</p>',
            'phone' => '0712345678',
            'tier' => Membership::FREE,
            'details' => json_encode([
                'service_area' => 'Nanyuki',
                'services' => [
                    ['name' => 'Should strip', 'price' => 1000, 'currency' => 'KES'],
                ],
                'portfolio' => [
                    ['title' => 'Should strip', 'url' => 'https://example.com'],
                ],
            ]),
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([]),
            'amenities' => json_encode([]),
        ])->assertRedirect();

        $fresh = $listing->fresh();
        $this->assertSame('Nanyuki', $fresh->details['service_area'] ?? null);
        $this->assertArrayNotHasKey('services', $fresh->details ?? []);
        $this->assertArrayNotHasKey('portfolio', $fresh->details ?? []);
    }
}
