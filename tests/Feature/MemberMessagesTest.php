<?php

namespace Tests\Feature;

use App\Mail\ListingInquiryConfirmationMail;
use App\Mail\ListingInquiryMail;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Models\User;
use App\Notifications\WelcomeMemberNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MemberMessagesTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(User $owner, array $overrides = []): Listing
    {
        $category = Category::query()->create([
            'name' => 'Stays',
            'slug' => 'stays-'.uniqid(),
            'sort_order' => 1,
        ]);

        return Listing::query()->create(array_merge([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Highland Lodge',
            'slug' => 'highland-lodge-'.uniqid(),
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'claimed',
            'is_published' => true,
            'location' => 'Nanyuki',
            'email' => 'lodge@example.com',
        ], $overrides));
    }

    public function test_guest_can_contact_listing_owner(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $listing = $this->makeListing($owner);

        $this->from(route('listings.show', $listing->slug))
            ->post(route('listings.contact', $listing->slug), [
                'first_name' => 'Jane',
                'last_name' => 'Wanjiru',
                'email' => 'jane@example.com',
                'phone' => '0712345678',
                'message' => 'Is this available next weekend?',
            ])
            ->assertRedirect();

        $conversation = Conversation::query()->where('listing_id', $listing->id)->first();
        $this->assertNotNull($conversation);
        $this->assertTrue($conversation->isParticipant($owner));
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'guest_name' => 'Jane Wanjiru',
            'body' => 'Is this available next weekend?',
        ]);

        Mail::assertSent(ListingInquiryMail::class, function (ListingInquiryMail $mail) use ($listing) {
            $mail->assertHasReplyTo('jane@example.com', 'Jane Wanjiru');
            $mail->assertTo('lodge@example.com');
            $mail->assertSeeInText('Is this available next weekend?');
            $mail->assertSeeInHtml('New inquiry');
            $mail->assertSeeInHtml('Is this available next weekend?');

            return $mail->listing->is($listing)
                && $mail->senderEmail === 'jane@example.com';
        });

        Mail::assertSent(ListingInquiryConfirmationMail::class, function (ListingInquiryConfirmationMail $mail) use ($listing) {
            $mail->assertTo('jane@example.com');
            $mail->assertSeeInHtml('Message on its way');
            $mail->assertSeeInHtml('Is this available next weekend?');

            return $mail->listing->is($listing)
                && $mail->senderEmail === 'jane@example.com';
        });
    }

    public function test_contact_inquiry_email_includes_uploaded_attachments(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $listing = $this->makeListing($owner);
        $file = UploadedFile::fake()->create('floor-plan.pdf', 200, 'application/pdf');

        $this->from(route('listings.show', $listing->slug))
            ->post(route('listings.contact', $listing->slug), [
                'first_name' => 'Jane',
                'last_name' => 'Wanjiru',
                'email' => 'jane@example.com',
                'message' => 'Here is the floor plan.',
                'attachments' => [$file],
            ])
            ->assertRedirect();

        Mail::assertSent(ListingInquiryMail::class, function (ListingInquiryMail $mail) {
            $mail->assertTo('lodge@example.com');

            return count($mail->files) === 1
                && ($mail->files[0]['name'] ?? null) === 'floor-plan.pdf';
        });
    }

    public function test_contact_email_falls_back_to_owner_and_requires_sender_email(): void
    {
        Mail::fake();

        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $listing = $this->makeListing($owner, ['email' => null]);

        $this->from(route('listings.show', $listing->slug))
            ->post(route('listings.contact', $listing->slug), [
                'first_name' => 'Jane',
                'last_name' => 'Wanjiru',
                'message' => 'Hello',
            ])
            ->assertSessionHasErrors('email');

        $this->from(route('listings.show', $listing->slug))
            ->post(route('listings.contact', $listing->slug), [
                'first_name' => 'Jane',
                'last_name' => 'Wanjiru',
                'email' => 'jane@example.com',
                'message' => 'Hello again',
            ])
            ->assertRedirect();

        Mail::assertSent(ListingInquiryMail::class, function (ListingInquiryMail $mail) {
            $mail->assertTo('owner@example.com');

            return true;
        });

        Mail::assertSent(ListingInquiryConfirmationMail::class, function (ListingInquiryConfirmationMail $mail) {
            $mail->assertTo('jane@example.com');

            return true;
        });
    }

    public function test_inbox_shows_chats_and_alerts(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeListing($owner);
        $owner->notify(new WelcomeMemberNotification);

        $conversation = Conversation::query()->create([
            'listing_id' => $listing->id,
            'subject' => 'Inquiry',
            'last_message_at' => now(),
        ]);
        $conversation->participants()->attach($owner->id, ['last_read_at' => null]);
        Message::query()->create([
            'conversation_id' => $conversation->id,
            'guest_name' => 'Jane',
            'body' => 'Hello',
        ]);

        $this->actingAs($owner)
            ->get(route('account.messages'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Messages/Index')
                ->has('conversations', 1)
                ->has('notifications', 1)
                ->where('unread.total', 2));
    }

    public function test_opening_chat_marks_read_and_shows_thread(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeListing($owner);

        $conversation = Conversation::query()->create([
            'listing_id' => $listing->id,
            'subject' => 'Inquiry',
            'last_message_at' => now(),
        ]);
        $conversation->participants()->attach($owner->id, ['last_read_at' => null]);
        Message::query()->create([
            'conversation_id' => $conversation->id,
            'guest_name' => 'Jane',
            'body' => 'Hello from Jane',
        ]);

        $this->actingAs($owner)
            ->get(route('account.messages.show', $conversation))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Messages/Index')
                ->where('activeType', 'chat')
                ->has('active.messages', 1));

        $this->assertNotNull(
            $conversation->participants()->where('users.id', $owner->id)->first()->pivot->last_read_at
        );
    }

    public function test_notification_opens_in_messages_inbox(): void
    {
        $user = User::factory()->create();
        $user->notify(new WelcomeMemberNotification);
        $notification = $user->notifications()->first();

        $this->actingAs($user)
            ->post(route('account.notifications.read', $notification->id))
            ->assertRedirect(route('account.messages', [
                'tab' => 'alerts',
                'n' => $notification->id,
            ]));

        $this->actingAs($user)
            ->get(route('account.messages', ['tab' => 'alerts', 'n' => $notification->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('activeType', 'alert')
                ->where('active.id', $notification->id));
    }

    public function test_member_can_delete_alert_and_chat(): void
    {
        $owner = User::factory()->create();
        $owner->notify(new WelcomeMemberNotification);
        $notification = $owner->notifications()->first();

        $listing = $this->makeListing($owner);
        $conversation = Conversation::query()->create([
            'listing_id' => $listing->id,
            'subject' => 'Inquiry',
            'last_message_at' => now(),
        ]);
        $conversation->participants()->attach($owner->id);
        Message::query()->create([
            'conversation_id' => $conversation->id,
            'guest_name' => 'Jane',
            'body' => 'Hello',
        ]);

        $this->actingAs($owner)
            ->delete(route('account.messages.alerts.destroy', $notification->id))
            ->assertRedirect(route('account.messages', ['tab' => 'alerts']));

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);

        $this->actingAs($owner)
            ->delete(route('account.messages.destroy', $conversation))
            ->assertRedirect(route('account.messages', ['tab' => 'chats']));

        $this->assertDatabaseMissing('conversations', ['id' => $conversation->id]);
    }

    public function test_notifications_index_redirects_to_messages(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.notifications'))
            ->assertRedirect(route('account.messages', ['tab' => 'alerts']));
    }
}
