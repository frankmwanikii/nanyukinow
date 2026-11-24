<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Support\AmenityIcon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AmenityIconTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function guess_maps_common_amenity_names(): void
    {
        $this->assertSame('chair', AmenityIcon::guess('seating', 'Seating provided'));
        $this->assertSame('diamond', AmenityIcon::guess('vip', 'VIP section'));
        $this->assertSame('wifi', AmenityIcon::guess('wifi', 'Free Wi-Fi'));
        $this->assertSame('umbrella', AmenityIcon::guess('rain-cover', 'Rain cover'));
        $this->assertSame('water', AmenityIcon::guess('pool', 'Swimming pool'));
        $this->assertSame('credit-card', AmenityIcon::guess('cards', 'Accepts cards'));
        $this->assertSame('accessible-icon-alt', AmenityIcon::guess('wheelchair', 'Wheelchair access'));
        $this->assertSame('car', AmenityIcon::guess('car', 'Car access'));
        $this->assertSame('dumbbell', AmenityIcon::guess('gym', 'Gym'));
        $this->assertSame('fire', AmenityIcon::guess('fireplace', 'Fireplace'));
    }

    #[Test]
    public function guess_avoids_icons_already_in_use(): void
    {
        $first = AmenityIcon::guess('pool', 'Swimming pool');
        $second = AmenityIcon::guess('hot-pool', 'Hotel pool', [$first]);

        $this->assertSame('water', $first);
        $this->assertNotSame($first, $second);
    }

    #[Test]
    public function creating_an_amenity_assigns_an_icon_key(): void
    {
        $amenity = Amenity::findOrCreateNamed('Backstage lounge', 'events');

        $this->assertNotEmpty($amenity->icon_key);
    }

    #[Test]
    public function creating_amenities_does_not_reuse_icon_keys(): void
    {
        $a = Amenity::findOrCreateNamed('Swimming pool', 'stay');
        $b = Amenity::findOrCreateNamed('Infinity pool', 'stay');
        $c = Amenity::findOrCreateNamed('Kids pool', 'stay');

        $icons = [$a->icon_key, $b->icon_key, $c->icon_key];

        $this->assertCount(3, array_unique($icons));
    }
}
