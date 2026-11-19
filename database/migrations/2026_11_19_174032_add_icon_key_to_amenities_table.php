<?php

use App\Models\Amenity;
use App\Support\AmenityIcon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('amenities', function (Blueprint $table) {
            $table->string('icon_key', 64)->nullable()->after('slug');
        });

        Amenity::query()->orderBy('id')->each(function (Amenity $amenity): void {
            $amenity->forceFill([
                'icon_key' => AmenityIcon::guess(
                    (string) $amenity->slug,
                    (string) $amenity->name,
                ),
            ])->saveQuietly();
        });
    }

    public function down(): void
    {
        Schema::table('amenities', function (Blueprint $table) {
            $table->dropColumn('icon_key');
        });
    }
};
