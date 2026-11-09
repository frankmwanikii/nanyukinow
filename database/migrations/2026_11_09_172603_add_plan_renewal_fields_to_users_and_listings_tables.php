<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_paid_plan')->nullable()->after('plan_expires_at');
            $table->timestamp('plan_renewal_reminder_7d_sent_at')->nullable()->after('last_paid_plan');
            $table->timestamp('plan_renewal_reminder_3d_sent_at')->nullable()->after('plan_renewal_reminder_7d_sent_at');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->boolean('suppressed_by_plan_expiry')->default(false)->after('is_published');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_paid_plan',
                'plan_renewal_reminder_7d_sent_at',
                'plan_renewal_reminder_3d_sent_at',
            ]);
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn('suppressed_by_plan_expiry');
        });
    }
};
