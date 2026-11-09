<?php

namespace Tests\Feature;

use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AccountSupportTicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_tickets(): void
    {
        $this->get(route('account.tickets.index'))
            ->assertRedirect(route('login'));
    }

    public function test_member_can_view_tickets_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.tickets.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Tickets/Index')
                ->has('tickets')
                ->has('priorities', 4));
    }

    public function test_member_can_open_a_ticket_with_priority(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('account.tickets.store'), [
                'subject' => 'Billing question',
                'body' => 'I paid for Standard but my plan still shows Free on the dashboard.',
                'priority' => SupportTicket::PRIORITY_HIGH,
            ])
            ->assertRedirect();

        $ticket = SupportTicket::query()->first();
        $this->assertNotNull($ticket);
        $this->assertSame($user->id, $ticket->user_id);
        $this->assertSame('Billing question', $ticket->subject);
        $this->assertSame(SupportTicket::PRIORITY_HIGH, $ticket->priority);
        $this->assertSame(SupportTicket::STATUS_OPEN, $ticket->status);

        $this->actingAs($user)
            ->get(route('account.tickets.show', $ticket))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Tickets/Show')
                ->where('ticket.reference', $ticket->reference())
                ->where('ticket.priority', SupportTicket::PRIORITY_HIGH));
    }

    public function test_member_cannot_view_another_members_ticket(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $ticket = SupportTicket::factory()->for($owner)->create();

        $this->actingAs($other)
            ->get(route('account.tickets.show', $ticket))
            ->assertForbidden();
    }

    public function test_ticket_validation_requires_subject_body_and_priority(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('account.tickets.store'), [
                'subject' => '',
                'body' => 'Too short',
                'priority' => 'critical',
            ])
            ->assertSessionHasErrors(['subject', 'body', 'priority']);
    }

    public function test_member_can_open_a_ticket_with_attachment(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('receipt.pdf', 120, 'application/pdf');

        $this->actingAs($user)
            ->post(route('account.tickets.store'), [
                'subject' => 'Payment proof',
                'body' => 'Here is my M-Pesa receipt for the Standard plan renewal.',
                'priority' => SupportTicket::PRIORITY_NORMAL,
                'attachment' => $file,
            ])
            ->assertRedirect();

        $ticket = SupportTicket::query()->first();
        $this->assertNotNull($ticket);
        $this->assertTrue($ticket->hasAttachment());
        $this->assertSame('receipt.pdf', $ticket->attachment_name);
        Storage::disk('local')->assertExists($ticket->attachment_path);

        $this->actingAs($user)
            ->get(route('account.tickets.attachment', $ticket))
            ->assertOk();
    }
}
