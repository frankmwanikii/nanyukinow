<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->string('tagline')->nullable()->after('description');
            $table->string('phone')->nullable()->after('tagline');
            $table->string('email')->nullable()->after('phone');
            $table->string('website')->nullable()->after('email');
            $table->string('whatsapp')->nullable()->after('website');
            $table->string('address')->nullable()->after('whatsapp');
            $table->string('city')->nullable()->after('address');
            $table->decimal('latitude', 10, 7)->nullable()->after('city');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('status')->default('published')->after('longitude');
            $table->string('tier')->default('free')->after('status');
            $table->unsignedInteger('priority')->default(0)->after('tier');
            $table->unsignedInteger('views_count')->default(0)->after('priority');
            $table->string('price_range')->nullable()->after('views_count');
            $table->json('gallery')->nullable()->after('price_range');
            $table->json('hours')->nullable()->after('gallery');
            $table->json('amenities')->nullable()->after('hours');
            $table->json('social_links')->nullable()->after('amenities');
            $table->timestamp('expires_at')->nullable()->after('social_links');
            $table->timestamp('published_at')->nullable()->after('expires_at');
            $table->string('claim_status')->default('unclaimed')->after('published_at');
            $table->index(['status', 'expires_at']);
            $table->index(['tier', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropIndex(['status', 'expires_at']);
            $table->dropIndex(['tier', 'priority']);
            $table->dropColumn([
                'tagline',
                'phone',
                'email',
                'website',
                'whatsapp',
                'address',
                'city',
                'latitude',
                'longitude',
                'status',
                'tier',
                'priority',
                'views_count',
                'price_range',
                'gallery',
                'hours',
                'amenities',
                'social_links',
                'expires_at',
                'published_at',
                'claim_status',
            ]);
        });
    }
};
