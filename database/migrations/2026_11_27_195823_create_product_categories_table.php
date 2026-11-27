<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();
        });

        $this->backfillFromListings();
    }

    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }

    private function backfillFromListings(): void
    {
        $names = [];

        DB::table('listings')
            ->whereNotNull('details')
            ->orderBy('id')
            ->chunkById(100, function ($rows) use (&$names): void {
                foreach ($rows as $row) {
                    $details = json_decode((string) $row->details, true);
                    if (! is_array($details) || ! is_array($details['products'] ?? null)) {
                        continue;
                    }

                    foreach ($details['products'] as $product) {
                        if (! is_array($product)) {
                            continue;
                        }
                        $name = trim((string) ($product['category'] ?? ''));
                        if ($name === '') {
                            continue;
                        }
                        $key = mb_strtolower($name);
                        if (! isset($names[$key])) {
                            $names[$key] = $name;
                        }
                    }
                }
            });

        $now = now();
        foreach ($names as $name) {
            $base = Str::slug($name) ?: 'category';
            $slug = $base;
            $i = 1;
            while (DB::table('product_categories')->where('slug', $slug)->exists()) {
                $slug = $base.'-'.$i;
                $i++;
            }

            DB::table('product_categories')->insert([
                'name' => $name,
                'slug' => $slug,
                'is_active' => true,
                'usage_count' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
};
