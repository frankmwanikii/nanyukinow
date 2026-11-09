<?php

namespace App\Mail;

use App\Support\MailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterSubscriptionConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $subscriberEmail,
    ) {}

    public function envelope(): Envelope
    {
        $brand = MailBranding::context();

        return new Envelope(
            subject: 'You’re on the list: '.$brand['appName'].' Insider',
            replyTo: [
                new Address($brand['contactEmail'], $brand['appName']),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();

        return new Content(
            html: 'mail.newsletter-subscription-confirmation',
            text: 'mail.newsletter-subscription-confirmation-text',
            with: [
                ...$brand,
                'exploreUrl' => route('explore'),
                'storiesUrl' => route('stories.index'),
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
