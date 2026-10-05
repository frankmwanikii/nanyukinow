<?php

namespace App\Mail;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ListingInquiryConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Listing $listing,
        public string $senderName,
        public string $senderEmail,
        public ?string $senderPhone,
        public string $messageBody,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We sent your message about '.$this->listing->title,
            replyTo: [
                new Address(
                    config('mail.from.address', 'info@nanyukinow.co.ke'),
                    config('mail.from.name', config('app.name', 'Nanyuki Now')),
                ),
            ],
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'mail.listing-inquiry-confirmation',
            text: 'mail.listing-inquiry-confirmation-text',
            with: [
                'listingUrl' => route('listings.show', $this->listing->slug),
                'appName' => config('app.name', 'Nanyuki Now'),
                'appUrl' => config('app.url'),
            ],
        );
    }

    /**
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
