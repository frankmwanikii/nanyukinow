<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\Membership;
use App\Support\StayTierFeatures;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StayTierFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private function seedStayCategory(): Category
    {
        return Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 2,
        ]);
    }

    public function test_gallery_limits_match_tiers(): void
    {
        $this->assertSame(0, StayTierFeatures::galleryLimit(Membership::FREE));
        $this->assertSame(10, StayTierFeatures::galleryLimit(Membership::STANDARD));
        $this->assertSame(50, StayTierFeatures::galleryLimit(Membership::PREMIUM));
        $this->assertSame(1, Membership::listingPriority(Membership::FREE));
        $this->assertSame(2, Membership::listingPriority(Membership::STANDARD));
        $this->assertSame(3, Membership::listingPriority(Membership::PREMIUM));
    }

    public function test_free_tier_strips_standard_and_premium_stay_fields(): void
    {
        $payload = StayTierFeatures::applyToPayload([
            'description' => '<p>'.implode(' ', array_fill(0, 200, 'word')).'</p>',
            'latitude' => -0.02,
            'longitude' => 37.07,
            'email' => 'lodge@example.com',
            'phone' => '0712345678',
            'whatsapp' => '0712345678',
            'website' => 'https://example.com',
            'amenities' => ['wifi', 'pool'],
            'hours' => [['day' => 'Monday', 'open' => '08:00', 'close' => '18:00']],
            'social_links' => [
                'instagram' => 'https://instagram.com/lodge',
                'facebook' => null,
                'tiktok' => null,
                'youtube' => null,
                'links' => [],
            ],
            'gallery' => [
                ['src' => '/storage/a.jpg', 'kind' => 'bedroom', 'label' => 'Bedroom'],
                '/storage/b.jpg',
            ],
            'details' => [
                'guests' => '4',
                'rooms' => '2',
                'check_in' => '14:00',
                'check_out' => '10:00',
                'nightly_rate' => 'KES 8,500',
                'meal_plan' => 'B&B',
                'payments' => ['M-Pesa'],
                'house_rules' => '<p>No smoking</p>',
                'cancellation_policy' => 'Non-refundable',
                'video_url' => 'https://youtube.com/watch?v=abc',
                'booking_url' => 'https://airbnb.com/rooms/1',
                'included' => ['Game drives'],
                'deals' => [['title' => 'Resident rate']],
                'nearby_attractions' => ['Ol Pejeta'],
                'host_name' => 'Jane',
            ],
            'price_range' => '$$$$',
        ], Membership::FREE, 'stay');

        $this->assertNull($payload['latitude']);
        $this->assertNull($payload['longitude']);
        $this->assertSame('lodge@example.com', $payload['email']);
        $this->assertSame('0712345678', $payload['phone']);
        $this->assertNull($payload['whatsapp']);
        $this->assertNull($payload['website']);
        $this->assertSame([], $payload['amenities']);
        $this->assertNull($payload['hours']);
        $this->assertSame([], $payload['gallery']);
        $this->assertSame('$$$', $payload['price_range']);
        $this->assertSame('4', $payload['details']['guests'] ?? null);
        $this->assertArrayNotHasKey('check_in', $payload['details']);
        $this->assertArrayNotHasKey('nightly_rate', $payload['details']);
        $this->assertArrayNotHasKey('video_url', $payload['details']);
        $this->assertArrayNotHasKey('booking_url', $payload['details']);
        $this->assertLessThanOrEqual(
            StayTierFeatures::FREE_DESCRIPTION_WORD_LIMIT,
            StayTierFeatures::wordCount($payload['description']),
        );
    }

    public function test_free_user_cannot_persist_premium_stay_fields(): void
    {
        Storage::fake('public');
        $category = $this->seedStayCategory();
        $user = User::factory()->create(['plan' => Membership::FREE]);

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Highland Cottage',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Airbnbs']),
            'location' => 'Nanyuki',
            'address' => 'Timau Road',
            'tagline' => 'Quiet cottage',
            'description' => '<p>Short about</p>',
            'phone' => '0712345678',
            'email' => 'host@example.com',
            'latitude' => -0.02,
            'longitude' => 37.07,
            'tier' => 'free',
            'amenities' => json_encode(['wifi']),
            'details' => json_encode([
                'guests' => '4',
                'rooms' => '2',
                'beds' => '3',
                'baths' => '1',
                'check_in' => '14:00',
                'nightly_rate' => 'KES 7,000',
                'video_url' => 'https://youtube.com/watch?v=abc',
                'booking_url' => 'https://airbnb.com/rooms/9',
                'host_name' => 'Alex',
            ]),
            'cover' => UploadedFile::fake()->image('cover.jpg'),
            'gallery_urls' => json_encode([
                ['src' => '/storage/a.jpg', 'kind' => 'bedroom', 'label' => 'Bedroom'],
                '/storage/b.jpg',
            ]),
            'social_links' => json_encode([
                'instagram' => 'https://instagram.com/cottage',
                'facebook' => '',
                'links' => [],
            ]),
        ])->assertRedirect(route('account.index'));

        $listing = Listing::query()->where('title', 'Highland Cottage')->first();
        $this->assertNotNull($listing);
        $this->assertSame(1, $listing->priority);
        $this->assertSame('host@example.com', $listing->email);
        $this->assertNull($listing->latitude);
        $this->assertSame([], $listing->gallery ?? []);
        $this->assertSame([], $listing->amenities ?? []);
        $this->assertSame('4', $listing->details['guests'] ?? null);
        $this->assertArrayNotHasKey('check_in', $listing->details ?? []);
        $this->assertArrayNotHasKey('video_url', $listing->details ?? []);
        $this->assertArrayNotHasKey('booking_url', $listing->details ?? []);
        $this->assertArrayNotHasKey('host_name', $listing->details ?? []);
    }

    public function test_premium_stay_keeps_rich_fields_and_categorized_gallery(): void
    {
        Storage::fake('public');
        $category = $this->seedStayCategory();
        $user = User::factory()->create([
            'plan' => Membership::PREMIUM,
            'plan_expires_at' => now()->addMonth(),
        ]);

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Safari Lodge Premium',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Safari Lodges']),
            'location' => 'Nanyuki',
            'description' => '<p>'.implode(' ', array_fill(0, 180, 'word')).'</p>',
            'phone' => '0711111111',
            'email' => 'hello@lodge.test',
            'whatsapp' => '0711111111',
            'latitude' => -0.01,
            'longitude' => 37.08,
            'tier' => 'premium',
            'amenities' => json_encode(['wifi', 'pool']),
            'details' => json_encode([
                'guests' => '8',
                'rooms' => '4',
                'check_in' => '14:00',
                'check_out' => '10:00',
                'nightly_rate' => 'KES 25,000',
                'meal_plan' => 'Full board',
                'payments' => ['M-Pesa', 'Card'],
                'cancellation_policy' => 'Free cancellation up to 48 hours before check-in',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'booking_url' => 'https://book.lodge.test',
                'included' => ['Game drives', 'Spa access'],
                'deals' => [['title' => 'Resident weekend', 'description' => '15% off']],
                'nearby_attractions' => ['Ol Pejeta Conservancy'],
                'host_name' => 'Sam',
                'host_bio' => '<p>Local host</p>',
            ]),
            'cover' => UploadedFile::fake()->image('cover.jpg'),
            'gallery_urls' => json_encode([
                ['src' => '/storage/bed.jpg', 'kind' => 'bedroom', 'label' => 'Bedroom'],
                ['src' => '/storage/kit.jpg', 'kind' => 'kitchen', 'label' => 'Kitchen'],
            ]),
            'social_links' => json_encode([
                'instagram' => 'https://instagram.com/lodge',
                'facebook' => 'https://facebook.com/lodge',
                'links' => [],
            ]),
        ])->assertRedirect(route('account.index'));

        $listing = Listing::query()->where('title', 'Safari Lodge Premium')->first();
        $this->assertNotNull($listing);
        $this->assertSame(3, $listing->priority);
        $this->assertSame('hello@lodge.test', $listing->email);
        $this->assertNotNull($listing->latitude);
        $this->assertCount(2, $listing->gallery ?? []);
        $this->assertSame('bedroom', $listing->gallery[0]['kind'] ?? null);
        $this->assertSame('https://www.youtube.com/watch?v=dQw4w9WgXcQ', $listing->details['video_url'] ?? null);
        $this->assertSame('https://book.lodge.test', $listing->details['booking_url'] ?? null);
        $this->assertSame(['Game drives', 'Spa access'], $listing->details['included'] ?? null);
        $this->assertSame('Sam', $listing->details['host_name'] ?? null);
        $this->assertGreaterThan(
            StayTierFeatures::FREE_DESCRIPTION_WORD_LIMIT,
            StayTierFeatures::wordCount($listing->description),
        );
    }
}
