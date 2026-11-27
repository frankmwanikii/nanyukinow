<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use App\Models\User;
use App\Support\HeroSlides;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminHeroSliderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        SiteSetting::forgetCache();
    }

    public function test_guest_cannot_view_hero_slider_admin(): void
    {
        $this->get(route('admin.hero-slider.index'))
            ->assertRedirect();
    }

    public function test_non_admin_cannot_view_hero_slider_admin(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.hero-slider.index'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_view_hero_slider_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.hero-slider.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/HeroSlider/Index')
                ->has('slides', count(HeroSlides::defaults()))
                ->missing('maxSlides'));
    }

    public function test_admin_can_update_hero_slides(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.hero-slider.index'))->assertOk();

        $payload = [
            'slides' => [
                [
                    'id' => 'custom-1',
                    'image' => '/images/hero/slide-2.webp',
                    'imageMobile' => '',
                    'alt' => 'Custom plains photo',
                    'title' => 'Custom plains',
                    'credit' => 'Edited by admin',
                    'showOnDesktop' => true,
                    'showOnMobile' => false,
                ],
                [
                    'id' => 'custom-2',
                    'image' => '/images/hero/bnb3.webp',
                    'imageMobile' => null,
                    'alt' => 'Stay photo',
                    'title' => 'Stay edit',
                    'credit' => 'Guest room',
                    'showOnDesktop' => false,
                    'showOnMobile' => true,
                ],
            ],
        ];

        $this->actingAs($admin)
            ->put(route('admin.hero-slider.update'), $payload)
            ->assertRedirect()
            ->assertSessionHas('success');

        $slides = HeroSlides::forHome();
        $this->assertCount(2, $slides);
        $this->assertSame('Custom plains', $slides[0]['title']);
        $this->assertSame('/images/hero/slide-2.webp', $slides[0]['image']);
        $this->assertTrue($slides[0]['showOnDesktop']);
        $this->assertFalse($slides[0]['showOnMobile']);
        $this->assertSame('Stay edit', $slides[1]['title']);
        $this->assertFalse($slides[1]['showOnDesktop']);
        $this->assertTrue($slides[1]['showOnMobile']);
    }

    public function test_admin_slide_with_both_visibility_off_defaults_to_both_on(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.hero-slider.index'))->assertOk();

        $this->actingAs($admin)
            ->put(route('admin.hero-slider.update'), [
                'slides' => [[
                    'id' => 'hidden-both',
                    'image' => '/images/hero/bnb3.webp',
                    'title' => 'Should stay visible',
                    'showOnDesktop' => false,
                    'showOnMobile' => false,
                ]],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $slides = HeroSlides::forHome();
        $this->assertCount(1, $slides);
        $this->assertTrue($slides[0]['showOnDesktop']);
        $this->assertTrue($slides[0]['showOnMobile']);
    }

    public function test_admin_can_upload_hero_image(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);
        $image = UploadedFile::fake()->image('hero.jpg', 1200, 800);

        $this->actingAs($admin)->get(route('admin.hero-slider.index'))->assertOk();

        $response = $this->actingAs($admin)
            ->postJson(route('admin.hero-slider.upload'), [
                'image' => $image,
            ]);

        $response->assertCreated()->assertJsonStructure(['url']);
        $url = $response->json('url');
        $this->assertIsString($url);
        $this->assertStringStartsWith('/storage/site/hero/', $url);
        Storage::disk('public')->assertExists(
            str_replace('/storage/', '', $url),
        );
    }

    public function test_update_rejects_empty_slide_images(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.hero-slider.index'))->assertOk();

        $this->actingAs($admin)
            ->from(route('admin.hero-slider.index'))
            ->put(route('admin.hero-slider.update'), [
                'slides' => [
                    [
                        'id' => 'bad',
                        'image' => '',
                        'title' => 'Missing image',
                    ],
                ],
            ])
            ->assertSessionHasErrors('slides.0.image');
    }
}
