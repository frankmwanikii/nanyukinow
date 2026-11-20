<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StayGallerySpaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_create_stay_gallery_spaces(): void
    {
        $this->postJson(route('account.stay-gallery-spaces.store'), [
            'name' => 'Conference room',
        ])->assertUnauthorized();
    }

    public function test_user_can_create_stay_gallery_space_with_title(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.stay-gallery-spaces.store'), [
                'name' => 'Conference room',
            ])
            ->assertCreated()
            ->assertJsonPath('space.name', 'Conference room')
            ->assertJsonPath('space.slug', 'conference-room');

        $this->assertDatabaseHas('stay_gallery_spaces', [
            'name' => 'Conference room',
            'slug' => 'conference-room',
        ]);
    }

    public function test_creating_the_same_room_title_returns_existing_space(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.stay-gallery-spaces.store'), [
                'name' => 'Spa suite',
            ])
            ->assertCreated();

        $this->actingAs($user)
            ->postJson(route('account.stay-gallery-spaces.store'), [
                'name' => 'Spa suite',
            ])
            ->assertCreated()
            ->assertJsonPath('space.slug', 'spa-suite');

        $this->assertDatabaseCount('stay_gallery_spaces', 1);
    }

    public function test_name_is_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.stay-gallery-spaces.store'), [
                'name' => '',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }
}
