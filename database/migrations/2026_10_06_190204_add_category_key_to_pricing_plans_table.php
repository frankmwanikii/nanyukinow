<?php

use App\Support\CategoryKey;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('pricing_plans', 'category_key')) {
            Schema::table('pricing_plans', function (Blueprint $table) {
                $table->string('category_key', 40)->nullable()->after('key');
            });
        }

        $this->dropKeyUniqueIfExists();

        $categories = CategoryKey::keys();
        $templates = DB::table('pricing_plans')
            ->orderBy('id')
            ->get()
            ->groupBy('key');

        foreach ($templates as $key => $rows) {
            $source = $rows->first();
            $base = (array) $source;
            unset($base['id']);

            $have = DB::table('pricing_plans')
                ->where('key', $key)
                ->whereNotNull('category_key')
                ->pluck('category_key')
                ->all();

            foreach ($categories as $categoryKey) {
                if (in_array($categoryKey, $have, true)) {
                    continue;
                }

                $unscoped = DB::table('pricing_plans')
                    ->where('key', $key)
                    ->whereNull('category_key')
                    ->orderBy('id')
                    ->first();

                if ($unscoped) {
                    DB::table('pricing_plans')
                        ->where('id', $unscoped->id)
                        ->update(['category_key' => $categoryKey]);
                    $have[] = $categoryKey;

                    continue;
                }

                $copy = $base;
                $copy['category_key'] = $categoryKey;
                $copy['created_at'] = $source->created_at;
                $copy['updated_at'] = $source->updated_at;
                DB::table('pricing_plans')->insert($copy);
                $have[] = $categoryKey;
            }
        }

        DB::table('pricing_plans')->whereNull('category_key')->delete();

        try {
            Schema::table('pricing_plans', function (Blueprint $table) {
                $table->unique(['category_key', 'key']);
            });
        } catch (Throwable) {
            // already exists
        }

        try {
            Schema::table('pricing_plans', function (Blueprint $table) {
                $table->index('category_key');
            });
        } catch (Throwable) {
            // already exists
        }
    }

    public function down(): void
    {
        try {
            Schema::table('pricing_plans', function (Blueprint $table) {
                $table->dropUnique(['category_key', 'key']);
            });
        } catch (Throwable) {
            // ignore
        }

        try {
            Schema::table('pricing_plans', function (Blueprint $table) {
                $table->dropIndex(['category_key']);
            });
        } catch (Throwable) {
            // ignore
        }

        $keepers = DB::table('pricing_plans')
            ->selectRaw('MIN(id) as id')
            ->groupBy('key')
            ->pluck('id');

        DB::table('pricing_plans')
            ->whereNotIn('id', $keepers)
            ->delete();

        Schema::table('pricing_plans', function (Blueprint $table) {
            $table->dropColumn('category_key');
            $table->unique('key');
        });
    }

    private function dropKeyUniqueIfExists(): void
    {
        try {
            Schema::table('pricing_plans', function (Blueprint $table) {
                $table->dropUnique(['key']);
            });
        } catch (Throwable) {
            try {
                DB::statement('ALTER TABLE pricing_plans DROP INDEX pricing_plans_key_unique');
            } catch (Throwable) {
                // already gone
            }
        }
    }
};
