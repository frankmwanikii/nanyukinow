<?php

namespace App\Mail;

use App\Models\SiteSetting;
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
        $appName = (string) SiteSetting::getValue('site_name', config('app.name', 'Nanyuki Now'));

        return new Envelope(
            subject: 'You’re on the list — '.$appName.' Insider',
            replyTo: [
                new Address(
                    (string) SiteSetting::getValue(
                        'contact_email',
                        config('mail.from.address', 'hello@nanyukinow.co.ke'),
                    ),
                    $appName,
                ),
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
            html: 'mail.newsletter-subscription-confirmation',
            text: 'mail.newsletter-subscription-confirmation-text',
            with: [
                'appName' => $appName,
                'appUrl' => $appUrl,
                'logoUrl' => $appUrl.'/images/logo.png',
                'contactEmail' => $contactEmail,
                'contactPhone' => $contactPhone,
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
