<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\CategorySubcategory;
use App\Models\Listing;
use App\Models\User;
use App\Support\CategoryTaxonomy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategorySubcategoryTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    private function category(string $slug = 'stay', string $name = 'Stay'): Category
    {
        return Category::query()->create([
            'name' => $name,
            'slug' => $slug,
            'sort_order' => 1,
        ]);
    }

    public function test_guest_cannot_manage_subcategories(): void
    {
        $category = $this->category();

        $this->getJson(route('admin.categories.subcategories.index', $category))
            ->assertUnauthorized();
    }

    public function test_admin_can_list_create_update_and_delete_subcategories(): void
    {
        $admin = $this->admin();
        $category = $this->category();

        $this->actingAs($admin)
            ->getJson(route('admin.categories.subcategories.index', $category))
            ->assertOk()
            ->assertJsonPath('category.id', $category->id)
            ->assertJsonPath('subcategories', []);

        $this->actingAs($admin)
            ->postJson(route('admin.categories.subcategories.store', $category), [
                'name' => 'Airbnbs',
                'sort_order' => 0,
            ])
            ->assertCreated()
            ->assertJsonPath('subcategory.name', 'Airbnbs');

        $row = CategorySubcategory::query()->first();
        $this->assertNotNull($row);

        $this->actingAs($admin)
            ->putJson(route('admin.categories.subcategories.update', [$category, $row]), [
                'name' => 'Boutique Airbnbs',
                'sort_order' => 2,
            ])
            ->assertOk()
            ->assertJsonPath('subcategory.name', 'Boutique Airbnbs');

        $this->assertDatabaseHas('category_subcategories', [
            'id' => $row->id,
            'name' => 'Boutique Airbnbs',
            'sort_order' => 2,
        ]);

        $this->actingAs($admin)
            ->deleteJson(route('admin.categories.subcategories.destroy', [$category, $row]))
            ->assertOk();

        $this->assertDatabaseMissing('category_subcategories', ['id' => $row->id]);
    }

    public function test_subcategory_name_must_be_unique_per_category(): void
    {
        $admin = $this->admin();
        $category = $this->category();
        CategorySubcategory::query()->create([
            'category_id' => $category->id,
            'name' => 'Hotels',
            'sort_order' => 0,
        ]);

        $this->actingAs($admin)
            ->postJson(route('admin.categories.subcategories.store', $category), [
                'name' => 'Hotels',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_rename_updates_listing_subcategory_labels(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create();
        $category = $this->category();
        $sub = CategorySubcategory::query()->create([
            'category_id' => $category->id,
            'name' => 'Hotels',
            'sort_order' => 0,
        ]);

        $listing = Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Lodge',
            'slug' => 'lodge-'.uniqid(),
            'status' => 'published',
            'subcategory' => ['Hotels', 'Resorts'],
        ]);

        $this->actingAs($admin)
            ->putJson(route('admin.categories.subcategories.update', [$category, $sub]), [
                'name' => 'Boutique Hotels',
            ])
            ->assertOk();

        $listing->refresh();
        $this->assertSame(['Boutique Hotels', 'Resorts'], $listing->subcategory);
    }

    public function test_delete_strips_listing_subcategory_labels(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create();
        $category = $this->category();
        $sub = CategorySubcategory::query()->create([
            'category_id' => $category->id,
            'name' => 'Hotels',
            'sort_order' => 0,
        ]);

        $listing = Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Lodge',
            'slug' => 'lodge-'.uniqid(),
            'status' => 'published',
            'subcategory' => ['Hotels', 'Resorts'],
        ]);

        $this->actingAs($admin)
            ->deleteJson(route('admin.categories.subcategories.destroy', [$category, $sub]))
            ->assertOk();

        $listing->refresh();
        $this->assertSame(['Resorts'], $listing->subcategory);
    }

    public function test_listing_form_receives_database_subcategories(): void
    {
        $admin = $this->admin();
        $category = $this->category('eat-drink', 'Eat & Drink');
        CategorySubcategory::query()->create([
            'category_id' => $category->id,
            'name' => 'Garden Restaurant',
            'sort_order' => 0,
        ]);
        CategoryTaxonomy::forgetCache();

        $this->actingAs($admin)
            ->get(route('admin.listings.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Listings/Form')
                ->where('categories.0.subcategories.0', 'Garden Restaurant'));
    }
}
