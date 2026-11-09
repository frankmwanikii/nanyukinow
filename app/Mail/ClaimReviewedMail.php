<?php

namespace App\Mail;

use App\Models\Listing;
use App\Models\ListingClaim;
use App\Support\MailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClaimReviewedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ListingClaim $claim,
        public Listing $listing,
        public string $outcome,
        public string $userName = '',
    ) {}

    public function envelope(): Envelope
    {
        $brand = MailBranding::context();
        $approved = $this->outcome === 'approved';

        return new Envelope(
            subject: $approved
                ? 'Your claim for “'.$this->listing->title.'” was approved'
                : 'Update on your claim for “'.$this->listing->title.'”',
            replyTo: [
                new Address($brand['contactEmail'], $brand['appName']),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();
        $approved = $this->outcome === 'approved';

        $greetingName = trim($this->userName);
        if ($greetingName === '') {
            $greetingName = $this->claim->fullName() ?: 'there';
        }

        return new Content(
            html: 'mail.claim-reviewed',
            text: 'mail.claim-reviewed-text',
            with: [
                ...$brand,
                'greetingName' => $greetingName,
                'headline' => $approved ? 'Claim approved' : 'Claim update',
                'intro' => $approved
                    ? 'good news. Your ownership claim was approved and you can manage the listing from your account.'
                    : 'your ownership claim was not approved.',
                'listingTitle' => $this->listing->title,
                'adminNotes' => $approved ? null : $this->claim->admin_notes,
                'supportLine' => 'Thank you for helping keep '.$brand['appName'].' accurate.',
                'actionUrl' => $approved
                    ? route('account.index')
                    : route('listings.show', $this->listing->slug),
                'actionLabel' => $approved ? 'Open account' : 'View listing',
                'disclaimer' => $approved
                    ? 'This email confirms a listing claim update on your '.$brand['appName'].' account. Never share passwords or payment PINs with anyone. If you did not expect this change,'
                    : 'This email is about a listing claim on your '.$brand['appName'].' account. Never share passwords or payment PINs with anyone. If you need help,',
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
