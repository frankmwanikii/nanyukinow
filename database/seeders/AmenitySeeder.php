<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Shared
            ['name' => 'Free Wi‑Fi', 'slug' => 'wifi', 'category_key' => null],
            ['name' => 'Parking', 'slug' => 'parking', 'category_key' => null],
            ['name' => 'Family friendly', 'slug' => 'family', 'category_key' => null],
            ['name' => 'Wheelchair access', 'slug' => 'wheelchair', 'category_key' => null],
            ['name' => 'Accepts cards', 'slug' => 'cards', 'category_key' => null],
            ['name' => 'Security', 'slug' => 'security', 'category_key' => null],
            ['name' => 'Air conditioning', 'slug' => 'ac', 'category_key' => null],
            ['name' => 'Garden', 'slug' => 'garden', 'category_key' => null],

            // Eat & Drink
            ['name' => 'Outdoor seating', 'slug' => 'outdoor', 'category_key' => 'eatDrink'],
            ['name' => 'Bar / alcohol', 'slug' => 'alcohol', 'category_key' => 'eatDrink'],
            ['name' => 'Takeaway', 'slug' => 'takeaway', 'category_key' => 'eatDrink'],
            ['name' => 'Live music', 'slug' => 'live-music', 'category_key' => 'eatDrink'],
            ['name' => 'Kid menu', 'slug' => 'kid-menu', 'category_key' => 'eatDrink'],
            ['name' => 'Pet friendly', 'slug' => 'pet-friendly', 'category_key' => 'eatDrink'],

            // Stay
            ['name' => 'Swimming pool', 'slug' => 'pool', 'category_key' => 'stay'],
            ['name' => 'Restaurant', 'slug' => 'restaurant', 'category_key' => 'stay'],
            ['name' => 'Workspace', 'slug' => 'workspace', 'category_key' => 'stay'],
            ['name' => 'Fireplace', 'slug' => 'fireplace', 'category_key' => 'stay'],
            ['name' => 'Laundry', 'slug' => 'laundry', 'category_key' => 'stay'],
            ['name' => 'Concierge', 'slug' => 'concierge', 'category_key' => 'stay'],
            ['name' => 'Breakfast included', 'slug' => 'breakfast', 'category_key' => 'stay'],
            ['name' => 'Kitchen', 'slug' => 'kitchen', 'category_key' => 'stay'],
            ['name' => 'Smart TV', 'slug' => 'smart-tv', 'category_key' => 'stay'],
            ['name' => 'Hot shower', 'slug' => 'hot-shower', 'category_key' => 'stay'],
            ['name' => 'Pet friendly', 'slug' => 'stay-pet-friendly', 'category_key' => 'stay'],

            // Things to do
            ['name' => 'Guide included', 'slug' => 'guide', 'category_key' => 'thingsToDo'],
            ['name' => 'Equipment provided', 'slug' => 'equipment', 'category_key' => 'thingsToDo'],
            ['name' => 'Photo opportunities', 'slug' => 'photos', 'category_key' => 'thingsToDo'],
            ['name' => 'Car access', 'slug' => 'car', 'category_key' => 'thingsToDo'],

            // Services
            ['name' => 'Mobile / on-site', 'slug' => 'onsite', 'category_key' => 'services'],
            ['name' => 'Same-day booking', 'slug' => 'same-day', 'category_key' => 'services'],
            ['name' => 'Licensed', 'slug' => 'licensed', 'category_key' => 'services'],

            // Shopping
            ['name' => 'Delivery', 'slug' => 'delivery', 'category_key' => 'shopping'],
            ['name' => 'Fitting room', 'slug' => 'fitting-room', 'category_key' => 'shopping'],
            ['name' => 'Gift wrap', 'slug' => 'gift-wrap', 'category_key' => 'shopping'],

            // Properties
            ['name' => 'Borehole', 'slug' => 'borehole', 'category_key' => 'properties'],
            ['name' => 'Backup power', 'slug' => 'backup-power', 'category_key' => 'properties'],
            ['name' => 'Furnished', 'slug' => 'furnished', 'category_key' => 'properties'],
            ['name' => 'Servant quarters', 'slug' => 'sq', 'category_key' => 'properties'],
            ['name' => 'Gated community', 'slug' => 'gated', 'category_key' => 'properties'],

            // Events
            ['name' => 'Seating provided', 'slug' => 'seating', 'category_key' => 'events'],
            ['name' => 'Food & drinks', 'slug' => 'food-drinks', 'category_key' => 'events'],
            ['name' => 'VIP section', 'slug' => 'vip', 'category_key' => 'events'],
            ['name' => 'Rain cover', 'slug' => 'rain-cover', 'category_key' => 'events'],
        ];

        foreach ($items as $item) {
            Amenity::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'name' => $item['name'],
                    'category_key' => $item['category_key'],
                    'is_active' => true,
                    'usage_count' => 0,
                ],
            );
        }
    }
}
