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

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $resetUrl,
        public string $userEmail,
        public string $userName = '',
        public int $expiresMinutes = 60,
    ) {}

    public function envelope(): Envelope
    {
        $appName = (string) SiteSetting::getValue('site_name', config('app.name', 'Nanyuki Now'));

        return new Envelope(
            subject: 'Reset your '.$appName.' password',
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

        $greetingName = trim($this->userName);
        if ($greetingName === '') {
            $greetingName = 'there';
        }

        return new Content(
            html: 'mail.password-reset',
            text: 'mail.password-reset-text',
            with: [
                'appName' => $appName,
                'appUrl' => $appUrl,
                'logoUrl' => $appUrl.'/images/logo.png',
                'contactEmail' => $contactEmail,
                'contactPhone' => $contactPhone,
                'greetingName' => $greetingName,
                'resetUrl' => $this->resetUrl,
                'userEmail' => $this->userEmail,
                'expiresMinutes' => $this->expiresMinutes,
                'loginUrl' => route('login'),
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
