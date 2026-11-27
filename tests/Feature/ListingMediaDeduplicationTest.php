<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\ListingMedia;
use App\Support\MediaDeduplicator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ListingMediaDeduplicationTest extends TestCase
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

    public function test_import_from_url_reuses_existing_file_with_same_bytes(): void
    {
        Storage::fake('public');
        $png = $this->pngBytes();

        Http::fake([
            'cdn.example.test/*' => Http::response($png, 200, [
                'Content-Type' => 'image/png',
            ]),
        ]);

        $first = ListingMedia::importFromUrl(
            'https://cdn.example.test/one.png',
            'listings/gallery',
        );
        $second = ListingMedia::importFromUrl(
            'https://cdn.example.test/two.png',
            'listings/gallery',
        );

        $this->assertIsString($first);
        $this->assertSame($first, $second);
        $this->assertCount(
            1,
            collect(Storage::disk('public')->allFiles('listings/gallery'))
                ->filter(fn (string $path) => ! str_ends_with($path, '.json'))
                ->values(),
        );
    }

    public function test_store_upload_reuses_existing_identical_image(): void
    {
        Storage::fake('public');
        $png = $this->pngBytes();

        $first = ListingMedia::store(
            UploadedFile::fake()->createWithContent('a.png', $png),
            'listings/gallery',
        );
        $second = ListingMedia::store(
            UploadedFile::fake()->createWithContent('b.png', $png),
            'listings/gallery',
        );

        $this->assertSame($first, $second);
        $this->assertCount(
            1,
            collect(Storage::disk('public')->allFiles('listings/gallery'))
                ->filter(fn (string $path) => ! str_ends_with($path, '.json'))
                ->values(),
        );
    }

    public function test_dedupe_command_collapses_duplicate_files_and_rewrites_refs(): void
    {
        Storage::fake('public');
        $png = $this->pngBytes();

        Storage::disk('public')->put('listings/gallery/keep.webp', $png);
        Storage::disk('public')->put('listings/gallery/dup.webp', $png);

        $category = Category::query()->create([
            'name' => 'Shopping',
            'slug' => 'shopping',
            'sort_order' => 1,
        ]);
        $user = User::factory()->create();
        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Dup Shop',
            'slug' => 'dup-shop',
            'location' => 'Nanyuki',
            'status' => 'published',
            'is_published' => true,
            'tier' => 'premium',
            'image_url' => '/storage/listings/gallery/dup.webp',
            'gallery' => [
                '/storage/listings/gallery/dup.webp',
                '/storage/listings/gallery/keep.webp',
            ],
            'details' => [
                'products' => [
                    [
                        'name' => 'Item',
                        'image' => '/storage/listings/gallery/dup.webp',
                        'images' => [
                            '/storage/listings/gallery/dup.webp',
                            '/storage/listings/gallery/keep.webp',
                        ],
                    ],
                ],
            ],
        ]);

        $this->artisan('listings:dedupe-media')
            ->assertSuccessful();

        $listing->refresh();

        $remaining = collect(Storage::disk('public')->allFiles('listings/gallery'))
            ->filter(fn (string $path) => ! str_ends_with($path, '.json'))
            ->values();
        $this->assertCount(1, $remaining);

        $keeperUrl = '/storage/'.$remaining[0];
        $this->assertSame($keeperUrl, $listing->image_url);
        $this->assertSame([$keeperUrl, $keeperUrl], $listing->gallery);
        $this->assertSame($keeperUrl, $listing->details['products'][0]['image']);
        $this->assertSame(
            [$keeperUrl, $keeperUrl],
            $listing->details['products'][0]['images'],
        );
    }

    public function test_dedupe_command_dry_run_does_not_delete(): void
    {
        Storage::fake('public');
        $png = $this->pngBytes();
        Storage::disk('public')->put('listings/gallery/a.webp', $png);
        Storage::disk('public')->put('listings/gallery/b.webp', $png);

        $this->artisan('listings:dedupe-media', ['--dry-run' => true])
            ->assertSuccessful();

        Storage::disk('public')->assertExists('listings/gallery/a.webp');
        Storage::disk('public')->assertExists('listings/gallery/b.webp');

        $result = MediaDeduplicator::collapseDuplicates(dryRun: true);
        $this->assertSame(1, $result['groups']);
        $this->assertSame(1, $result['files_removed']);
    }
}
