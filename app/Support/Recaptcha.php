<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class Recaptcha
{
    public const FALLBACK_TOKEN = 'fallback-verified';

    public static function secretConfigured(): bool
    {
        return filled(config('services.recaptcha.secret'));
    }

    public static function verify(?string $token, ?string $ip = null): bool
    {
        if (! filled($token)) {
            return false;
        }

        // Local UI fallback / PHPUnit — never call Google.
        if ($token === self::FALLBACK_TOKEN && (app()->environment('testing') || ! static::secretConfigured())) {
            return true;
        }

        if (! static::secretConfigured()) {
            return false;
        }

        $response = Http::asForm()
            ->timeout(8)
            ->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => config('services.recaptcha.secret'),
                'response' => $token,
                'remoteip' => $ip,
            ]);

        if (! $response->successful()) {
            return false;
        }

        return (bool) data_get($response->json(), 'success');
    }

    /**
     * @throws ValidationException
     */
    public static function validateRequest(?string $token, ?string $ip = null): void
    {
        if (! static::verify($token, $ip)) {
            throw ValidationException::withMessages([
                'g-recaptcha-response' => 'Please complete the security check.',
            ]);
        }
    }
}
