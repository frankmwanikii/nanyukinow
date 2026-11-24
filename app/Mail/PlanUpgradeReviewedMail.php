<?php

namespace App\Mail;

use App\Models\PlanUpgrade;
use App\Support\MailBranding;
use App\Support\Membership;
use App\Support\PaymentReceipt;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlanUpgradeReviewedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PlanUpgrade $upgrade,
        public string $userName = '',
    ) {}

    public function envelope(): Envelope
    {
        $brand = MailBranding::context();
        $label = Membership::label($this->upgrade->to_plan);
        $approved = $this->upgrade->status === PlanUpgrade::STATUS_APPROVED;

        return new Envelope(
            subject: $approved
                ? 'Your '.$label.' plan is active'
                : 'Update on your '.$label.' upgrade',
            replyTo: [
                new Address($brand['contactEmail'], $brand['appName']),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();
        $approved = $this->upgrade->status === PlanUpgrade::STATUS_APPROVED;
        $label = Membership::label($this->upgrade->to_plan);
        $periodLabel = match ($this->upgrade->billing_period) {
            'month' => 'monthly',
            'year' => 'yearly',
            'one_time' => 'one-time',
            default => null,
        };

        $greetingName = trim($this->userName);
        if ($greetingName === '') {
            $greetingName = 'there';
        }

        $this->upgrade->loadMissing('user');
        $user = $this->upgrade->user;
        $deferred = $approved
            && $user
            && filled($user->scheduled_plan)
            && $user->scheduled_plan_at !== null
            && $user->scheduled_plan_at->isFuture();
        $startsOn = $deferred
            ? $user->scheduled_plan_at->timezone(config('app.timezone'))->format('j M Y')
            : null;

        return new Content(
            html: 'mail.plan-upgrade-reviewed',
            text: 'mail.plan-upgrade-reviewed-text',
            with: [
                ...$brand,
                'greetingName' => $greetingName,
                'headline' => $approved
                    ? ($deferred ? 'Payment confirmed' : 'Your plan is active')
                    : 'Upgrade request update',
                'intro' => $approved
                    ? ($deferred
                        ? 'good news. Your payment was confirmed. Your '.$label.' plan starts on '.$startsOn.' when your Premium trial ends, so you keep the full trial.'
                        : 'good news. Your payment was confirmed and your plan is now active on '.$brand['appName'].'.')
                    : 'your upgrade request was not approved.',
                'planLabel' => $label,
                'periodLabel' => $periodLabel,
                'paymentReference' => $this->upgrade->payment_reference,
                'adminNotes' => $approved ? null : $this->upgrade->admin_notes,
                'supportLine' => $approved
                    ? ($deferred
                        ? 'Your payment receipt is attached as a PDF. Enjoy the rest of your trial. '.$label.' begins automatically on '.$startsOn.'.'
                        : 'Your payment receipt is attached as a PDF. You can add more listings and unlock better placement from your account.')
                    : 'You can submit a new upgrade request from your account whenever you are ready.',
                'actionUrl' => $approved ? route('account.index') : route('account.upgrade'),
                'actionLabel' => $approved ? 'Open account' : 'Try again',
                'disclaimer' => $approved
                    ? 'This email confirms a plan payment update on your '.$brand['appName'].' account. Never share payment PINs or passwords with anyone. If you did not expect this change,'
                    : 'This email is about a plan upgrade request on your '.$brand['appName'].' account. Never share payment PINs or passwords with anyone. If you need help,',
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if ($this->upgrade->status !== PlanUpgrade::STATUS_APPROVED) {
            return [];
        }

        $pdf = PaymentReceipt::pdfOrNull($this->upgrade);

        if ($pdf === null) {
            return [];
        }

        return [
            Attachment::fromData(
                fn () => $pdf,
                PaymentReceipt::filename($this->upgrade),
            )->withMime('application/pdf'),
        ];
    }
}
