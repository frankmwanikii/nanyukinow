<?php

namespace Tests\Feature\Admin;

use App\Models\SupportTicket;
use App\Models\User;
use App\Notifications\SupportTicketRepliedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSupportTicketsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_tickets(): void
    {
        $this->get(route('admin.tickets.index'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_non_admin_cannot_view_tickets(): void
    {
        $member = User::factory()->create(['is_admin' => false]);

        $this->actingAs($member)
            ->get(route('admin.tickets.index'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_tickets_index_lists_open_tickets(): void
    {
        SupportTicket::query()->delete();

        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create(['name' => 'Amina Otieno']);

        SupportTicket::factory()->for($member)->create([
            'subject' => 'Cannot edit my listing',
            'priority' => SupportTicket::PRIORITY_HIGH,
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        SupportTicket::factory()->answered()->create([
            'subject' => 'Already answered',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.tickets.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Tickets/Index')
                ->where('filters.status', 'open')
                ->where('counts.open', 1)
                ->where('counts.answered', 1)
                ->has('tickets.data', 1)
                ->where('tickets.data.0.subject', 'Cannot edit my listing')
                ->where('tickets.data.0.user.name', 'Amina Otieno')
                ->where('openTickets', 1));
    }

    public function test_admin_can_view_ticket_and_download_attachment(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();

        $path = UploadedFile::fake()->create('receipt.pdf', 120, 'application/pdf')
            ->store('support-tickets/'.$member->id, 'local');

        $ticket = SupportTicket::factory()->for($member)->create([
            'subject' => 'Payment concern',
            'attachment_path' => $path,
            'attachment_name' => 'receipt.pdf',
            'attachment_mime' => 'application/pdf',
            'attachment_size' => 120,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.tickets.show', $ticket))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Tickets/Show')
                ->where('ticket.subject', 'Payment concern')
                ->where('ticket.has_attachment', true)
                ->where('ticket.attachment.name', 'receipt.pdf'));

        $this->actingAs($admin)
            ->get(route('admin.tickets.attachment', $ticket))
            ->assertOk();
    }

    public function test_admin_can_reply_and_notify_member(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $ticket = SupportTicket::factory()->for($member)->create([
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.tickets.reply', $ticket), [
                'admin_reply' => 'Thanks for writing in. We fixed the listing editor.',
            ])
            ->assertRedirect(route('admin.tickets.show', $ticket));

        $ticket->refresh();

        $this->assertSame(SupportTicket::STATUS_ANSWERED, $ticket->status);
        $this->assertSame(
            'Thanks for writing in. We fixed the listing editor.',
            $ticket->admin_reply,
        );
        $this->assertSame($admin->id, $ticket->reviewed_by);
        $this->assertNotNull($ticket->answered_at);

        Notification::assertSentTo($member, SupportTicketRepliedNotification::class);
    }

    public function test_admin_can_reply_and_close_ticket(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create();
        $ticket = SupportTicket::factory()->for($member)->create();

        $this->actingAs($admin)
            ->post(route('admin.tickets.reply', $ticket), [
                'admin_reply' => 'All set on our side.',
                'close' => true,
            ])
            ->assertRedirect(route('admin.tickets.show', $ticket));

        $ticket->refresh();

        $this->assertSame(SupportTicket::STATUS_CLOSED, $ticket->status);
        $this->assertNotNull($ticket->closed_at);
        Notification::assertSentTo($member, SupportTicketRepliedNotification::class);
    }

    public function test_admin_can_close_reopen_and_delete_ticket(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = SupportTicket::factory()->create([
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.tickets.close', $ticket))
            ->assertRedirect(route('admin.tickets.show', $ticket));

        $this->assertSame(SupportTicket::STATUS_CLOSED, $ticket->fresh()->status);

        $this->actingAs($admin)
            ->post(route('admin.tickets.reopen', $ticket))
            ->assertRedirect(route('admin.tickets.show', $ticket));

        $this->assertSame(SupportTicket::STATUS_OPEN, $ticket->fresh()->status);
        $this->assertNull($ticket->fresh()->closed_at);

        $this->actingAs($admin)
            ->delete(route('admin.tickets.destroy', $ticket))
            ->assertRedirect(route('admin.tickets.index'));

        $this->assertDatabaseMissing('support_tickets', ['id' => $ticket->id]);
    }

    public function test_reply_requires_message(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = SupportTicket::factory()->create();

        $this->actingAs($admin)
            ->from(route('admin.tickets.show', $ticket))
            ->post(route('admin.tickets.reply', $ticket), [
                'admin_reply' => '',
            ])
            ->assertRedirect(route('admin.tickets.show', $ticket))
            ->assertSessionHasErrors('admin_reply');
    }
}
