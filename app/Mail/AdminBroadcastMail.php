<?php

namespace App\Mail;

use App\Support\MailBranding;
use App\Support\SafeHtml;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminBroadcastMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $subjectLine,
        public string $bodyText,
        public string $recipientName = '',
    ) {}

    public function envelope(): Envelope
    {
        $brand = MailBranding::context();

        return new Envelope(
            subject: $this->subjectLine,
            replyTo: [
                new Address($brand['contactEmail'], $brand['appName']),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();

        $greeting = filled($this->recipientName) && ! str_contains($this->recipientName, '@')
            ? 'Hi '.$this->recipientName.','
            : 'Hi there,';

        $bodyHtml = SafeHtml::sanitizeMessage($this->bodyText);
        $plain = SafeHtml::toPlainText($bodyHtml !== '' ? $bodyHtml : $this->bodyText);
        $bodyParagraphs = $bodyHtml === ''
            ? (preg_split("/\r\n|\n|\r/", trim($this->bodyText)) ?: [])
            : (preg_split("/\r\n|\n|\r/", $plain) ?: []);

        return new Content(
            html: 'mail.admin-broadcast',
            text: 'mail.admin-broadcast-text',
            with: [
                ...$brand,
                'greeting' => $greeting,
                'subjectLine' => $this->subjectLine,
                'bodyHtml' => $bodyHtml,
                'bodyParagraphs' => $bodyParagraphs,
                'exploreUrl' => route('explore'),
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
