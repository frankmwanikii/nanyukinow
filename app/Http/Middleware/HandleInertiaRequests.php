<?php

namespace App\Http\Middleware;

use App\Models\Conversation;
use App\Models\ListingClaim;
use App\Models\ListingReport;
use App\Models\SiteSetting;
use App\Support\AdminNotifications;
use App\Support\CategoryTaxonomy;
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
        $isAdminArea = $request->is('admin', 'admin/*');

        return [
            ...parent::share($request),
            'auth' => function () use ($request, $isAdminArea) {
                $user = $request->user();

                if (! $user) {
                    return ['user' => null];
                }

                $bookmarkIds = [];

                if (! $isAdminArea) {
                    try {
                        $userId = (int) $user->id;
                        $bookmarkIds = Cache::remember(
                            'user.'.$userId.'.bookmark_ids',
                            120,
                            fn () => $user
                                ->bookmarkedListings()
                                ->pluck('listings.id')
                                ->map(fn ($id) => (int) $id)
                                ->values()
                                ->all(),
                        );
                    } catch (Throwable) {
                        $bookmarkIds = [];
                    }
                }

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'avatar_url' => UserAvatar::publicUrl($user->avatar_url),
                        'is_admin' => (bool) $user->is_admin,
                        'plan' => $user->effectivePlan(),
                        'plan_label' => Membership::label($user->effectivePlan()),
                        'listings_remaining' => $isAdminArea
                            ? null
                            : Membership::remainingSlots($user),
                        'bookmarkedListingIds' => $bookmarkIds,
                    ],
                ];
            },
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => function () use ($request, $isAdminArea) {
                if ($isAdminArea) {
                    return [
                        'unread_count' => 0,
                        'recent' => [],
                    ];
                }

                return MemberNotifications::forUser($request->user());
            },
            'messages' => function () use ($request, $isAdminArea) {
                if ($isAdminArea) {
                    return [
                        'unread_count' => 0,
                        'recent' => [],
                    ];
                }

                return MemberMessages::forUser($request->user());
            },
            'mapProvider' => function () {
                $value = SiteSetting::getValue('map_provider', 'google');

                return $value === 'leaflet' ? 'leaflet' : 'google';
            },
            'directoryCategories' => function () use ($isAdminArea) {
                if ($isAdminArea) {
                    return [];
                }

                try {
                    return CategoryTaxonomy::forNavigation();
                } catch (Throwable) {
                    return [];
                }
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
            'adminInbox' => function () use ($request, $isAdminArea) {
                if (! $isAdminArea || ! $request->user()?->is_admin) {
                    return [
                        'unread_count' => 0,
                        'message_unread' => 0,
                        'alert_count' => 0,
                        'messages' => [],
                        'alerts' => [],
                    ];
                }

                return AdminNotifications::inbox();
            },
            'pendingClaims' => function () use ($request) {
                if (! $request->user()?->is_admin) {
                    return 0;
                }

                try {
                    return Cache::remember('admin.badge.pending_claims', 30, fn () => ListingClaim::query()
                        ->where('status', ListingClaim::STATUS_PENDING)
                        ->count());
                } catch (Throwable) {
                    return 0;
                }
            },
            'pendingReports' => function () use ($request) {
                if (! $request->user()?->is_admin) {
                    return 0;
                }

                try {
                    return Cache::remember('admin.badge.pending_reports', 30, fn () => ListingReport::query()
                        ->where('status', ListingReport::STATUS_PENDING)
                        ->count());
                } catch (Throwable) {
                    return 0;
                }
            },
            'inboxMessages' => function () use ($request) {
                if (! $request->user()?->is_admin) {
                    return 0;
                }

                try {
                    return Cache::remember('admin.badge.inbox_messages', 30, fn () => Conversation::query()
                        ->where('admin_status', 'new')
                        ->count());
                } catch (Throwable) {
                    return 0;
                }
            },
        ];
    }
}
