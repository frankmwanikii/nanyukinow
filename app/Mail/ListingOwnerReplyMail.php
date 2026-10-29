<?php

namespace App\Mail;

use App\Models\Listing;
use App\Models\SiteSetting;
use App\Support\SafeHtml;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
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
        $appUrl = rtrim((string) config('app.url'), '/');
        $appName = (string) SiteSetting::getValue('site_name', config('app.name', 'Nanyuki Now'));
        $contactEmail = (string) SiteSetting::getValue(
            'contact_email',
            config('mail.from.address', 'hello@nanyukinow.co.ke'),
        );

        return new Content(
            text: 'mail.listing-owner-reply-text',
            with: [
                'listingTitle' => $this->listing->title,
                'listingUrl' => route('listings.show', $this->listing->slug),
                'ownerName' => $this->ownerName,
                'guestName' => $this->guestName,
                'messagePlain' => SafeHtml::toPlainText($this->messageBody),
                'appName' => $appName,
                'appUrl' => $appUrl,
                'contactEmail' => $contactEmail,
            ],
        );
    }
}
