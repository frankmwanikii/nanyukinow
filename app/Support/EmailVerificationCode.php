<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class EmailVerificationCode
{
    public const TTL_MINUTES = 15;

    public static function cacheKey(int $userId): string
    {
        return 'email_verification_code:'.$userId;
    }

    public static function issue(User $user): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put(
            self::cacheKey((int) $user->id),
            Hash::make($code),
            now()->addMinutes(self::TTL_MINUTES),
        );

        return $code;
    }

    public static function matches(User $user, string $code): bool
    {
        $hash = Cache::get(self::cacheKey((int) $user->id));

        if (! is_string($hash) || $hash === '') {
            return false;
        }

        $normalized = preg_replace('/\D+/', '', $code) ?? '';

        if (strlen($normalized) !== 6) {
            return false;
        }

        return Hash::check($normalized, $hash);
    }

    public static function forget(User $user): void
    {
        Cache::forget(self::cacheKey((int) $user->id));
    }
}
