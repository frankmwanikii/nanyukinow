<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AccountListingVideoUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_upload_listing_video(): void
    {
        Storage::fake('public');

        $this->postJson(route('account.listings.editor-video'), [
            'video' => UploadedFile::fake()->create('clip.mp4', 500, 'video/mp4'),
        ])->assertUnauthorized();
    }

    public function test_user_can_upload_listing_video(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $video = UploadedFile::fake()->create('clip.mp4', 800, 'video/mp4');

        $response = $this->actingAs($user)
            ->postJson(route('account.listings.editor-video'), [
                'video' => $video,
            ]);

        $response->assertCreated()->assertJsonStructure(['url']);
        $url = $response->json('url');
        $this->assertIsString($url);
        $this->assertStringStartsWith('/storage/listings/videos/', $url);
        $this->assertStringEndsWith('.mp4', $url);
        Storage::disk('public')->assertExists(
            str_replace('/storage/', '', $url),
        );
    }

    public function test_video_upload_rejects_oversized_files(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        // Laravel max:10240 is kilobytes; 11MB should fail.
        $video = UploadedFile::fake()->create('big.mp4', 11 * 1024, 'video/mp4');

        $this->actingAs($user)
            ->postJson(route('account.listings.editor-video'), [
                'video' => $video,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['video']);
    }

    public function test_video_upload_rejects_non_video_files(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $image = UploadedFile::fake()->image('not-a-video.jpg', 320, 240);

        $this->actingAs($user)
            ->postJson(route('account.listings.editor-video'), [
                'video' => $image,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['video']);
    }
}
