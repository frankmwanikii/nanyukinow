<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Listing;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ListingSeeder extends Seeder
{
    public function run(): void
    {
        $path = base_path('listings_seed.json');

        if (! is_file($path)) {
            $this->command?->warn('listings_seed.json not found — skipping listing seed.');

            return;
        }

        /** @var array{categories: list<array{name: string, slug: string}>, listings: list<array<string, mixed>>} $data */
        $data = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        $categoryIds = [];

        foreach ($data['categories'] as $index => $category) {
            $model = Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'icon' => null,
                    'sort_order' => $index,
                ],
            );
            $categoryIds[$category['slug']] = $model->id;
        }

        foreach ($data['listings'] as $listing) {
            $slug = $listing['slug'] ?: Str::slug($listing['title']);

            Listing::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $categoryIds[$listing['category_slug']] ?? null,
                    'title' => $listing['title'],
                    'location' => $listing['location'],
                    'description' => $listing['description'],
                    'image_url' => $listing['image_url'],
                    'logo_url' => $listing['logo_url'],
                    'rating' => null,
                    'likes_count' => 0,
                    'is_featured' => (bool) ($listing['is_featured'] ?? false),
                    'is_trending' => (bool) ($listing['is_trending'] ?? false),
                    'is_published' => true,
                ],
            );
        }
    }
}
