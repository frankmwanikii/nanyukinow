<?php

namespace Tests\Feature\Admin;

use App\Mail\AdminBroadcastMail;
use App\Models\Category;
use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MessagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_admin_messages(): void
    {
        $this->get(route('admin.messages.index'))
            ->assertRedirect();
    }

    public function test_member_cannot_view_admin_messages(): void
    {
        $member = User::factory()->create(['is_admin' => false]);

        $this->actingAs($member)
            ->get(route('admin.messages.index'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_view_messages_inbox(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $owner = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Stays',
            'slug' => 'stays-'.uniqid(),
            'sort_order' => 1,
        ]);
        $listing = Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Lodge',
            'slug' => 'lodge-'.uniqid(),
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
        ]);
        $conversation = Conversation::query()->create([
            'listing_id' => $listing->id,
            'subject' => 'Weekend availability',
            'admin_status' => 'new',
            'last_message_at' => now(),
        ]);
        Message::query()->create([
            'conversation_id' => $conversation->id,
            'guest_name' => 'Jane',
            'guest_email' => 'jane@example.com',
            'body' => 'Is this free Saturday?',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.messages.index', ['folder' => 'inbox']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Messages/Index')
                ->where('folder', 'inbox')
                ->has('messages.data', 1)
                ->where('messages.data.0.name', 'Jane')
                ->has('counts'));
    }

    public function test_admin_can_broadcast_email_to_all_members(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'is_admin' => true,
            'email' => 'admin@example.com',
        ]);
        User::factory()->create(['email' => 'member@example.com', 'name' => 'Member One']);

        $this->actingAs($admin)
            ->post(route('admin.messages.store'), [
                'intent' => 'send',
                'mode' => 'audience',
                'channel' => 'email',
                'audience' => 'all_members',
                'subject' => 'Weekend picks',
                'body' => "Hello from Nanyuki Now.\n\nSee you soon.",
            ])
            ->assertRedirect(route('admin.messages.index', ['folder' => 'sent']));

        Mail::assertSent(AdminBroadcastMail::class, 2);

        $this->assertDatabaseHas('communication_campaigns', [
            'user_id' => $admin->id,
            'channel' => 'email',
            'audience' => 'all_members',
            'subject' => 'Weekend picks',
            'status' => CommunicationCampaign::STATUS_SENT,
            'recipient_count' => 2,
            'sent_count' => 2,
        ]);

        $this->assertSame(2, CommunicationLog::query()->count());
    }

    public function test_admin_can_broadcast_to_newsletter_subscribers(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        NewsletterSubscriber::query()->create([
            'email' => 'fan@example.com',
            'subscribed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.messages.store'), [
                'intent' => 'send',
                'mode' => 'audience',
                'channel' => 'email',
                'audience' => 'newsletter',
                'subject' => 'Insider update',
                'body' => 'Fresh stays this week.',
            ])
            ->assertRedirect(route('admin.messages.index', ['folder' => 'sent']));

        Mail::assertSent(AdminBroadcastMail::class, function (AdminBroadcastMail $mail) {
            return $mail->hasTo('fan@example.com')
                && $mail->subjectLine === 'Insider update';
        });

        $this->assertDatabaseHas('communication_logs', [
            'recipient_email' => 'fan@example.com',
            'subject' => 'Insider update',
            'status' => 'sent',
        ]);
    }

    public function test_sms_broadcast_is_saved_but_not_delivered(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        User::factory()->create([
            'email' => 'mobile@example.com',
            'phone' => '0712345678',
        ]);

        $this->actingAs($admin)
            ->from(route('admin.messages.index', ['folder' => 'compose']))
            ->post(route('admin.messages.store'), [
                'intent' => 'send',
                'mode' => 'audience',
                'channel' => 'sms',
                'audience' => 'all_members',
                'subject' => 'Flash offer',
                'body' => '20% off stays this weekend',
            ])
            ->assertRedirect(route('admin.messages.index', ['folder' => 'sent']));

        Mail::assertNothingSent();

        $this->assertDatabaseHas('communication_campaigns', [
            'channel' => 'sms',
            'status' => CommunicationCampaign::STATUS_FAILED,
            'sent_count' => 0,
        ]);
    }

    public function test_admin_can_save_draft(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.messages.store'), [
                'intent' => 'draft',
                'mode' => 'audience',
                'channel' => 'email',
                'audience' => 'newsletter',
                'subject' => 'Draft subject',
                'body' => 'Draft body',
            ])
            ->assertRedirect(route('admin.messages.index', ['folder' => 'drafts']));

        $this->assertDatabaseHas('communication_campaigns', [
            'subject' => 'Draft subject',
            'status' => CommunicationCampaign::STATUS_DRAFT,
        ]);
    }
}
