<?php

namespace App\Http\Middleware;

use App\Models\Conversation;
use App\Models\ListingClaim;
use App\Models\ListingReport;
use App\Models\SiteSetting;
use App\Support\MemberMessages;
use App\Support\MemberNotifications;
use App\Support\Membership;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Throwable;

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
                        'bookmarkedListingIds' => (function () use ($request) {
                            try {
                                return $request->user()
                                    ->bookmarkedListings()
                                    ->pluck('listings.id')
                                    ->map(fn ($id) => (int) $id)
                                    ->values()
                                    ->all();
                            } catch (Throwable) {
                                return [];
                            }
                        })(),
                    ]
                    : null,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => fn () => MemberNotifications::forUser($request->user()),
            'messages' => fn () => MemberMessages::forUser($request->user()),
            'mapProvider' => function () {
                $value = SiteSetting::getValue('map_provider', 'google');

                return $value === 'leaflet' ? 'leaflet' : 'google';
            },
            'siteContact' => function () {
                try {
                    $phone = trim((string) SiteSetting::getValue('contact_phone', ''));
                    $email = trim((string) SiteSetting::getValue(
                        'contact_email',
                        (string) config('mail.from.address', 'hello@nanyukinow.co.ke'),
                    ));

                    return [
                        'phone' => $phone !== '' && $phone !== '+254 700 000 000'
                            ? $phone
                            : null,
                        'email' => $email !== '' ? $email : 'hello@nanyukinow.co.ke',
                    ];
                } catch (Throwable) {
                    return [
                        'phone' => null,
                        'email' => 'hello@nanyukinow.co.ke',
                    ];
                }
            },
            'pendingClaims' => function () use ($request) {
                if (! $request->user()?->is_admin) {
                    return 0;
                }

                try {
                    return ListingClaim::query()
                        ->where('status', ListingClaim::STATUS_PENDING)
                        ->count();
                } catch (Throwable) {
                    return 0;
                }
            },
            'pendingReports' => function () use ($request) {
                if (! $request->user()?->is_admin) {
                    return 0;
                }

                try {
                    return ListingReport::query()
                        ->where('status', ListingReport::STATUS_PENDING)
                        ->count();
                } catch (Throwable) {
                    return 0;
                }
            },
            'inboxMessages' => function () use ($request) {
                if (! $request->user()?->is_admin) {
                    return 0;
                }

                try {
                    return Conversation::query()
                        ->where('admin_status', 'new')
                        ->count();
                } catch (Throwable) {
                    return 0;
                }
            },
        ];
    }
}
