<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE listings MODIFY subcategory TEXT NULL');
        }

        DB::table('listings')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $raw = $row->subcategory;
                    if ($raw === null || $raw === '') {
                        continue;
                    }

                    $decoded = json_decode((string) $raw, true);
                    if (is_array($decoded)) {
                        $normalized = array_values(array_unique(array_filter(
                            array_map(
                                fn ($item) => is_string($item) || is_numeric($item)
                                    ? trim((string) $item)
                                    : '',
                                $decoded,
                            ),
                            fn ($item) => $item !== '',
                        )));

                        DB::table('listings')->where('id', $row->id)->update([
                            'subcategory' => $normalized === []
                                ? null
                                : json_encode($normalized),
                        ]);

                        continue;
                    }

                    DB::table('listings')->where('id', $row->id)->update([
                        'subcategory' => json_encode([(string) $raw]),
                    ]);
                }
            });
    }

    public function down(): void
    {
        DB::table('listings')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $raw = $row->subcategory;
                    if ($raw === null || $raw === '') {
                        continue;
                    }

                    $decoded = json_decode((string) $raw, true);
                    if (! is_array($decoded)) {
                        continue;
                    }

                    $first = trim((string) ($decoded[0] ?? ''));
                    DB::table('listings')->where('id', $row->id)->update([
                        'subcategory' => $first !== '' ? mb_substr($first, 0, 120) : null,
                    ]);
                }
            });

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE listings MODIFY subcategory VARCHAR(120) NULL');
        }
    }
};
