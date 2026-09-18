<?php

namespace App\Http\Middleware;

use App\Support\MemberNotifications;
use App\Support\Membership;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'username' => $request->user()->username,
                        'email' => $request->user()->email,
                        'avatar_url' => (function () use ($request) {
                            $url = $request->user()->avatar_url;
                            if (! $url) {
                                return null;
                            }
                            $marker = '/storage/';
                            $pos = strpos($url, $marker);

                            return $pos === false ? $url : substr($url, $pos);
                        })(),
                        'is_admin' => (bool) $request->user()->is_admin,
                        'plan' => $request->user()->effectivePlan(),
                        'plan_label' => Membership::label($request->user()->effectivePlan()),
                        'listings_remaining' => Membership::remainingSlots($request->user()),
                    ]
                    : null,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => MemberNotifications::forUser($request->user()),
        ];
    }
}
