<?php

namespace App\Console\Commands;

use App\Models\Amenity;
use App\Support\AmenityIcon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('amenities:reassign-icons')]
#[Description('Reassign amenity icons so names match and icons stay unique')]
class ReassignAmenityIconsCommand extends Command
{
    public function handle(): int
    {
        $amenities = Amenity::query()
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'icon_key']);

        $used = [];
        $updated = 0;

        foreach ($amenities as $amenity) {
            $next = AmenityIcon::guess(
                (string) $amenity->slug,
                (string) $amenity->name,
                $used,
            );

            if ((string) $amenity->icon_key !== $next) {
                $amenity->forceFill(['icon_key' => $next])->saveQuietly();
                $updated++;
            }

            $used[] = $next;
        }

        $unique = count(array_unique($used));

        $this->info("Updated {$updated} of {$amenities->count()} amenities ({$unique} unique icons).");

        return self::SUCCESS;
    }
}
