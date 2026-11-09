<?php

namespace Database\Seeders;

use App\Support\CategoryTaxonomy;
use Illuminate\Database\Seeder;

class CategorySubcategorySeeder extends Seeder
{
    public function run(): void
    {
        CategoryTaxonomy::seedDefaults();
    }
}
