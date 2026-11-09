<?php

namespace App\Mail;

use App\Support\MailBranding;
use App\Support\Membership;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlanRenewalReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $planKey,
        public int $daysLeft,
        public string $userName = '',
        public ?string $expiresAt = null,
        public ?string $billingPeriod = null,
    ) {}

    public function envelope(): Envelope
    {
        $brand = MailBranding::context();
        $label = Membership::label($this->planKey);

        return new Envelope(
            subject: $this->daysLeft <= 3
                ? 'Your '.$label.' plan expires in '.$this->daysLeft.' days'
                : 'Renew your '.$label.' plan in '.$this->daysLeft.' days',
            replyTo: [
                new Address($brand['contactEmail'], $brand['appName']),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();
        $label = Membership::label($this->planKey);
        $greetingName = trim($this->userName) !== '' ? trim($this->userName) : 'there';
        $periodLabel = match ($this->billingPeriod) {
            'month' => 'monthly',
            'year' => 'yearly',
            'one_time' => 'one-time',
            default => null,
        };

        return new Content(
            html: 'mail.plan-renewal-reminder',
            text: 'mail.plan-renewal-reminder-text',
            with: [
                ...$brand,
                'greetingName' => $greetingName,
                'headline' => $this->daysLeft <= 3
                    ? 'Renew in '.$this->daysLeft.' days'
                    : 'Renewal reminder',
                'intro' => $this->daysLeft <= 3
                    ? 'your '.$label.' plan expires soon. Renew now to keep your listings visible on '.$brand['appName'].'.'
                    : 'your '.$label.' plan expires in '.$this->daysLeft.' days. Renew on time so your listings stay live on '.$brand['appName'].'.',
                'planLabel' => $label,
                'periodLabel' => $periodLabel,
                'daysLeft' => $this->daysLeft,
                'expiresAtLabel' => $this->expiresAt,
                'actionUrl' => route('account.upgrade', [
                    'plan' => Membership::normalize($this->planKey),
                    'billing' => $this->billingPeriod === 'year' ? 'year' : 'month',
                    'renew' => 1,
                ]),
                'actionLabel' => 'Renew plan',
                'disclaimer' => 'This email is a renewal reminder for your '.$brand['appName'].' plan. Never share payment PINs or passwords with anyone. If you need help,',
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
