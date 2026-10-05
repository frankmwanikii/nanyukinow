<?php

namespace App\Notifications;

use App\Mail\PasswordResetMail;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(public string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): PasswordResetMail
    {
        $email = $notifiable->getEmailForPasswordReset();

        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $email,
        ], false));

        $expiresMinutes = (int) config(
            'auth.passwords.'.config('auth.defaults.passwords').'.expire',
            60,
        );

        return (new PasswordResetMail(
            resetUrl: $resetUrl,
            userEmail: $email,
            userName: (string) ($notifiable->name ?? ''),
            expiresMinutes: $expiresMinutes,
        ))->to($email);
    }
}
