<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Listing;
use App\Models\PlanUpgrade;
use App\Models\Story;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $payload = Cache::flexible('admin.dashboard.overview', [30, 90], function () {
            $now = now();

            $listingStats = Listing::query()
                ->selectRaw('COUNT(*) as listings')
                ->selectRaw('COALESCE(SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END), 0) as published')
                ->selectRaw('COALESCE(SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END), 0) as featured')
                ->selectRaw('COALESCE(SUM(CASE WHEN status = ? THEN 1 ELSE 0 END), 0) as pending_listings', ['pending'])
                ->selectRaw('COALESCE(SUM(views_count), 0) as views')
                ->selectRaw(
                    'COALESCE(SUM(CASE WHEN expires_at IS NOT NULL AND expires_at BETWEEN ? AND ? THEN 1 ELSE 0 END), 0) as expiring_soon',
                    [$now, $now->copy()->addDays(14)],
                )
                ->selectRaw(
                    'COALESCE(SUM(CASE WHEN expires_at IS NOT NULL AND expires_at < ? THEN 1 ELSE 0 END), 0) as expired',
                    [$now],
                )
                ->first();

            $userStats = User::query()
                ->selectRaw('COUNT(*) as users')
                ->selectRaw('COALESCE(SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END), 0) as admins')
                ->first();

            $storyStats = Story::query()
                ->selectRaw('COUNT(*) as stories')
                ->selectRaw('COALESCE(SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END), 0) as draft_stories')
                ->first();

            $stats = [
                'listings' => (int) ($listingStats->listings ?? 0),
                'published' => (int) ($listingStats->published ?? 0),
                'featured' => (int) ($listingStats->featured ?? 0),
                'expiring_soon' => (int) ($listingStats->expiring_soon ?? 0),
                'expired' => (int) ($listingStats->expired ?? 0),
                'categories' => Category::query()->count(),
                'users' => (int) ($userStats->users ?? 0),
                'admins' => (int) ($userStats->admins ?? 0),
                'stories' => (int) ($storyStats->stories ?? 0),
                'draft_stories' => (int) ($storyStats->draft_stories ?? 0),
                'views' => (int) ($listingStats->views ?? 0),
                'pending_listings' => (int) ($listingStats->pending_listings ?? 0),
                'pending_upgrades' => PlanUpgrade::query()
                    ->where('status', PlanUpgrade::STATUS_PENDING)
                    ->count(),
            ];

            $recentListings = Listing::query()
                ->with(['category:id,name', 'user:id,name'])
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (Listing $listing) => $this->listingRow($listing));

            $expiringListings = Listing::query()
                ->with(['category:id,name'])
                ->whereNotNull('expires_at')
                ->where('expires_at', '>=', $now->copy()->subDays(7))
                ->orderBy('expires_at')
                ->limit(8)
                ->get()
                ->map(fn (Listing $listing) => $this->listingRow($listing));

            $categoryBreakdown = Category::query()
                ->withCount('listings')
                ->orderByDesc('listings_count')
                ->limit(8)
                ->get(['id', 'name', 'slug'])
                ->map(fn (Category $cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'listings_count' => (int) $cat->listings_count,
                ])
                ->values();

            return [
                'stats' => $stats,
                'recentListings' => $recentListings->values(),
                'expiringListings' => $expiringListings->values(),
                'categoryBreakdown' => $categoryBreakdown,
                'charts' => [
                    'activity' => $this->activitySeries(30),
                    'categories' => $categoryBreakdown->map(fn (array $cat) => [
                        'name' => $cat['name'],
                        'count' => $cat['listings_count'],
                    ])->values(),
                    'statuses' => $this->groupedCounts(Listing::class, 'status'),
                    'tiers' => $this->groupedCounts(Listing::class, 'tier'),
                ],
            ];
        });

        return Inertia::render('Admin/Dashboard', $payload);
    }

    /**
     * @return list<array{date: string, label: string, listings: int, users: int, stories: int}>
     */
    private function activitySeries(int $days): array
    {
        $start = now()->subDays($days - 1)->startOfDay();

        $listings = $this->dailyCreatedCounts('listings', $start);
        $users = $this->dailyCreatedCounts('users', $start);
        $stories = $this->dailyCreatedCounts('stories', $start);

        $series = [];

        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i);
            $key = $day->toDateString();

            $series[] = [
                'date' => $key,
                'label' => $day->format('M j'),
                'listings' => $listings[$key] ?? 0,
                'users' => $users[$key] ?? 0,
                'stories' => $stories[$key] ?? 0,
            ];
        }

        return $series;
    }

    /**
     * @return array<string, int>
     */
    private function dailyCreatedCounts(string $table, Carbon $start): array
    {
        $driver = DB::connection()->getDriverName();
        $dateExpression = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d', created_at)"
            : 'DATE(created_at)';

        return DB::table($table)
            ->selectRaw("{$dateExpression} as day, COUNT(*) as total")
            ->where('created_at', '>=', $start)
            ->groupByRaw($dateExpression)
            ->pluck('total', 'day')
            ->map(fn ($total) => (int) $total)
            ->all();
    }

    /**
     * @param  class-string  $model
     * @return list<array{name: string, count: int}>
     */
    private function groupedCounts(string $model, string $column): array
    {
        return $model::query()
            ->select($column, DB::raw('COUNT(*) as total'))
            ->groupBy($column)
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name' => (string) ($row->{$column} ?: 'unknown'),
                'count' => (int) $row->total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function listingRow(Listing $listing): array
    {
        return [
            'id' => $listing->id,
            'title' => $listing->title,
            'slug' => $listing->slug,
            'status' => $listing->status,
            'tier' => $listing->tier,
            'is_published' => $listing->is_published,
            'is_featured' => $listing->is_featured,
            'category' => $listing->category?->name,
            'owner' => $listing->user?->name,
            'expires_at' => $listing->expires_at?->toIso8601String(),
            'expiry_label' => $listing->expiryLabel(),
            'is_expired' => $listing->isExpired(),
            'image_url' => $listing->image_url,
            'updated_at' => $listing->updated_at?->toIso8601String(),
        ];
    }
}
