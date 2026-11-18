<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingReport;
use App\Models\User;
use App\Support\Recaptcha;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingReportTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(): Listing
    {
        $owner = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay-'.uniqid(),
            'sort_order' => 1,
        ]);

        return Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Reportable Lodge',
            'slug' => 'reportable-lodge-'.uniqid(),
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'claimed',
            'is_published' => true,
            'location' => 'Nanyuki',
        ]);
    }

    public function test_guest_can_report_a_listing(): void
    {
        $listing = $this->makeListing();

        $this->from(route('listings.show', $listing->slug))
            ->post(route('listings.report', $listing->slug), [
                'reason' => 'Spam or fake listing',
                'details' => 'This listing looks duplicated and outdated.',
                'reporter_name' => 'Amina',
                'reporter_email' => 'amina@example.com',
                'g-recaptcha-response' => Recaptcha::FALLBACK_TOKEN,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('listing_reports', [
            'listing_id' => $listing->id,
            'reason' => 'Spam or fake listing',
            'status' => ListingReport::STATUS_PENDING,
            'reporter_email' => 'amina@example.com',
        ]);
    }

    public function test_report_requires_recaptcha(): void
    {
        $listing = $this->makeListing();

        $this->from(route('listings.show', $listing->slug))
            ->post(route('listings.report', $listing->slug), [
                'reason' => 'Spam or fake listing',
                'details' => 'This listing looks duplicated and outdated.',
                'reporter_name' => 'Amina',
                'reporter_email' => 'amina@example.com',
            ])
            ->assertSessionHasErrors('g-recaptcha-response');

        $this->assertDatabaseCount('listing_reports', 0);
    }

    public function test_admin_can_resolve_report(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing();
        $report = ListingReport::query()->create([
            'listing_id' => $listing->id,
            'reason' => 'Duplicate listing',
            'details' => 'Same business appears twice.',
            'status' => ListingReport::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.reports.resolve', $report), [
                'status' => 'reviewed',
                'admin_notes' => 'Merged with original.',
            ])
            ->assertRedirect(route('admin.reports.index', ['status' => 'pending']));

        $this->assertDatabaseHas('listing_reports', [
            'id' => $report->id,
            'status' => ListingReport::STATUS_REVIEWED,
            'admin_notes' => 'Merged with original.',
            'reviewed_by' => $admin->id,
        ]);
    }
}
