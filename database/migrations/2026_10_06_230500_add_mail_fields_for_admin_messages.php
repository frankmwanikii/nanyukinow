<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->string('admin_status', 20)->default('new')->after('subject');
            $table->boolean('starred')->default(false)->after('admin_status');
            $table->index(['admin_status', 'starred']);
        });

        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->nullable()->constrained('communication_campaigns')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel', 20)->default('email');
            $table->string('recipient_email');
            $table->string('recipient_name')->nullable();
            $table->string('subject');
            $table->text('body');
            $table->string('status', 20)->default('sent');
            $table->boolean('starred')->default(false);
            $table->timestamp('sent_at')->nullable()->index();
            $table->timestamps();

            $table->index(['status', 'sent_at']);
            $table->index('starred');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_logs');

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['admin_status', 'starred']);
            $table->dropColumn(['admin_status', 'starred']);
        });
    }
};
