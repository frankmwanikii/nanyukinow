<?php

namespace App\Mail;

use App\Models\Listing;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ListingInquiryMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  list<array{path: string, name: string, mime: string|null}>  $files
     */
    public function __construct(
        public Listing $listing,
        public string $senderName,
        public string $senderEmail,
        public ?string $senderPhone,
        public string $messageBody,
        public array $files = [],
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New inquiry about '.$this->listing->title,
            replyTo: [
                new Address($this->senderEmail, $this->senderName),
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
        $contactPhone = trim((string) SiteSetting::getValue('contact_phone', '+254 700 000 000'));
        if ($contactPhone === '') {
            $contactPhone = '+254 700 000 000';
        }

        return new Content(
            html: 'mail.listing-inquiry',
            text: 'mail.listing-inquiry-text',
            with: [
                'listingUrl' => route('listings.show', $this->listing->slug),
                'appName' => $appName,
                'appUrl' => $appUrl,
                'logoUrl' => $appUrl.'/images/logo.png',
                'contactEmail' => $contactEmail,
                'contactPhone' => $contactPhone,
                'attachmentCount' => count($this->files),
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return collect($this->files)
            ->filter(fn (array $file) => is_string($file['path'] ?? null) && is_file($file['path']))
            ->map(function (array $file) {
                $attachment = Attachment::fromPath($file['path'])
                    ->as($file['name'] ?: basename($file['path']));

                if (! empty($file['mime'])) {
                    $attachment->withMime($file['mime']);
                }

                return $attachment;
            })
            ->values()
            ->all();
    }
}
