<?php

use App\Support\CategoryTaxonomy;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        CategoryTaxonomy::seedDefaults();
    }

    public function down(): void
    {
        // Keep subcategory rows; dropping the table is handled by the create migration.
    }
};
