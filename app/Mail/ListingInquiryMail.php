<?php

namespace App\Mail;

use App\Models\Listing;
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
        return new Content(
            markdown: 'mail.listing-inquiry',
            with: [
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
