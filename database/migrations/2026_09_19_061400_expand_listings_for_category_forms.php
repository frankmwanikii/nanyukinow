<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->string('subcategory', 120)->nullable()->after('category_id');
            $table->string('property_type', 80)->nullable()->after('subcategory');
            $table->string('venue', 180)->nullable()->after('address');
            $table->timestamp('start_at')->nullable()->after('venue');
            $table->timestamp('end_at')->nullable()->after('start_at');
            $table->string('ticket_price', 120)->nullable()->after('end_at');
            $table->string('early_bird_price', 120)->nullable()->after('ticket_price');
            $table->string('gate_price', 120)->nullable()->after('early_bird_price');
            $table->string('ticket_url', 500)->nullable()->after('gate_price');
            $table->string('event_poster_url', 500)->nullable()->after('logo_url');
            $table->json('details')->nullable()->after('social_links');
        });

        Schema::create('amenities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category_key', 40)->nullable()->index();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amenities');

        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn([
                'subcategory',
                'property_type',
                'venue',
                'start_at',
                'end_at',
                'ticket_price',
                'early_bird_price',
                'gate_price',
                'ticket_url',
                'event_poster_url',
                'details',
            ]);
        });
    }
};
