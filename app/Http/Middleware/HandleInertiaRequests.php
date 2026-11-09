<?php

namespace App\Http\Middleware;

use App\Models\Conversation;
use App\Models\ListingClaim;
use App\Models\ListingReport;
use App\Models\SiteSetting;
use App\Support\MemberMessages;
use App\Support\MemberNotifications;
use App\Support\Membership;
use App\Support\UserAvatar;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;
use Inertia\Support\Header;
use Symfony\Component\HttpFoundation\Response;
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
     * Inertia JSON must not be stored. A cached copy of this response can be
     * served as the document, so the browser shows raw JSON until a refresh.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = parent::handle($request, $next);

        // LiteSpeed's private cache does not vary on X-Inertia, so a cached
        // Inertia payload is replayed when the browser refreshes the listing.
        $response->headers->set('X-LiteSpeed-Cache-Control', 'no-cache');

        if ($request->header(Header::INERTIA)) {
            $response->headers->set('Cache-Control', 'no-store, private');
        }

        return $response;
    }

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
                        'avatar_url' => UserAvatar::publicUrl($request->user()->avatar_url),
                        'is_admin' => (bool) $request->user()->is_admin,
                        'plan' => $request->user()->effectivePlan(),
                        'plan_label' => Membership::label($request->user()->effectivePlan()),
                        'listings_remaining' => Membership::remainingSlots($request->user()),
                        'bookmarkedListingIds' => (function () use ($request) {
                            try {
                                $userId = (int) $request->user()->id;

                                return Cache::remember(
                                    'user.'.$userId.'.bookmark_ids',
                                    120,
                                    fn () => $request->user()
                                        ->bookmarkedListings()
                                        ->pluck('listings.id')
                                        ->map(fn ($id) => (int) $id)
                                        ->values()
                                        ->all(),
                                );
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
