<?php

namespace App\Support;

use Illuminate\Http\Request;

class AdminPagination
{
    /** @var list<int> */
    public const OPTIONS = [10, 15, 25, 50];

    public static function perPage(Request $request, int $default = 15): int
    {
        $perPage = (int) $request->integer('per_page', $default);

        return in_array($perPage, self::OPTIONS, true) ? $perPage : $default;
    }
}
