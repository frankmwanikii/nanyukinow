<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class UserAvatar
{
    public static function normalize(?string $url): ?string
    {
        $url = is_string($url) ? trim($url) : '';

        if ($url === '') {
            return null;
        }

        $marker = '/storage/';
        $pos = strpos($url, $marker);

        return $pos === false ? $url : substr($url, $pos);
    }

    /**
     * Public avatar URL for the UI. Missing local files become null so the
     * client can show initials instead of a broken image.
     */
    public static function publicUrl(?string $url): ?string
    {
        $url = self::normalize($url);

        if (! $url) {
            return null;
        }

        if (str_starts_with($url, '/storage/')) {
            $relative = substr($url, strlen('/storage/'));

            if ($relative === '' || ! Storage::disk('public')->exists($relative)) {
                return null;
            }
        }

        return $url;
    }

    /**
     * Whether the stored value still resolves to a displayable image.
     */
    public static function isUsable(?string $url): bool
    {
        return self::publicUrl($url) !== null;
    }

    /**
     * Drop broken avatar paths (e.g. "/storage/" or missing files) so Google
     * import and profile display stay in sync for the same account.
     */
    public static function clearUnusable(User $user): bool
    {
        if (! filled($user->avatar_url) || self::isUsable($user->avatar_url)) {
            return false;
        }

        self::delete($user->avatar_url);
        $user->forceFill(['avatar_url' => null])->save();

        return true;
    }

    public static function delete(?string $url): void
    {
        if (! $url) {
            return;
        }

        $marker = '/storage/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            return;
        }

        $relative = substr($url, $pos + strlen($marker));
        if ($relative !== '' && Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }

    public static function store(UploadedFile $file): string
    {
        return WebpConverter::storeAsWebp($file, 'avatars');
    }

    /**
     * Download a remote profile photo (e.g. Google) into local public storage.
     */
    public static function importFromUrl(?string $url): ?string
    {
        if (! filled($url) || ! Str::startsWith($url, ['http://', 'https://'])) {
            return null;
        }

        // Prefer a clearer Google photo when the default tiny size is returned.
        $url = preg_replace('/=s\d+-c\b/', '=s400-c', $url) ?: $url;
        if (str_contains($url, 'googleusercontent.com') && ! str_contains($url, '=')) {
            $url .= (str_contains($url, '?') ? '&' : '?').'sz=400';
        }

        try {
            $response = Http::timeout(8)
                ->withHeaders(['Accept' => 'image/*'])
                ->get($url);
        } catch (Throwable) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $body = $response->body();
        if ($body === '' || strlen($body) > 5 * 1024 * 1024) {
            return null;
        }

        $mime = strtolower((string) ($response->header('Content-Type') ?: ''));
        $mime = explode(';', $mime)[0];
        $ext = match ($mime) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => null,
        };

        if (! $ext) {
            return null;
        }

        $path = 'avatars/'.Str::uuid().'.'.$ext;
        if (! Storage::disk('public')->put($path, $body)) {
            return null;
        }

        $converted = WebpConverter::convertStored($path);
        $relative = is_string($converted) && $converted !== '' ? $converted : $path;

        return '/storage/'.$relative;
    }
}
