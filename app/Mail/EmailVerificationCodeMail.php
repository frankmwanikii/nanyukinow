<?php

namespace App\Mail;

use App\Support\EmailVerificationCode;
use App\Support\MailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $userEmail,
        public string $userName = '',
        public int $expiresMinutes = EmailVerificationCode::TTL_MINUTES,
    ) {}

    public function envelope(): Envelope
    {
        $brand = MailBranding::context();

        return new Envelope(
            subject: 'Your '.$brand['appName'].' verification code',
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
            html: 'mail.email-verification-code',
            text: 'mail.email-verification-code-text',
            with: [
                ...$brand,
                'greetingName' => $greetingName,
                'code' => $this->code,
                'userEmail' => $this->userEmail,
                'expiresMinutes' => $this->expiresMinutes,
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
