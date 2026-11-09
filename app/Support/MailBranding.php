<?php

namespace App\Support;

use App\Models\SiteSetting;

class MailBranding
{
    /**
     * Shared chrome variables for branded transactional emails.
     *
     * @return array{
     *     appName: string,
     *     appUrl: string,
     *     logoUrl: string,
     *     contactEmail: string,
     *     contactPhone: string
     * }
     */
    public static function context(): array
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

        return [
            'appName' => $appName,
            'appUrl' => $appUrl,
            'logoUrl' => $appUrl.'/images/logo.png',
            'contactEmail' => $contactEmail,
            'contactPhone' => $contactPhone,
        ];
    }
}
