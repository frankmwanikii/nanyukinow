<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\UserAvatar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserAvatarPublicUrlTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_url_returns_null_when_local_file_is_missing(): void
    {
        Storage::fake('public');

        $this->assertNull(
            UserAvatar::publicUrl('/storage/avatars/missing.webp'),
        );
    }

    public function test_public_url_returns_path_when_local_file_exists(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/present.webp', 'fake-image');

        $this->assertSame(
            '/storage/avatars/present.webp',
            UserAvatar::publicUrl('/storage/avatars/present.webp'),
        );
    }

    public function test_shared_auth_avatar_is_null_when_file_is_missing(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'avatar_url' => '/storage/avatars/gone.webp',
        ]);

        $this->actingAs($user)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.avatar_url', null)
            );
    }

    public function test_clear_unusable_nulls_broken_storage_path(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'avatar_url' => '/storage/',
        ]);

        $this->assertTrue(UserAvatar::clearUnusable($user));
        $this->assertNull($user->refresh()->avatar_url);
    }

    public function test_profile_page_uses_public_avatar_url(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/present.webp', 'fake-image');

        $user = User::factory()->create([
            'avatar_url' => '/storage/avatars/present.webp',
        ]);

        $this->actingAs($user)
            ->get(route('profile.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('avatarUrl', '/storage/avatars/present.webp')
                ->where('auth.user.avatar_url', '/storage/avatars/present.webp')
            );
    }
}
