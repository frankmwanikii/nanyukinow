<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_search_admin(): void
    {
        $this->get(route('admin.search', ['q' => 'lodge']))
            ->assertRedirect(route('admin.login'));
    }

    public function test_non_admin_cannot_search_admin(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.search', ['q' => 'lodge']))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_search_page_finds_listings_and_users(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Site Admin',
            'email' => 'admin@example.com',
        ]);
        $member = User::factory()->create([
            'name' => 'Lodge Owner',
            'email' => 'owner@example.com',
            'is_admin' => false,
        ]);
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);
        Listing::query()->create([
            'title' => 'Mount Kenya Lodge',
            'slug' => 'mount-kenya-lodge',
            'category_id' => $category->id,
            'user_id' => $member->id,
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
            'location' => 'Nanyuki',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.search', ['q' => 'Lodge']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Search/Index')
                ->where('q', 'Lodge')
                ->has('groups', 2)
                ->where('groups.0.key', 'listings')
                ->where('groups.0.items.0.title', 'Mount Kenya Lodge')
                ->where('groups.1.key', 'users')
                ->where('groups.1.items.0.title', 'Lodge Owner'));
    }

    public function test_admin_suggest_returns_json_matches(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eat-drink',
            'sort_order' => 1,
        ]);
        Listing::query()->create([
            'title' => 'Cedar Mall Cafe',
            'slug' => 'cedar-mall-cafe',
            'category_id' => $category->id,
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
        ]);

        $this->actingAs($admin)
            ->getJson(route('admin.search.suggest', ['q' => 'Cedar']))
            ->assertOk()
            ->assertJsonPath('groups.0.key', 'listings')
            ->assertJsonPath('groups.0.items.0.title', 'Cedar Mall Cafe');
    }

    public function test_suggest_requires_two_characters(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson(route('admin.search.suggest', ['q' => 'C']))
            ->assertOk()
            ->assertExactJson(['groups' => []]);
    }

    public function test_searching_settings_returns_settings_destination(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson(route('admin.search.suggest', ['q' => 'settings']))
            ->assertOk()
            ->assertJsonPath('groups.0.key', 'go')
            ->assertJsonPath('groups.0.items.0.title', 'Settings')
            ->assertJsonPath('groups.0.items.0.href', route('admin.settings.index'));
    }

    public function test_searching_reports_alias_returns_reports_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.search', ['q' => 'flags']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Search/Index')
                ->where('groups.0.key', 'go')
                ->where('groups.0.items.0.title', 'Reports')
                ->where('groups.0.items.0.href', route('admin.reports.index')));
    }

    public function test_sidebar_labels_are_reachable_from_search(): void
    {
        $admin = User::factory()->admin()->create();

        $cases = [
            'overview' => ['Overview', route('admin.dashboard')],
            'listings' => ['Listings', route('admin.listings.index')],
            'pages' => ['Pages', route('admin.pages.index')],
            'categories' => ['Categories', route('admin.categories.index')],
            'locations' => ['Locations', route('admin.locations.index')],
            'stories' => ['Stories', route('admin.stories.index')],
            'gallery' => ['Gallery', route('admin.gallery.index')],
            'users' => ['Users', route('admin.users.index')],
            'messages' => ['Messages', route('admin.messages.index')],
            'pricing' => ['Pricing', route('admin.pricing.index')],
            'finance' => ['Finance', route('admin.finance.index')],
            'claims' => ['Claims', route('admin.claims.index')],
            'reports' => ['Reports', route('admin.reports.index')],
            'settings' => ['Settings', route('admin.settings.index')],
        ];

        foreach ($cases as $query => [$title, $href]) {
            $this->actingAs($admin)
                ->getJson(route('admin.search.suggest', ['q' => $query]))
                ->assertOk()
                ->assertJsonPath('groups.0.key', 'go')
                ->assertJsonPath('groups.0.items.0.title', $title)
                ->assertJsonPath('groups.0.items.0.href', $href);
        }
    }
}
