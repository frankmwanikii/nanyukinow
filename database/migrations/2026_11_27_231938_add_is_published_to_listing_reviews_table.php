<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('listing_reviews', function (Blueprint $table) {
            $table->boolean('is_published')->default(true)->after('body');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listing_reviews', function (Blueprint $table) {
            $table->dropIndex(['is_published']);
            $table->dropColumn('is_published');
        });
    }
};
