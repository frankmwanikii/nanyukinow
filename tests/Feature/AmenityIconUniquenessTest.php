<?php

namespace Tests\Feature;

use App\Models\Amenity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AmenityIconUniquenessTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function reassign_command_makes_icon_keys_unique(): void
    {
        Amenity::query()->create([
            'name' => 'Swimming pool',
            'slug' => 'pool',
            'icon_key' => 'bath',
            'is_active' => true,
        ]);
        Amenity::query()->create([
            'name' => 'Hot shower',
            'slug' => 'hot-shower',
            'icon_key' => 'bath',
            'is_active' => true,
        ]);
        Amenity::query()->create([
            'name' => 'Restrooms',
            'slug' => 'restrooms',
            'icon_key' => 'bath',
            'is_active' => true,
        ]);

        Artisan::call('amenities:reassign-icons');

        $icons = Amenity::query()->orderBy('id')->pluck('icon_key')->all();

        $this->assertCount(3, array_unique($icons));
        $this->assertSame('water', $icons[0]);
        $this->assertSame('bath', $icons[1]);
    }
}
