<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\ListingMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ListingRemoteImageUrlTest extends TestCase
{
    use RefreshDatabase;

    private function seedCategories(): void
    {
        Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);
    }

    public function test_long_instagram_cdn_cover_url_saves_without_server_error(): void
    {
        Storage::fake('public');
        $this->seedCategories();

        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            true,
        );
        $this->assertNotFalse($png);

        $remote = 'https://scontent.cdninstagram.com/v/t51.2885-15/'.str_repeat('a', 400)
            .'/123456789_987654321_1111111111111111111_n.jpg'
            .'?stp=dst-jpg_e35&_nc_ht=scontent.cdninstagram.com&_nc_cat=1&edm=APs17CUBAAAA'
            .'&ccb=7-5&oh='.str_repeat('b', 80).'&oe='.str_repeat('c', 40)
            .'&_nc_sid='.str_repeat('d', 40);

        $this->assertGreaterThan(255, strlen($remote));

        Http::fake([
            'scontent.cdninstagram.com/*' => Http::response($png, 200, ['Content-Type' => 'image/png']),
        ]);

        $user = User::factory()->create(['plan' => 'featured']);
        $category = Category::query()->where('slug', 'eatDrink')->firstOrFail();

        $response = $this->actingAs($user)->postJson(route('account.listings.draft'), [
            'category_id' => $category->id,
            'title' => 'Instagram Cover Cafe',
            'location' => 'Nanyuki',
            'tier' => 'featured',
            'image_url' => $remote,
        ]);

        $response->assertOk();

        $saved = $response->json('listing.image_url');
        $this->assertIsString($saved);
        $this->assertStringStartsWith('/storage/listings/covers/', $saved);

        $listing = Listing::query()->findOrFail($response->json('listing.id'));
        $this->assertSame($saved, $listing->image_url);
        $this->assertLessThanOrEqual(255, strlen((string) $listing->image_url));
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $saved));
    }

    public function test_persist_public_url_falls_back_to_remote_when_download_fails(): void
    {
        Storage::fake('public');

        $remote = 'https://scontent.cdninstagram.com/v/t51.2885-15/'.str_repeat('x', 500).'.jpg?oh=1';
        Http::fake([
            'scontent.cdninstagram.com/*' => Http::response('nope', 403),
        ]);

        $saved = ListingMedia::persistPublicUrl($remote, 'listings/covers');

        $this->assertSame($remote, $saved);
        $this->assertGreaterThan(255, strlen((string) $saved));
    }
}
