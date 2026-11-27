<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use App\Support\AdminArea;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSitePreviewAccess
{
    /**
     * Paths that stay reachable while the public site is locked.
     *
     * @return list<string>
     */
    private function exceptPatterns(): array
    {
        return [
            'up',
            'webhooks/*',
            'newsletter',
            'sitemap.xml',
            // Staff must reach sign-in and the dashboard without the public unlock.
            ...AdminArea::patterns(),
        ];
    }

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->previewGateEnabled()) {
            return $next($request);
        }

        $previewPath = trim((string) config('site.preview_path'), '/');

        if ($request->is($previewPath)) {
            return $next($request);
        }

        foreach ($this->exceptPatterns() as $pattern) {
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

    /**
     * Admin Settings can override SITE_PREVIEW_GATE without redeploying .env.
     */
    private function previewGateEnabled(): bool
    {
        $stored = SiteSetting::getValue('preview_gate_enabled');

        if ($stored === null) {
            return (bool) config('site.preview_gate_enabled');
        }

        return in_array(strtolower(trim((string) $stored)), ['1', 'true', 'on', 'yes', 'enabled'], true);
    }
}
