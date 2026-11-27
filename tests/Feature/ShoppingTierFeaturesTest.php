<?php

namespace Tests\Feature;

use App\Support\Membership;
use App\Support\ShoppingTierFeatures;
use Tests\TestCase;

class ShoppingTierFeaturesTest extends TestCase
{
    public function test_gallery_and_product_limits_match_tiers(): void
    {
        $this->assertSame(0, ShoppingTierFeatures::galleryLimit(Membership::FREE));
        $this->assertSame(5, ShoppingTierFeatures::galleryLimit(Membership::STANDARD));
        $this->assertSame(50, ShoppingTierFeatures::galleryLimit(Membership::PREMIUM));

        $this->assertSame(0, ShoppingTierFeatures::productLimit(Membership::FREE));
        $this->assertSame(5, ShoppingTierFeatures::productLimit(Membership::STANDARD));
        $this->assertSame(50, ShoppingTierFeatures::productLimit(Membership::PREMIUM));

        $this->assertSame(0, ShoppingTierFeatures::productImagesPerItem(Membership::FREE));
        $this->assertSame(5, ShoppingTierFeatures::productImagesPerItem(Membership::STANDARD));
        $this->assertNull(ShoppingTierFeatures::productImagesPerItem(Membership::PREMIUM));
    }

    public function test_standard_tier_caps_product_images_premium_keeps_all(): void
    {
        $manyImages = array_map(
            static fn (int $i): string => "/storage/p{$i}.jpg",
            range(1, 12),
        );

        $standard = ShoppingTierFeatures::normalizeProducts([
            ['name' => 'Dress', 'images' => $manyImages],
        ], Membership::STANDARD);

        $this->assertCount(5, $standard[0]['images']);
        $this->assertSame('/storage/p1.jpg', $standard[0]['image']);

        $premium = ShoppingTierFeatures::normalizeProducts([
            ['name' => 'Dress', 'images' => $manyImages],
        ], Membership::PREMIUM);

        $this->assertCount(12, $premium[0]['images']);
        $this->assertSame('/storage/p1.jpg', $premium[0]['image']);
    }

    public function test_free_tier_strips_standard_and_premium_shopping_fields(): void
    {
        $payload = ShoppingTierFeatures::applyToPayload([
            'description' => '<p>'.implode(' ', array_fill(0, 200, 'word')).'</p>',
            'tagline' => 'Best kitenge in town',
            'latitude' => -0.02,
            'longitude' => 37.07,
            'email' => 'shop@example.com',
            'phone' => '0712345678',
            'whatsapp' => '0712345678',
            'website' => 'https://example.com',
            'logo_url' => '/storage/logo.png',
            'amenities' => ['parking'],
            'social_links' => [
                'instagram' => 'https://instagram.com/shop',
                'facebook' => 'https://facebook.com/shop',
                'tiktok' => null,
                'youtube' => null,
                'links' => [['label' => 'Shop', 'url' => 'https://example.com']],
            ],
            'gallery' => array_fill(0, 8, '/storage/a.jpg'),
            'details' => [
                'specialty' => 'Fabrics',
                'brands' => ['Local artisans'],
                'delivery_options' => ['In-store pickup'],
                'return_policy' => '<p>7-day exchange</p>',
                'wholesale_retail' => ['Retail only'],
                'payments' => ['M-Pesa'],
                'products' => [['name' => 'Kitenge']],
                'video_url' => 'https://youtube.com/watch?v=abc',
                'whatsapp_catalog_url' => 'https://wa.me/c/123',
                'online_store_url' => 'https://shop.example.com',
                'price_list_pdf' => 'https://example.com/list.pdf',
                'made_to_order' => 'Show made-to-order badge',
                'deals' => [['title' => 'Sale']],
            ],
        ], Membership::FREE, 'shopping');

        $this->assertSame(150, ShoppingTierFeatures::wordCount($payload['description']));
        $this->assertNull($payload['tagline']);
        $this->assertNull($payload['latitude']);
        $this->assertNull($payload['email']);
        $this->assertNull($payload['logo_url']);
        $this->assertSame([], $payload['amenities']);
        $this->assertNull($payload['social_links']['instagram']);
        $this->assertSame([], $payload['gallery']);
        $this->assertNull($payload['details']);
    }

    public function test_standard_tier_keeps_showcase_fields_and_caps_gallery(): void
    {
        $payload = ShoppingTierFeatures::applyToPayload([
            'tagline' => 'Smartphones & accessories',
            'email' => 'shop@example.com',
            'gallery' => array_fill(0, 8, '/storage/a.jpg'),
            'details' => [
                'specialty' => 'Electronics',
                'products' => array_fill(0, 8, ['name' => 'Phone']),
                'video_url' => 'https://youtube.com/watch?v=abc',
                'deals' => [['title' => 'Sale']],
            ],
        ], Membership::STANDARD, 'shopping');

        $this->assertSame('Smartphones & accessories', $payload['tagline']);
        $this->assertCount(5, $payload['gallery']);
        $this->assertCount(5, $payload['details']['products']);
        $this->assertArrayNotHasKey('video_url', $payload['details']);
        $this->assertArrayNotHasKey('deals', $payload['details']);
    }

    public function test_premium_tier_keeps_conversion_fields(): void
    {
        $payload = ShoppingTierFeatures::applyToPayload([
            'whatsapp' => '0712345678',
            'website' => 'https://example.com',
            'gallery' => array_fill(0, 60, '/storage/a.jpg'),
            'details' => [
                'video_url' => 'https://youtube.com/watch?v=abc',
                'deals' => [['title' => 'Sale']],
                'products' => array_fill(0, 60, ['name' => 'Item']),
            ],
        ], Membership::PREMIUM, 'shopping');

        $this->assertSame('0712345678', $payload['whatsapp']);
        $this->assertCount(50, $payload['gallery']);
        $this->assertArrayHasKey('video_url', $payload['details']);
        $this->assertArrayHasKey('deals', $payload['details']);
        $this->assertCount(50, $payload['details']['products']);
    }
}
