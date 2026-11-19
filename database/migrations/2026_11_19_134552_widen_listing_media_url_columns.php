<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Instagram and other CDN image URLs often exceed varchar(255).
     * SQLite already stores these as unbounded TEXT, so only MySQL needs ALTER.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE listings MODIFY image_url TEXT NULL');
        DB::statement('ALTER TABLE listings MODIFY logo_url TEXT NULL');
        DB::statement('ALTER TABLE listings MODIFY event_poster_url TEXT NULL');
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE listings MODIFY image_url VARCHAR(255) NULL');
        DB::statement('ALTER TABLE listings MODIFY logo_url VARCHAR(255) NULL');
        DB::statement('ALTER TABLE listings MODIFY event_poster_url VARCHAR(500) NULL');
    }
};
