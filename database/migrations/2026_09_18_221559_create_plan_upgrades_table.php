<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_upgrades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('from_plan');
            $table->string('to_plan');
            $table->unsignedInteger('amount')->default(0);
            $table->string('currency', 8)->default('KES');
            $table->string('billing_period')->default('month');
            $table->string('status')->default('pending');
            $table->string('payment_reference')->nullable();
            $table->string('payment_method')->nullable();
            $table->text('member_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_upgrades');
    }
};
