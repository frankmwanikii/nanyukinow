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

class MigrateListingRemoteMediaCommandTest extends TestCase
{
    use RefreshDatabase;

    private function pngBytes(): string
    {
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            true,
        );
        $this->assertNotFalse($png);

        return $png;
    }

    private function listingWithRemotes(): Listing
    {
        $category = Category::query()->create([
            'name' => 'Shopping',
            'slug' => 'shopping',
            'sort_order' => 1,
        ]);
        $user = User::factory()->create();

        return Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Remote Media Shop',
            'slug' => 'remote-media-shop',
            'location' => 'Nanyuki',
            'status' => 'published',
            'is_published' => true,
            'tier' => 'featured',
            'image_url' => 'https://cdn.example.test/cover.png',
            'logo_url' => 'https://cdn.example.test/logo.png',
            'gallery' => [
                'https://cdn.example.test/g1.png',
                [
                    'src' => 'https://cdn.example.test/g2.png',
                    'label' => 'Interior',
                    'kind' => 'interior',
                ],
            ],
        ]);
    }

    public function test_persist_public_url_skips_unchanged_remote(): void
    {
        Storage::fake('public');
        $remote = 'https://cdn.example.test/cover.png';

        Http::fake([
            'cdn.example.test/*' => Http::response('should-not-run', 500),
        ]);

        $saved = ListingMedia::persistPublicUrl($remote, 'listings/covers', $remote);

        $this->assertSame($remote, $saved);
        Http::assertNothingSent();
    }

    public function test_persist_public_url_imports_when_remote_changes(): void
    {
        Storage::fake('public');
        $previous = 'https://cdn.example.test/old.png';
        $next = 'https://cdn.example.test/new.png';

        Http::fake([
            'cdn.example.test/new.png' => Http::response($this->pngBytes(), 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);

        $saved = ListingMedia::persistPublicUrl($next, 'listings/covers', $previous);

        $this->assertIsString($saved);
        $this->assertStringStartsWith('/storage/listings/covers/', $saved);
        Http::assertSentCount(1);
    }

    public function test_migrate_command_localizes_remote_media(): void
    {
        Storage::fake('public');
        $listing = $this->listingWithRemotes();

        Http::fake([
            'cdn.example.test/*' => Http::response($this->pngBytes(), 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);

        $this->artisan('listings:migrate-remote-media', ['--id' => $listing->id])
            ->assertSuccessful();

        $listing->refresh();

        $this->assertStringStartsWith('/storage/listings/covers/', (string) $listing->image_url);
        $this->assertStringStartsWith('/storage/listings/logos/', (string) $listing->logo_url);
        $this->assertStringStartsWith('/storage/listings/gallery/', (string) $listing->gallery[0]);
        $this->assertStringStartsWith('/storage/listings/gallery/', (string) $listing->gallery[1]['src']);
        $this->assertSame('Interior', $listing->gallery[1]['label']);
    }

    public function test_migrate_command_dry_run_does_not_write_or_download(): void
    {
        Storage::fake('public');
        $listing = $this->listingWithRemotes();
        $before = $listing->image_url;

        Http::fake([
            'cdn.example.test/*' => Http::response($this->pngBytes(), 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);

        $this->artisan('listings:migrate-remote-media', [
            '--id' => $listing->id,
            '--dry-run' => true,
        ])->assertSuccessful();

        $listing->refresh();
        $this->assertSame($before, $listing->image_url);
        Http::assertNothingSent();
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_account_draft_save_does_not_redownload_unchanged_remote_cover(): void
    {
        Storage::fake('public');
        $category = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);
        $user = User::factory()->create(['plan' => 'featured']);
        $remote = 'https://cdn.example.test/stuck-cover.png';

        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Stuck Cover Cafe',
            'slug' => 'stuck-cover-cafe',
            'location' => 'Nanyuki',
            'status' => 'draft',
            'is_published' => false,
            'tier' => 'featured',
            'image_url' => $remote,
        ]);

        Http::fake([
            'cdn.example.test/*' => Http::response('nope', 403),
        ]);

        $this->actingAs($user)
            ->postJson(route('account.listings.draft.update', $listing->slug), [
                'category_id' => $category->id,
                'title' => 'Stuck Cover Cafe',
                'location' => 'Nanyuki',
                'tier' => 'featured',
                'image_url' => $remote,
            ])
            ->assertOk();

        Http::assertNothingSent();
        $this->assertSame($remote, $listing->fresh()->image_url);
    }
}
