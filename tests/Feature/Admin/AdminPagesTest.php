<?php

namespace Tests\Feature\Admin;

use App\Models\SitePage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_pages_index(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.pages.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Pages/Index')
                ->has('pages', 6));
    }

    public function test_admin_can_edit_and_save_home_page_content(): void
    {
        $admin = User::factory()->admin()->create();
        SitePage::ensureDefaults();
        $home = SitePage::query()->where('slug', 'home')->firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.pages.update', $home), [
                'title' => 'Home',
                'meta_title' => 'Nanyuki Now Home',
                'meta_description' => 'Updated description',
                'is_published' => true,
                'content' => [
                    'hero_headline' => 'Welcome to Nanyuki',
                    'hero_subtext' => 'Updated subtext',
                    'cta_label' => 'Start exploring',
                    'cta_url' => '/explore',
                    'gold_list_title' => 'Gold picks',
                    'gold_list_subtitle' => 'Editor picks',
                    'airbnbs_title' => 'Stays',
                    'airbnbs_subtitle' => 'Homes nearby',
                    'hero_image' => '',
                ],
            ])
            ->assertRedirect(route('admin.pages.edit', $home));

        $home->refresh();
        $this->assertSame('Welcome to Nanyuki', $home->content['hero_headline']);
        $this->assertSame('Nanyuki Now Home', $home->meta_title);
    }

    public function test_settings_no_longer_includes_home_group(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index')
                ->missing('groupedSettings.home')
                ->has('groupedSettings.branding')
                ->has('groupedSettings.payments'));
    }
}
