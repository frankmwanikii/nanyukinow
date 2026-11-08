<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Listing;
use App\Support\ListingSlug;
use App\Support\Membership;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class PremiumTownListingsSeeder extends Seeder
{
    public function run(): void
    {
        $path = storage_path('app/premium_town_listings.json');

        if (! File::exists($path)) {
            $this->command?->error('Missing storage/app/premium_town_listings.json');

            return;
        }

        /** @var list<array<string, mixed>> $rows */
        $rows = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);

        $categoryIds = Category::query()->pluck('id', 'slug');
        $created = 0;

        foreach ($rows as $row) {
            $categoryId = $categoryIds[$row['category_slug']] ?? null;

            if (! $categoryId) {
                $this->command?->warn('Skipping '.$row['title'].': unknown category '.$row['category_slug']);

                continue;
            }

            $existing = Listing::query()
                ->where('title', $row['title'])
                ->where('location', $row['location'])
                ->where('category_id', $categoryId)
                ->first();

            $slug = $existing?->slug ?: ListingSlug::make((string) $row['title']);

            $payload = [
                'user_id' => 1,
                'category_id' => $categoryId,
                'subcategory' => $row['subcategory'] ?? [],
                'property_type' => $row['property_type'] ?? null,
                'title' => $row['title'],
                'slug' => $slug,
                'location' => $row['location'],
                'city' => $row['city'] ?? $row['location'],
                'description' => $row['description'],
                'tagline' => $row['tagline'] ?? null,
                'phone' => $row['phone'] ?? null,
                'whatsapp' => $row['whatsapp'] ?? null,
                'email' => $row['email'] ?? null,
                'website' => $row['website'] ?? null,
                'address' => $row['address'] ?? null,
                'venue' => $row['venue'] ?? null,
                'latitude' => $row['latitude'] ?? null,
                'longitude' => $row['longitude'] ?? null,
                'start_at' => $row['start_at'] ?? null,
                'end_at' => $row['end_at'] ?? null,
                'ticket_price' => $row['ticket_price'] ?? null,
                'early_bird_price' => $row['early_bird_price'] ?? null,
                'gate_price' => $row['gate_price'] ?? null,
                'ticket_url' => $row['ticket_url'] ?? null,
                'image_url' => $row['image_url'] ?? null,
                'logo_url' => $row['logo_url'] ?? null,
                'event_poster_url' => $row['event_poster_url'] ?? null,
                'price_range' => $row['price_range'] ?? null,
                'gallery' => $row['gallery'] ?? [],
                'hours' => $row['hours'] ?? [],
                'amenities' => $row['amenities'] ?? [],
                'social_links' => $row['social_links'] ?? [
                    'links' => [],
                    'tiktok' => null,
                    'youtube' => null,
                    'facebook' => null,
                    'instagram' => null,
                ],
                'details' => $row['details'] ?? [],
                'status' => 'published',
                'tier' => Membership::PREMIUM,
                'priority' => Membership::listingPriority(Membership::PREMIUM),
                'claim_status' => 'unclaimed',
                'is_featured' => true,
                'is_trending' => false,
                'is_published' => true,
                'published_at' => now(),
                'expires_at' => null,
            ];

            Listing::query()->updateOrCreate(
                [
                    'title' => $row['title'],
                    'location' => $row['location'],
                    'category_id' => $categoryId,
                ],
                $payload,
            );

            $created++;
            $this->command?->info("Premium listing ready: {$row['title']} ({$row['location']} / {$row['category_slug']})");
        }

        $this->command?->info("Upserted {$created} premium town listings.");
    }
}
