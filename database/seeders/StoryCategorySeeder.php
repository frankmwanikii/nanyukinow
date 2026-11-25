<?php

namespace Database\Seeders;

use App\Models\StoryCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StoryCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Travel Tips', 'sort_order' => 1],
            ['name' => 'Shopping', 'sort_order' => 2],
            ['name' => 'Stay', 'sort_order' => 3],
            ['name' => 'Weather', 'sort_order' => 4],
        ];

        foreach ($categories as $category) {
            StoryCategory::query()->updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'sort_order' => $category['sort_order'],
                ],
            );
        }
    }
}
