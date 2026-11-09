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
        $brand = MailBranding::context();

        return new Envelope(
            subject: 'Reset your '.$brand['appName'].' password',
            replyTo: [
                new Address($brand['contactEmail'], $brand['appName']),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();

        $greetingName = trim($this->userName);
        if ($greetingName === '') {
            $greetingName = 'there';
        }

        return new Content(
            html: 'mail.password-reset',
            text: 'mail.password-reset-text',
            with: [
                ...$brand,
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
