<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\GoldListEntry;
use App\Models\Listing;
use App\Models\User;
use App\Support\Membership;
use App\Support\PublishedListingsCatalogue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class GoldListTest extends TestCase
{
    use RefreshDatabase;

    private function category(): Category
    {
        return Category::query()->firstOrCreate(
            ['slug' => 'eatDrink'],
            ['name' => 'Eat & Drink', 'sort_order' => 1],
        );
    }

    private function makeListing(string $slug, int $priority = 1, array $overrides = []): Listing
    {
        return Listing::query()->create(array_merge([
            'category_id' => $this->category()->id,
            'title' => ucfirst(str_replace('-', ' ', $slug)),
            'slug' => $slug,
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'tier' => match ($priority) {
                Membership::PROMOTED_PRIORITY, 3 => Membership::PREMIUM,
                2 => Membership::STANDARD,
                default => Membership::FREE,
            },
            'priority' => $priority,
            'rating' => 4.0,
        ], $overrides));
    }

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    public function test_home_gold_list_puts_pins_before_auto_fill(): void
    {
        $low = $this->makeListing('low-priority', 1, ['rating' => 3.0]);
        $mid = $this->makeListing('mid-priority', 2, ['rating' => 4.0]);
        $high = $this->makeListing('high-priority', 3, ['rating' => 5.0]);

        GoldListEntry::factory()->forListing($low)->atPosition(0)->create();
        GoldListEntry::factory()->forListing($mid)->atPosition(1)->create();

        PublishedListingsCatalogue::forget();

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Home')
                ->loadDeferredProps(fn (AssertableInertia $reload) => $reload
                    ->has('goldList', 3)
                    ->where('goldList.0.id', $low->id)
                    ->where('goldList.1.id', $mid->id)
                    ->where('goldList.2.id', $high->id)));
    }

    public function test_home_gold_list_skips_unpublished_pins_and_auto_fills(): void
    {
        $draft = $this->makeListing('draft-pin', 3, [
            'is_published' => false,
            'status' => 'draft',
        ]);
        $publishedPin = $this->makeListing('published-pin', 1, ['rating' => 2.0]);
        $autoFill = $this->makeListing('auto-fill', 2, ['rating' => 4.5]);

        GoldListEntry::factory()->forListing($draft)->atPosition(0)->create();
        GoldListEntry::factory()->forListing($publishedPin)->atPosition(1)->create();

        PublishedListingsCatalogue::forget();

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Home')
                ->loadDeferredProps(fn (AssertableInertia $reload) => $reload
                    ->has('goldList', 2)
                    ->where('goldList.0.id', $publishedPin->id)
                    ->where('goldList.1.id', $autoFill->id)));
    }

    public function test_home_gold_list_auto_fills_when_no_pins_exist(): void
    {
        $first = $this->makeListing('premium-spot', 3, ['rating' => 5.0]);
        $second = $this->makeListing('standard-spot', 2, ['rating' => 4.0]);

        PublishedListingsCatalogue::forget();

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Home')
                ->loadDeferredProps(fn (AssertableInertia $reload) => $reload
                    ->has('goldList', 2)
                    ->where('goldList.0.id', $first->id)
                    ->where('goldList.1.id', $second->id)));
    }

    public function test_admin_can_view_gold_list_page(): void
    {
        $listing = $this->makeListing('pinned-cafe', 2);
        GoldListEntry::factory()->forListing($listing)->atPosition(0)->create();

        $this->actingAs($this->admin())
            ->get(route('admin.gold-list.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/GoldList/Index')
                ->has('entries', 1)
                ->where('entries.0.listing_id', $listing->id)
                ->where('limit', 24));
    }

    public function test_admin_can_pin_a_published_listing(): void
    {
        $listing = $this->makeListing('new-pin', 2);

        $this->actingAs($this->admin())
            ->post(route('admin.gold-list.store'), [
                'listing_id' => $listing->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('gold_list_entries', [
            'listing_id' => $listing->id,
            'position' => 1,
        ]);
    }

    public function test_admin_cannot_pin_the_same_listing_twice(): void
    {
        $listing = $this->makeListing('dup-pin', 2);
        GoldListEntry::factory()->forListing($listing)->atPosition(0)->create();

        $this->actingAs($this->admin())
            ->from(route('admin.gold-list.index'))
            ->post(route('admin.gold-list.store'), [
                'listing_id' => $listing->id,
            ])
            ->assertRedirect(route('admin.gold-list.index'))
            ->assertSessionHasErrors('listing_id');

        $this->assertSame(1, GoldListEntry::query()->where('listing_id', $listing->id)->count());
    }

    public function test_admin_can_reorder_and_remove_pins(): void
    {
        $first = $this->makeListing('first-pin', 1);
        $second = $this->makeListing('second-pin', 2);
        $entryA = GoldListEntry::factory()->forListing($first)->atPosition(0)->create();
        $entryB = GoldListEntry::factory()->forListing($second)->atPosition(1)->create();

        $admin = $this->admin();

        $this->actingAs($admin)
            ->post(route('admin.gold-list.reorder'), [
                'order' => [
                    ['id' => $entryA->id, 'position' => 1],
                    ['id' => $entryB->id, 'position' => 0],
                ],
            ])
            ->assertRedirect();

        $this->assertSame(1, $entryA->fresh()->position);
        $this->assertSame(0, $entryB->fresh()->position);

        $this->actingAs($admin)
            ->delete(route('admin.gold-list.destroy', $entryA))
            ->assertRedirect();

        $this->assertDatabaseMissing('gold_list_entries', ['id' => $entryA->id]);
    }

    public function test_guest_cannot_manage_gold_list(): void
    {
        $this->get(route('admin.gold-list.index'))->assertRedirect();
    }
}
