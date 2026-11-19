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
        $this->assertSame('star', AmenityIcon::guess('vip', 'VIP section'));
        $this->assertSame('wifi', AmenityIcon::guess('wifi', 'Free Wi-Fi'));
        $this->assertSame('umbrella', AmenityIcon::guess('rain-cover', 'Rain cover'));
    }

    #[Test]
    public function creating_an_amenity_assigns_an_icon_key(): void
    {
        $amenity = Amenity::findOrCreateNamed('Backstage lounge', 'events');

        $this->assertNotEmpty($amenity->icon_key);
        $this->assertSame(
            AmenityIcon::guess($amenity->slug, $amenity->name),
            $amenity->icon_key,
        );
    }
}
