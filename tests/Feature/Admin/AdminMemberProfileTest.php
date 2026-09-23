<?php

namespace Tests\Feature\Admin;

use App\Models\Listing;
use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminMemberProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_member_profile(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->premium()->create([
            'phone' => '0712345678',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', $member))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Show')
                ->where('tab', 'profile')
                ->where('user.id', $member->id)
                ->where('user.phone', '0712345678')
                ->has('membership')
                ->where('membership.key', 'premium')
                ->has('membership.expires_at'));
    }

    public function test_member_listings_tab_returns_their_listings(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $other = User::factory()->create();

        $owned = Listing::query()->create([
            'user_id' => $member->id,
            'title' => 'Owned Lodge',
            'slug' => 'owned-lodge-'.uniqid(),
            'status' => 'published',
            'tier' => 'free',
        ]);
        Listing::query()->create([
            'user_id' => $other->id,
            'title' => 'Someone Else',
            'slug' => 'someone-else-'.uniqid(),
            'status' => 'published',
            'tier' => 'free',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', ['user' => $member, 'tab' => 'listings']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Show')
                ->where('tab', 'listings')
                ->has('listings.data', 1)
                ->where('listings.data.0.id', $owned->id)
                ->where('listings.data.0.title', 'Owned Lodge'));
    }

    public function test_member_payments_tab_returns_history(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();

        $upgrade = PlanUpgrade::query()->create([
            'user_id' => $member->id,
            'from_plan' => 'free',
            'to_plan' => 'premium',
            'amount' => 5500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_APPROVED,
            'payment_reference' => 'ABC123',
            'payment_method' => 'mpesa',
            'reviewed_at' => now(),
            'reviewed_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', ['user' => $member, 'tab' => 'payments']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Show')
                ->where('tab', 'payments')
                ->has('payments.data', 1)
                ->where('payments.data.0.id', $upgrade->id)
                ->where('payments.data.0.payment_reference', 'ABC123'));
    }

    public function test_admin_can_update_member_profile_fields(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create([
            'name' => 'Old Name',
            'username' => 'olduser',
            'email' => 'old@example.com',
            'phone' => null,
        ]);
        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $this->actingAs($admin)
            ->post(route('admin.users.update', $member), [
                '_method' => 'put',
                'name' => 'New Name',
                'username' => 'newuser',
                'email' => 'new@example.com',
                'phone' => '0700111222',
                'is_admin' => false,
                'avatar' => $file,
            ])
            ->assertRedirect();

        $member->refresh();
        $this->assertSame('New Name', $member->name);
        $this->assertSame('newuser', $member->username);
        $this->assertSame('new@example.com', $member->email);
        $this->assertSame('0700111222', $member->phone);
        $this->assertNotNull($member->avatar_url);
        $this->assertNull($member->email_verified_at);
    }

    public function test_admin_can_open_pricing_edit_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PricingPlan::ensureDefaults();
        $plan = PricingPlan::query()->where('key', 'premium')->firstOrFail();

        $this->actingAs($admin)
            ->get(route('admin.pricing.edit', $plan))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Pricing/Edit')
                ->where('plan.key', 'premium')
                ->where('plan.id', $plan->id)
                ->has('billingPeriods'));
    }
}
