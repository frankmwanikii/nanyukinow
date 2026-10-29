<?php

use App\Support\ListingSlug;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('listings')->chunkById(200, function ($listings): void {
            foreach ($listings as $listing) {
                $slug = (string) $listing->slug;
                $titleSlug = Str::slug((string) $listing->title);

                if ($titleSlug === '' || ! ListingSlug::needsTitleSlug($slug)) {
                    continue;
                }

                if (ListingSlug::isPlaceholder($titleSlug)) {
                    continue;
                }

                $candidate = $titleSlug;
                $i = 2;

                while (DB::table('listings')
                    ->where('slug', $candidate)
                    ->where('id', '!=', $listing->id)
                    ->exists()) {
                    $candidate = $titleSlug.'-'.$i;
                    $i++;
                }

                DB::table('listings')
                    ->where('id', $listing->id)
                    ->update(['slug' => $candidate]);
            }
        });
    }

    public function down(): void {}
};
