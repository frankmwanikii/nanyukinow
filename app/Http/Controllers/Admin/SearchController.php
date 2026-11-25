<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\ListingReport;
use App\Models\Location;
use App\Models\PlanUpgrade;
use App\Models\SitePage;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim($request->string('q')->toString());

        return Inertia::render('Admin/Search/Index', [
            'q' => $q,
            'groups' => $q === '' ? [] : $this->search($q, 12),
        ]);
    }

    public function suggest(Request $request): JsonResponse
    {
        $q = trim($request->string('q')->toString());

        if (mb_strlen($q) < 2) {
            return response()->json(['groups' => []]);
        }

        return response()->json([
            'groups' => $this->search($q, 4),
        ]);
    }

    /**
     * @return list<array{key: string, label: string, items: list<array{id: int|string, title: string, subtitle: ?string, href: string}>}>
     */
    private function search(string $q, int $limit): array
    {
        $like = '%'.$q.'%';
        $groups = [];

        $destinations = $this->matchingDestinations($q, $limit);
        if ($destinations !== []) {
            $groups[] = ['key' => 'go', 'label' => 'Go to', 'items' => $destinations];
        }

        $listings = Listing::query()
            ->with('category:id,name')
            ->where(function ($query) use ($like) {
                $query->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like)
                    ->orWhere('location', 'like', $like)
                    ->orWhere('phone', 'like', $like);
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (Listing $listing) => [
                'id' => $listing->id,
                'title' => $listing->title,
                'subtitle' => trim(implode(', ', array_filter([
                    $listing->category?->name,
                    $listing->status,
                    $listing->location,
                ]))) ?: null,
                'href' => route('admin.listings.edit', $listing->slug ?: $listing->id),
            ])
            ->all();

        if ($listings !== []) {
            $groups[] = ['key' => 'listings', 'label' => 'Listings', 'items' => $listings];
        }

        $users = User::query()
            ->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('username', 'like', $like)
                    ->orWhere('phone', 'like', $like);
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'title' => $user->name,
                'subtitle' => trim(implode(', ', array_filter([
                    $user->is_admin ? 'Admin' : 'Member',
                    $user->email,
                    $user->username ? '@'.$user->username : null,
                ]))) ?: null,
                'href' => route('admin.users.show', $user->username ?: $user->id),
            ])
            ->all();

        if ($users !== []) {
            $groups[] = ['key' => 'users', 'label' => 'Users', 'items' => $users];
        }

        $pages = SitePage::query()
            ->where(function ($query) use ($like) {
                $query->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->orderBy('title')
            ->limit($limit)
            ->get()
            ->map(fn (SitePage $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'subtitle' => $page->slug,
                'href' => route('admin.pages.edit', $page),
            ])
            ->all();

        if ($pages !== []) {
            $groups[] = ['key' => 'pages', 'label' => 'Site pages', 'items' => $pages];
        }

        $categories = Category::query()
            ->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->orderBy('sort_order')
            ->limit($limit)
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'title' => $category->name,
                'subtitle' => $category->slug,
                'href' => route('admin.categories.edit', $category),
            ])
            ->all();

        if ($categories !== []) {
            $groups[] = ['key' => 'categories', 'label' => 'Categories', 'items' => $categories];
        }

        $locations = Location::query()
            ->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                    ->orWhere('slug', 'like', $like);
            })
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn (Location $location) => [
                'id' => $location->id,
                'title' => $location->name,
                'subtitle' => $location->slug,
                'href' => route('admin.locations.listings', $location),
            ])
            ->all();

        if ($locations !== []) {
            $groups[] = ['key' => 'locations', 'label' => 'Locations', 'items' => $locations];
        }

        $stories = Story::query()
            ->where(function ($query) use ($like) {
                $query->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like)
                    ->orWhere('excerpt', 'like', $like)
                    ->orWhere('author', 'like', $like)
                    ->orWhere('category', 'like', $like);
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (Story $story) => [
                'id' => $story->id,
                'title' => $story->title,
                'subtitle' => trim(implode(', ', array_filter([
                    $story->category,
                    $story->is_published ? 'Published' : 'Draft',
                ]))) ?: null,
                'href' => route('admin.stories.edit', $story),
            ])
            ->all();

        if ($stories !== []) {
            $groups[] = ['key' => 'stories', 'label' => 'Stories', 'items' => $stories];
        }

        $messages = Conversation::query()
            ->with(['listing:id,title', 'latestMessage'])
            ->where(function ($query) use ($like) {
                $query->where('subject', 'like', $like)
                    ->orWhereHas('latestMessage', function ($message) use ($like) {
                        $message->where('body', 'like', $like)
                            ->orWhere('guest_name', 'like', $like)
                            ->orWhere('guest_email', 'like', $like)
                            ->orWhere('guest_phone', 'like', $like);
                    })
                    ->orWhereHas('listing', fn ($listing) => $listing->where('title', 'like', $like));
            })
            ->orderByDesc('last_message_at')
            ->limit($limit)
            ->get()
            ->map(function (Conversation $conversation) {
                $latest = $conversation->latestMessage;

                return [
                    'id' => $conversation->id,
                    'title' => $conversation->subject ?: ($conversation->listing?->title ?: 'Conversation'),
                    'subtitle' => trim(implode(', ', array_filter([
                        $latest?->senderName(),
                        $latest?->guest_email,
                    ]))) ?: null,
                    'href' => route('admin.messages.index', [
                        'folder' => 'inbox',
                        'id' => $conversation->id,
                    ]),
                ];
            })
            ->all();

        if ($messages !== []) {
            $groups[] = ['key' => 'messages', 'label' => 'Messages', 'items' => $messages];
        }

        $claims = ListingClaim::query()
            ->with('listing:id,title,slug')
            ->where(function ($query) use ($like) {
                $query->where('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('reason', 'like', $like)
                    ->orWhereHas('listing', fn ($listing) => $listing->where('title', 'like', $like));
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (ListingClaim $claim) => [
                'id' => $claim->id,
                'title' => trim($claim->first_name.' '.$claim->last_name) ?: $claim->email,
                'subtitle' => trim(implode(', ', array_filter([
                    $claim->listing?->title,
                    $claim->status,
                    $claim->email,
                ]))) ?: null,
                'href' => route('admin.claims.show', $claim),
            ])
            ->all();

        if ($claims !== []) {
            $groups[] = ['key' => 'claims', 'label' => 'Claims', 'items' => $claims];
        }

        $reports = ListingReport::query()
            ->with('listing:id,title,slug')
            ->where(function ($query) use ($like) {
                $query->where('reason', 'like', $like)
                    ->orWhere('details', 'like', $like)
                    ->orWhere('reporter_name', 'like', $like)
                    ->orWhere('reporter_email', 'like', $like)
                    ->orWhereHas('listing', fn ($listing) => $listing->where('title', 'like', $like));
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (ListingReport $report) => [
                'id' => $report->id,
                'title' => $report->listing?->title ?: ($report->reason ?: 'Report'),
                'subtitle' => trim(implode(', ', array_filter([
                    $report->reason,
                    $report->status,
                    $report->reporter_email,
                ]))) ?: null,
                'href' => route('admin.reports.show', $report),
            ])
            ->all();

        if ($reports !== []) {
            $groups[] = ['key' => 'reports', 'label' => 'Reports', 'items' => $reports];
        }

        $payments = PlanUpgrade::query()
            ->with('user:id,name,email,username')
            ->where(function ($query) use ($like) {
                $query->where('payment_reference', 'like', $like)
                    ->orWhere('payment_method', 'like', $like)
                    ->orWhere('member_notes', 'like', $like)
                    ->orWhere('to_plan', 'like', $like)
                    ->orWhereHas('user', function ($user) use ($like) {
                        $user->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhere('username', 'like', $like);
                    });
            })
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (PlanUpgrade $payment) => [
                'id' => $payment->id,
                'title' => $payment->payment_reference
                    ?: (($payment->user?->name ?: 'Payment').', '.$payment->to_plan),
                'subtitle' => trim(implode(', ', array_filter([
                    $payment->user?->email,
                    $payment->status,
                    $payment->payment_method,
                ]))) ?: null,
                'href' => route('admin.finance.index', [
                    'tab' => 'payments',
                    'q' => $payment->payment_reference ?: ($payment->user?->email ?: $payment->user?->name),
                ]),
            ])
            ->all();

        if ($payments !== []) {
            $groups[] = ['key' => 'finance', 'label' => 'Finance', 'items' => $payments];
        }

        return $groups;
    }

    /**
     * @return list<array{id: string, title: string, subtitle: ?string, href: string}>
     */
    private function matchingDestinations(string $q, int $limit): array
    {
        $needle = $this->normalize($q);

        if ($needle === '') {
            return [];
        }

        $scored = [];

        foreach ($this->destinations() as $destination) {
            $score = $this->destinationScore($needle, $destination);

            if ($score <= 0) {
                continue;
            }

            $scored[] = [
                'score' => $score,
                'item' => [
                    'id' => $destination['id'],
                    'title' => $destination['title'],
                    'subtitle' => $destination['subtitle'],
                    'href' => $destination['href'],
                ],
            ];
        }

        usort($scored, fn (array $a, array $b) => $b['score'] <=> $a['score']);

        return array_map(
            fn (array $row) => $row['item'],
            array_slice($scored, 0, $limit),
        );
    }

    /**
     * @param  array{id: string, title: string, subtitle: string, href: string, keywords: list<string>}  $destination
     */
    private function destinationScore(string $needle, array $destination): int
    {
        $title = $this->normalize($destination['title']);
        $subtitle = $this->normalize($destination['subtitle']);
        $keywords = array_map(fn (string $keyword) => $this->normalize($keyword), $destination['keywords']);

        if ($title === $needle) {
            return 100;
        }

        if (in_array($needle, $keywords, true)) {
            return 95;
        }

        if (str_starts_with($title, $needle)) {
            return 85;
        }

        foreach ($keywords as $keyword) {
            if (str_starts_with($keyword, $needle)) {
                return 80;
            }
        }

        if (str_contains($title, $needle)) {
            return 60;
        }

        if ($subtitle !== '' && str_contains($subtitle, $needle)) {
            return 45;
        }

        foreach ($keywords as $keyword) {
            if (str_contains($keyword, $needle)) {
                return 40;
            }
        }

        return 0;
    }

    private function normalize(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9\s]+/u', ' ', $value) ?: '';
        $value = preg_replace('/\s+/u', ' ', $value) ?: '';

        return trim($value);
    }

    /**
     * @return list<array{id: string, title: string, subtitle: string, href: string, keywords: list<string>}>
     */
    private function destinations(): array
    {
        return [
            [
                'id' => 'dashboard',
                'title' => 'Overview',
                'subtitle' => 'Admin dashboard and activity',
                'href' => route('admin.dashboard'),
                'keywords' => ['overview', 'dashboard', 'home', 'stats', 'activity'],
            ],
            [
                'id' => 'listings',
                'title' => 'Listings',
                'subtitle' => 'Browse and manage listings',
                'href' => route('admin.listings.index'),
                'keywords' => ['listings', 'listing', 'directory', 'businesses', 'places'],
            ],
            [
                'id' => 'listings-pending',
                'title' => 'Pending listings',
                'subtitle' => 'Listings waiting for review',
                'href' => route('admin.listings.index', ['status' => 'pending']),
                'keywords' => ['pending', 'review', 'approval', 'queue', 'moderation'],
            ],
            [
                'id' => 'listings-create',
                'title' => 'New listing',
                'subtitle' => 'Create a listing',
                'href' => route('admin.listings.create'),
                'keywords' => ['new listing', 'create listing', 'add listing'],
            ],
            [
                'id' => 'pages',
                'title' => 'Pages',
                'subtitle' => 'Edit public site pages',
                'href' => route('admin.pages.index'),
                'keywords' => ['pages', 'page', 'content', 'cms', 'home page', 'terms', 'privacy'],
            ],
            [
                'id' => 'categories',
                'title' => 'Categories',
                'subtitle' => 'Listing categories',
                'href' => route('admin.categories.index'),
                'keywords' => ['categories', 'category', 'taxonomy'],
            ],
            [
                'id' => 'locations',
                'title' => 'Locations',
                'subtitle' => 'Towns and areas',
                'href' => route('admin.locations.index'),
                'keywords' => ['locations', 'location', 'areas', 'towns', 'places'],
            ],
            [
                'id' => 'stories',
                'title' => 'Stories',
                'subtitle' => 'Editorial stories',
                'href' => route('admin.stories.index'),
                'keywords' => ['stories', 'story', 'articles', 'blog', 'news'],
            ],
            [
                'id' => 'story-categories',
                'title' => 'Story categories',
                'subtitle' => 'Story topics',
                'href' => route('admin.story-categories.index'),
                'keywords' => ['story categories', 'story category', 'topics', 'editorial categories'],
            ],
            [
                'id' => 'gallery',
                'title' => 'Gallery',
                'subtitle' => 'Media library',
                'href' => route('admin.gallery.index'),
                'keywords' => ['gallery', 'media', 'images', 'photos', 'uploads'],
            ],
            [
                'id' => 'users',
                'title' => 'Users',
                'subtitle' => 'Members and admins',
                'href' => route('admin.users.index'),
                'keywords' => ['users', 'user', 'members', 'member', 'accounts', 'people'],
            ],
            [
                'id' => 'messages',
                'title' => 'Messages',
                'subtitle' => 'Inbox and broadcasts',
                'href' => route('admin.messages.index'),
                'keywords' => ['messages', 'message', 'inbox', 'mail', 'email', 'compose', 'newsletter'],
            ],
            [
                'id' => 'pricing',
                'title' => 'Pricing',
                'subtitle' => 'Plans and tier prices',
                'href' => route('admin.pricing.index'),
                'keywords' => ['pricing', 'price', 'plans', 'tiers', 'packages'],
            ],
            [
                'id' => 'finance',
                'title' => 'Finance',
                'subtitle' => 'Payments and membership upgrades',
                'href' => route('admin.finance.index'),
                'keywords' => ['finance', 'payments', 'payment', 'upgrades', 'upgrade', 'revenue', 'mpesa', 'billing'],
            ],
            [
                'id' => 'finance-payments',
                'title' => 'Payments',
                'subtitle' => 'Finance payment queue',
                'href' => route('admin.finance.index', ['tab' => 'payments']),
                'keywords' => ['payments', 'payment', 'approve payment', 'pending payment'],
            ],
            [
                'id' => 'claims',
                'title' => 'Claims',
                'subtitle' => 'Listing ownership claims',
                'href' => route('admin.claims.index'),
                'keywords' => ['claims', 'claim', 'ownership', 'verify'],
            ],
            [
                'id' => 'reports',
                'title' => 'Reports',
                'subtitle' => 'Listing reports from the public',
                'href' => route('admin.reports.index'),
                'keywords' => ['reports', 'report', 'flags', 'flagged', 'abuse'],
            ],
            [
                'id' => 'settings',
                'title' => 'Settings',
                'subtitle' => 'Site, map, and payment settings',
                'href' => route('admin.settings.index'),
                'keywords' => ['settings', 'setting', 'config', 'configuration', 'preferences', 'options', 'setup'],
            ],
            [
                'id' => 'profile',
                'title' => 'Profile',
                'subtitle' => 'Your admin account',
                'href' => route('admin.profile.edit'),
                'keywords' => ['profile', 'account', 'password', 'avatar', 'my account'],
            ],
            [
                'id' => 'search',
                'title' => 'Search',
                'subtitle' => 'Full admin search',
                'href' => route('admin.search'),
                'keywords' => ['search', 'find', 'lookup'],
            ],
        ];
    }
}
