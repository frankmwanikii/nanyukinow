<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Support\CategoryTaxonomy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DirectoryCategoriesNavTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_share_admin_created_categories_for_more_nav(): void
    {
        Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eat-drink',
            'sort_order' => 1,
        ]);
        Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 2,
        ]);
        Category::query()->create([
            'name' => 'Things to do',
            'slug' => 'things-to-do',
            'sort_order' => 3,
        ]);
        Category::query()->create([
            'name' => 'Pets & Vets',
            'slug' => 'pets-vets',
            'sort_order' => 10,
        ]);
        CategoryTaxonomy::forgetCache();

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('directoryCategories')
                ->where('directoryCategories', function ($categories) {
                    $keys = collect($categories)->pluck('key')->all();
                    $labels = collect($categories)->pluck('label')->all();

                    return in_array('petsVets', $keys, true)
                        && in_array('Pets & Vets', $labels, true)
                        && ! in_array('petsVets', CategoryTaxonomy::PRIMARY_NAV_KEYS, true);
                }));
    }
}
