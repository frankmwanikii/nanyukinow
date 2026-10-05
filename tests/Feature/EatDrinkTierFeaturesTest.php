<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\EatDrinkTierFeatures;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EatDrinkTierFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private function seedEatDrinkCategory(): Category
    {
        return Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);
    }

    public function test_gallery_and_priority_limits_match_tiers(): void
    {
        $this->assertSame(3, EatDrinkTierFeatures::galleryLimit(Membership::FREE));
        $this->assertSame(10, EatDrinkTierFeatures::galleryLimit(Membership::STANDARD));
        $this->assertSame(30, EatDrinkTierFeatures::galleryLimit(Membership::PREMIUM));

        $this->assertSame(1, Membership::listingPriority(Membership::FREE));
        $this->assertSame(2, Membership::listingPriority(Membership::STANDARD));
        $this->assertSame(3, Membership::listingPriority(Membership::PREMIUM));
        $this->assertSame('Standard', Membership::badgeLabel(Membership::STANDARD));

        $this->assertSame(5, EatDrinkTierFeatures::cuisineTagLimit(Membership::FREE));
        $this->assertSame(10, EatDrinkTierFeatures::cuisineTagLimit(Membership::STANDARD));
        $this->assertNull(EatDrinkTierFeatures::cuisineTagLimit(Membership::PREMIUM));

        $this->assertSame(0, EatDrinkTierFeatures::menuLimit(Membership::FREE));
        $this->assertSame(5, EatDrinkTierFeatures::menuLimit(Membership::STANDARD));
        $this->assertSame(15, EatDrinkTierFeatures::menuLimit(Membership::PREMIUM));
        $this->assertSame(5, EatDrinkTierFeatures::menuImagesPerPage(Membership::STANDARD));
        $this->assertSame(15, EatDrinkTierFeatures::menuImagesPerPage(Membership::PREMIUM));
    }

    public function test_free_tier_strips_standard_and_premium_eat_drink_fields(): void
    {
        $payload = EatDrinkTierFeatures::applyToPayload([
            'description' => '<p>'.implode(' ', array_fill(0, 200, 'word')).'</p>',
            'latitude' => -0.02,
            'longitude' => 37.07,
            'email' => 'cafe@example.com',
            'whatsapp' => '0712345678',
            'website' => 'https://example.com',
            'social_links' => [
                'instagram' => 'https://instagram.com/cafe',
                'facebook' => null,
                'tiktok' => null,
                'youtube' => null,
                'links' => [['label' => 'Menu', 'url' => 'https://example.com/menu']],
            ],
            'gallery' => array_fill(0, 8, '/storage/a.jpg'),
            'details' => [
                'cuisine' => ['Kenyan', 'Italian', 'BBQ', 'Chinese', 'Indian', 'Coastal'],
                'payments' => ['M-Pesa', 'Cash'],
                'dietary' => ['Halal'],
                'menus' => [['title' => 'Lunch', 'image' => '/m.jpg']],
                'video_url' => 'https://youtube.com/watch?v=abc',
                'booking_url' => 'https://wa.me/254712345678',
                'deals' => [['title' => 'Happy hour']],
                'avg_meal' => 'KES 1,200',
                'capacity' => '80',
                'dress_code' => 'Smart casual',
            ],
        ], Membership::FREE, 'eatDrink');

        $this->assertNull($payload['latitude']);
        $this->assertNull($payload['longitude']);
        $this->assertNull($payload['email']);
        $this->assertNull($payload['whatsapp']);
        $this->assertNull($payload['website']);
        $this->assertCount(3, $payload['gallery']);
        $this->assertSame(
            ['Kenyan', 'Italian', 'BBQ', 'Chinese', 'Indian'],
            $payload['details']['cuisine'],
        );
        $this->assertArrayNotHasKey('payments', $payload['details']);
        $this->assertArrayNotHasKey('menus', $payload['details']);
        $this->assertArrayNotHasKey('video_url', $payload['details']);
        $this->assertArrayNotHasKey('booking_url', $payload['details']);
        $this->assertArrayNotHasKey('deals', $payload['details']);
        $this->assertLessThanOrEqual(
            EatDrinkTierFeatures::FREE_DESCRIPTION_WORD_LIMIT,
            EatDrinkTierFeatures::wordCount($payload['description']),
        );
    }

    public function test_free_user_cannot_persist_premium_eat_drink_fields(): void
    {
        Storage::fake('public');
        $category = $this->seedEatDrinkCategory();
        $user = User::factory()->create(['plan' => Membership::FREE]);

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Savanna Grill',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Restaurants', 'Bars & Lounges']),
            'location' => 'Nanyuki',
            'address' => 'Cedars Mall',
            'tagline' => 'Grill & chill',
            'description' => '<p>Short about</p>',
            'phone' => '0712345678',
            'email' => 'locked@example.com',
            'latitude' => -0.02,
            'longitude' => 37.07,
            'tier' => 'free',
            'amenities' => json_encode(['wifi']),
            'details' => json_encode([
                'cuisine' => ['Kenyan', 'BBQ', 'Extra', 'Chinese', 'Indian', 'Coastal'],
                'payments' => ['M-Pesa'],
                'video_url' => 'https://youtube.com/watch?v=abc',
                'booking_url' => 'https://wa.me/254700000000',
                'avg_meal' => 'KES 900',
            ]),
            'cover' => UploadedFile::fake()->image('cover.jpg'),
            'gallery_urls' => json_encode([
                '/storage/a.jpg',
                '/storage/b.jpg',
                '/storage/c.jpg',
                '/storage/d.jpg',
            ]),
            'social_links' => json_encode([
                'instagram' => 'https://instagram.com/savanna',
                'facebook' => '',
                'links' => [],
            ]),
        ])->assertRedirect(route('account.index'));

        $listing = Listing::query()->where('title', 'Savanna Grill')->first();
        $this->assertNotNull($listing);
        $this->assertSame(['Restaurants', 'Bars & Lounges'], $listing->subcategory);
        $this->assertSame(1, $listing->priority);
        $this->assertNull($listing->email);
        $this->assertNull($listing->latitude);
        $this->assertCount(3, $listing->gallery ?? []);
        $this->assertSame(
            ['Kenyan', 'BBQ', 'Extra', 'Chinese', 'Indian'],
            $listing->details['cuisine'] ?? null,
        );
        $this->assertArrayNotHasKey('video_url', $listing->details ?? []);
        $this->assertArrayNotHasKey('booking_url', $listing->details ?? []);
        $this->assertArrayNotHasKey('avg_meal', $listing->details ?? []);
    }

    public function test_premium_eat_drink_keeps_rich_fields(): void
    {
        Storage::fake('public');
        $category = $this->seedEatDrinkCategory();
        $user = User::factory()->create([
            'plan' => Membership::PREMIUM,
            'plan_expires_at' => now()->addMonth(),
        ]);

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Premium Terrace',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Restaurants']),
            'location' => 'Nanyuki',
            'description' => '<p>'.implode(' ', array_fill(0, 180, 'word')).'</p>',
            'phone' => '0711111111',
            'email' => 'hello@terrace.test',
            'latitude' => -0.01,
            'longitude' => 37.08,
            'tier' => 'premium',
            'amenities' => json_encode(['wifi']),
            'details' => json_encode([
                'cuisine' => ['Kenyan', 'Italian', 'BBQ'],
                'payments' => ['M-Pesa', 'Card'],
                'dietary' => ['Vegan'],
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'booking_url' => 'https://wa.me/254711111111',
                'deals' => [['title' => 'Happy hour', 'description' => '5–7pm']],
                'avg_meal' => 1500,
                'capacity' => ['indoors' => 80, 'outdoor' => 40],
                'dress_code' => ['Smart casual'],
                'event_schedule' => [['label' => 'Fri 8pm', 'value' => 'Live jazz']],
            ]),
            'cover' => UploadedFile::fake()->image('cover.jpg'),
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([
                'instagram' => 'https://instagram.com/terrace',
                'facebook' => 'https://facebook.com/terrace',
                'links' => [],
            ]),
        ])->assertRedirect(route('account.index'));

        $listing = Listing::query()->where('title', 'Premium Terrace')->first();
        $this->assertNotNull($listing);
        $this->assertSame(3, $listing->priority);
        $this->assertSame('hello@terrace.test', $listing->email);
        $this->assertNotNull($listing->latitude);
        $this->assertSame('https://www.youtube.com/watch?v=dQw4w9WgXcQ', $listing->details['video_url'] ?? null);
        $this->assertSame('https://wa.me/254711111111', $listing->details['booking_url'] ?? null);
        $this->assertSame(1500, $listing->details['avg_meal'] ?? null);
        $this->assertSame(['indoors' => 80, 'outdoor' => 40], $listing->details['capacity'] ?? null);
        $this->assertSame(['Smart casual'], $listing->details['dress_code'] ?? null);
        $this->assertNotEmpty($listing->details['deals'] ?? null);
        $this->assertGreaterThan(
            EatDrinkTierFeatures::FREE_DESCRIPTION_WORD_LIMIT,
            EatDrinkTierFeatures::wordCount($listing->description),
        );
    }
}
