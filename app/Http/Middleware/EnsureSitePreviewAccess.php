<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSitePreviewAccess
{
    /**
     * Paths that stay reachable while the public site is locked.
     *
     * @var list<string>
     */
    private array $except = [
        'up',
        'webhooks/*',
        'newsletter',
        // Staff must reach sign-in and the dashboard without the public unlock.
        'admin',
        'admin/*',
    ];

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('site.preview_gate_enabled')) {
            return $next($request);
        }

        $previewPath = trim((string) config('site.preview_path'), '/');

        if ($request->is($previewPath)) {
            return $next($request);
        }

        foreach ($this->except as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        $sessionKey = (string) config('site.preview_session_key');

        if ($request->session()->get($sessionKey) === true) {
            return $next($request);
        }

        return response()
            ->view('coming-soon', [
                'previewPath' => '/'.$previewPath,
            ], 404)
            ->header('X-Robots-Tag', 'noindex, nofollow');
    }
}
