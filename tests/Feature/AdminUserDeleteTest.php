<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\User;
use App\Support\Recaptcha;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminUserDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_delete_removes_member_and_blocks_password_login(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create([
            'email' => 'gone@example.com',
            'username' => 'gone_member',
        ]);

        DB::table(config('session.table', 'sessions'))->insert([
            'id' => 'member-session-1',
            'user_id' => $member->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'phpunit',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $member))
            ->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');

        $this->assertNull($member->fresh());
        $this->assertSame(
            0,
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $member->id)
                ->count(),
        );

        $this->post('/logout');

        $this->from('/login')->post('/login', [
            'login' => 'gone@example.com',
            'password' => 'password',
            'g-recaptcha-response' => Recaptcha::FALLBACK_TOKEN,
        ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors([
                'login' => 'No account found with those details.',
            ]);

        $this->assertGuest();
    }

    public function test_admin_delete_leaves_listings_unclaimed_without_assigning_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();

        $published = Listing::query()->create([
            'user_id' => $member->id,
            'title' => 'Public Lodge',
            'slug' => 'public-lodge-'.uniqid(),
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'claimed',
            'is_published' => true,
            'claim_grace_ends_at' => now()->addDays(3),
        ]);

        $draft = Listing::query()->create([
            'user_id' => $member->id,
            'title' => 'Half Done Spot',
            'slug' => 'half-done-'.uniqid(),
            'status' => 'pending',
            'tier' => 'free',
            'claim_status' => 'claimed',
            'is_published' => false,
        ]);

        $archived = Listing::query()->create([
            'user_id' => $member->id,
            'title' => 'Old Spot',
            'slug' => 'old-spot-'.uniqid(),
            'status' => 'archived',
            'tier' => 'free',
            'claim_status' => 'claimed',
            'is_published' => false,
        ]);

        ListingClaim::query()->create([
            'listing_id' => $published->id,
            'user_id' => $member->id,
            'first_name' => 'Gone',
            'last_name' => 'Member',
            'email' => $member->email,
            'phone' => '0700000000',
            'reason' => 'I own this place',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $member))
            ->assertRedirect(route('admin.users.index'));

        $this->assertNull($member->fresh());

        $published->refresh();
        $draft->refresh();
        $archived->refresh();

        $this->assertNull($published->user_id);
        $this->assertSame('unclaimed', $published->claim_status);
        $this->assertTrue($published->is_published);
        $this->assertSame('published', $published->status);
        $this->assertNull($published->claim_grace_ends_at);

        $this->assertNull($draft->user_id);
        $this->assertSame('unclaimed', $draft->claim_status);
        $this->assertFalse($draft->is_published);
        $this->assertSame('draft', $draft->status);

        $this->assertNull($archived->user_id);
        $this->assertSame('unclaimed', $archived->claim_status);
        $this->assertFalse($archived->is_published);
        $this->assertSame('archived', $archived->status);

        $this->assertSame(
            ListingClaim::STATUS_REJECTED,
            ListingClaim::query()->where('listing_id', $published->id)->value('status'),
        );
        $this->assertNotSame($admin->id, $published->user_id);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->from(route('admin.users.show', $admin))
            ->delete(route('admin.users.destroy', $admin))
            ->assertRedirect(route('admin.users.show', $admin))
            ->assertSessionHas('error');

        $this->assertNotNull($admin->fresh());
    }
}
