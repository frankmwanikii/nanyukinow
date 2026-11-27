<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_create_product_categories(): void
    {
        $this->postJson(route('account.product-categories.store'), [
            'name' => 'Tees',
        ])->assertUnauthorized();
    }

    public function test_user_can_create_product_category(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.product-categories.store'), [
                'name' => 'Tees',
            ])
            ->assertCreated()
            ->assertJsonPath('category.name', 'Tees')
            ->assertJsonPath('category.slug', 'tees');

        $this->assertDatabaseHas('product_categories', [
            'name' => 'Tees',
            'slug' => 'tees',
        ]);
    }

    public function test_creating_the_same_category_returns_existing(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.product-categories.store'), [
                'name' => 'Dairy',
            ])
            ->assertCreated();

        $this->actingAs($user)
            ->postJson(route('account.product-categories.store'), [
                'name' => 'Dairy',
            ])
            ->assertCreated()
            ->assertJsonPath('category.slug', 'dairy');

        $this->assertDatabaseCount('product_categories', 1);
    }

    public function test_name_is_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.product-categories.store'), [
                'name' => '',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_listing_form_includes_product_categories(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.product-categories.store'), [
                'name' => 'Hoodies',
            ])
            ->assertCreated();

        $this->actingAs($user)
            ->get(route('account.listings.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Listings/Form')
                ->has('productCategories', 1)
                ->where('productCategories.0.name', 'Hoodies'));
    }
}
