<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Support\HeroSlides;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeHeroSlidesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['site.preview_gate_enabled' => false]);
        SiteSetting::forgetCache();
    }

    public function test_home_includes_default_hero_slides(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->has('heroSlides', count(HeroSlides::defaults()))
                ->where('heroSlides.0.image', '/images/hero/slide_1.webp')
                ->where('heroSlides.0.title', 'Nanyuki Now')
                ->where(
                    'heroSlides.1.title',
                    "Discover Nanyuki's wild side",
                ));
    }

    public function test_home_uses_saved_hero_slides(): void
    {
        HeroSlides::save([
            [
                'id' => 'only',
                'image' => '/images/hero/bnb3.webp',
                'title' => 'Saved stay',
                'credit' => 'From admin',
                'alt' => 'Saved stay alt',
            ],
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->has('heroSlides', 1)
                ->where('heroSlides.0.title', 'Saved stay')
                ->where('heroSlides.0.image', '/images/hero/bnb3.webp'));
    }
}
