<?php

namespace App\Support;

use Illuminate\Http\Request;

class AdminArea
{
    /**
     * URL segment for the staff console (no leading/trailing slash).
     */
    public static function path(): string
    {
        $path = strtolower(trim((string) config('site.admin_path', 'admin'), '/'));

        if ($path === '' || ! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $path)) {
            return 'admin';
        }

        return $path;
    }

    /**
     * @return list<string>
     */
    public static function patterns(): array
    {
        $path = self::path();

        return [$path, $path.'/*'];
    }

    public static function requestIsAdmin(Request $request): bool
    {
        return $request->is(...self::patterns());
    }

    public static function uriPrefix(): string
    {
        return '/'.self::path();
    }

    public static function usesCustomPath(): bool
    {
        return self::path() !== 'admin';
    }
}
