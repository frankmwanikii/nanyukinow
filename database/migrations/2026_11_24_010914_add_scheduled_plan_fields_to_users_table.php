<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('scheduled_plan')->nullable()->after('trial_banner_dismissed_at');
            $table->unsignedInteger('scheduled_plan_days')->nullable()->after('scheduled_plan');
            $table->timestamp('scheduled_plan_at')->nullable()->after('scheduled_plan_days');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'scheduled_plan',
                'scheduled_plan_days',
                'scheduled_plan_at',
            ]);
        });
    }
};
