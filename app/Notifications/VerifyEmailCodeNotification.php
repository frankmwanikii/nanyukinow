<?php

namespace App\Notifications;

use App\Mail\EmailVerificationCodeMail;
use App\Support\EmailVerificationCode;
use Illuminate\Notifications\Notification;

class VerifyEmailCodeNotification extends Notification
{
    public function __construct(public string $code) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): EmailVerificationCodeMail
    {
        $email = (string) $notifiable->getEmailForVerification();

        return (new EmailVerificationCodeMail(
            code: $this->code,
            userEmail: $email,
            userName: (string) ($notifiable->name ?? ''),
            expiresMinutes: EmailVerificationCode::TTL_MINUTES,
        ))->to($email);
    }
}
