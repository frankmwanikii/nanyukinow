<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_plans', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->unsignedInteger('price_amount')->default(0);
            $table->string('currency', 8)->default('KES');
            $table->string('billing_period')->default('month');
            $table->string('price_label')->nullable();
            $table->json('inclusions')->nullable();
            $table->string('cta_label')->default('Get started');
            $table->boolean('is_highlighted')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_plans');
    }
};
