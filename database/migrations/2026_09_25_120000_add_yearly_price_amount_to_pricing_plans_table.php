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
            $table->unsignedInteger('yearly_price_amount')->nullable()->after('price_amount');
        });

        // Seed yearly defaults as ~10× monthly (2 months free) for paid plans.
        DB::table('pricing_plans')
            ->where('price_amount', '>', 0)
            ->whereNull('yearly_price_amount')
            ->update([
                'yearly_price_amount' => DB::raw('price_amount * 10'),
            ]);
    }

    public function down(): void
    {
        Schema::table('pricing_plans', function (Blueprint $table) {
            $table->dropColumn('yearly_price_amount');
        });
    }
};
