<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            $table->unsignedInteger('listing_limit')->default(1)->after('sort_order');
        });

        DB::table('pricing_plans')->where('key', 'free')->update([
            'name' => 'Free',
            'listing_limit' => 1,
            'tagline' => 'One free listing to get discovered in Nanyuki.',
            'cta_label' => 'List for free',
        ]);

        DB::table('pricing_plans')->where('key', 'featured')->update([
            'name' => 'Standard',
            'listing_limit' => 3,
            'tagline' => 'Featured badge, better placement, and room to grow.',
            'cta_label' => 'Go Standard',
            'is_highlighted' => true,
        ]);

        DB::table('pricing_plans')->where('key', 'premium')->update([
            'name' => 'Premium',
            'listing_limit' => 10,
            'tagline' => 'Maximum visibility with premium placement and polish.',
            'cta_label' => 'Go Premium',
        ]);
    }

    public function down(): void
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            $table->dropColumn('listing_limit');
        });
    }
};
