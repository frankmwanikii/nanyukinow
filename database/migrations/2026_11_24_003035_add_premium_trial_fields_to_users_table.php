<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('plan_is_trial')->default(false)->after('plan_expires_at');
            $table->timestamp('premium_trial_claimed_at')->nullable()->after('plan_is_trial');
            $table->timestamp('trial_banner_dismissed_at')->nullable()->after('premium_trial_claimed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'plan_is_trial',
                'premium_trial_claimed_at',
                'trial_banner_dismissed_at',
            ]);
        });
    }
};
