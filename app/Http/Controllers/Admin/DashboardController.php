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
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $now = now();

        $stats = [
            'listings' => Listing::query()->count(),
            'published' => Listing::query()->where('is_published', true)->count(),
            'featured' => Listing::query()->where('is_featured', true)->count(),
            'expiring_soon' => Listing::query()
                ->whereNotNull('expires_at')
                ->whereBetween('expires_at', [$now, $now->copy()->addDays(14)])
                ->count(),
            'expired' => Listing::query()
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', $now)
                ->count(),
            'categories' => Category::query()->count(),
            'users' => User::query()->count(),
            'admins' => User::query()->where('is_admin', true)->count(),
            'stories' => Story::query()->count(),
            'draft_stories' => Story::query()->where('is_published', false)->count(),
            'views' => (int) Listing::query()->sum('views_count'),
            'pending_listings' => Listing::query()->where('status', 'pending')->count(),
            'pending_upgrades' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_PENDING)->count(),
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
            ->get(['id', 'name', 'slug', 'listings_count']);

        $charts = [
            'activity' => $this->activitySeries(30),
            'categories' => $categoryBreakdown->map(fn (Category $cat) => [
                'name' => $cat->name,
                'count' => (int) $cat->listings_count,
            ])->values(),
            'statuses' => $this->groupedCounts(Listing::class, 'status'),
            'tiers' => $this->groupedCounts(Listing::class, 'tier'),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentListings' => $recentListings,
            'expiringListings' => $expiringListings,
            'categoryBreakdown' => $categoryBreakdown,
            'charts' => $charts,
        ]);
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
