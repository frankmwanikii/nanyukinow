<?php

namespace App\Mail;

use App\Models\Listing;
use App\Support\MailBranding;
use App\Support\SafeHtml;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ListingOwnerReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Listing $listing,
        public string $ownerName,
        public string $ownerEmail,
        public string $guestName,
        public string $messageBody,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reply about '.$this->listing->title,
            replyTo: [
                new Address($this->ownerEmail, $this->ownerName),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();

        return new Content(
            html: 'mail.listing-owner-reply',
            text: 'mail.listing-owner-reply-text',
            with: [
                ...$brand,
                'listingTitle' => $this->listing->title,
                'listingUrl' => route('listings.show', $this->listing->slug),
                'ownerName' => $this->ownerName,
                'ownerEmail' => $this->ownerEmail,
                'guestName' => $this->guestName,
                'messageBody' => $this->messageBody,
                'messagePlain' => SafeHtml::toPlainText($this->messageBody),
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
