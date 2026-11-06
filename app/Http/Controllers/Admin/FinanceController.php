<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\PlanUpgrade;
use App\Models\User;
use App\Notifications\PlanUpgradeReviewedNotification;
use App\Support\AdminPagination;
use App\Support\Membership;
use App\Support\PaymentMethods;
use App\Support\PlanUpgradeApproval;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->string('tab')->toString() ?: 'overview';
        // Legacy Approvals tab → Payments filtered to pending.
        if ($tab === 'approvals') {
            $tab = 'payments';
            if (! $request->filled('status')) {
                $request->merge(['status' => PlanUpgrade::STATUS_PENDING]);
            }
        }
        if (! in_array($tab, ['overview', 'payments'], true)) {
            $tab = 'overview';
        }

        $pendingCount = PlanUpgrade::query()
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->count();

        $status = $request->string('status')->toString();
        if ($tab === 'payments' && $status === '') {
            $status = $pendingCount > 0
                ? PlanUpgrade::STATUS_PENDING
                : 'all';
        }
        if ($status === '') {
            $status = 'all';
        }

        $method = $request->string('method')->toString();
        $q = $request->string('q')->toString();
        $perPage = AdminPagination::perPage($request, 20);

        $paymentsQuery = PlanUpgrade::query()
            ->with([
                'user:id,name,email,username,plan',
                'user.listings:id,user_id,title,slug,status,tier',
                'reviewer:id,name',
            ])
            ->latest();

        if ($tab === 'payments' && $status !== 'all') {
            $paymentsQuery->where('status', $status);
        }

        if ($method !== '') {
            $paymentsQuery->where('payment_method', $method);
        }

        if ($q !== '') {
            $like = '%'.$q.'%';
            $paymentsQuery->where(function ($inner) use ($like) {
                $inner->where('payment_reference', 'like', $like)
                    ->orWhere('to_plan', 'like', $like)
                    ->orWhere('from_plan', 'like', $like)
                    ->orWhereHas('user', function ($user) use ($like) {
                        $user->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhere('username', 'like', $like);
                    });
            });
        }

        $payments = $tab === 'overview'
            ? null
            : $paymentsQuery
                ->paginate($perPage)
                ->withQueryString()
                ->through(fn (PlanUpgrade $upgrade) => $this->paymentRow($upgrade));

        return Inertia::render('Admin/Finance/Index', [
            'tab' => $tab,
            'payments' => $payments,
            'filters' => [
                'status' => $status,
                'method' => $method,
                'q' => $q,
                'per_page' => $perPage,
            ],
            'counts' => $this->counts(),
            'stats' => $this->stats(),
            'breakdowns' => $this->breakdowns(),
            'methods' => PaymentMethods::options(),
        ]);
    }

    public function approve(Request $request, PlanUpgrade $upgrade): RedirectResponse
    {
        abort_unless($upgrade->status === PlanUpgrade::STATUS_PENDING, 422);

        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'duration_days' => ['nullable', 'integer', 'min:1', 'max:366'],
        ]);

        $user = User::query()->findOrFail($upgrade->user_id);

        PlanUpgradeApproval::approve(
            $upgrade,
            $request->user()->id,
            $data['admin_notes'] ?? null,
            $data['duration_days'] ?? null,
        );

        return back()->with(
            'success',
            'Payment approved — '.$user->name.' is now on '.Membership::label($upgrade->to_plan).'.',
        );
    }

    public function reject(Request $request, PlanUpgrade $upgrade): RedirectResponse
    {
        abort_unless($upgrade->status === PlanUpgrade::STATUS_PENDING, 422);

        $data = $request->validate([
            'admin_notes' => ['required', 'string', 'max:1000'],
        ]);

        $upgrade->update([
            'status' => PlanUpgrade::STATUS_REJECTED,
            'admin_notes' => $data['admin_notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $upgrade->user?->notify(new PlanUpgradeReviewedNotification($upgrade->fresh()));

        return back()->with('success', 'Payment rejected.');
    }

    public function updateUserPlan(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'plan' => ['required', Rule::in([Membership::FREE, Membership::STANDARD, Membership::PREMIUM])],
            'duration_days' => ['nullable', 'integer', 'min:1', 'max:366'],
            'billing_period' => ['nullable', Rule::in(['month', 'year', 'one_time'])],
        ]);

        $user = User::query()->findOrFail($data['user_id']);
        $days = $data['duration_days']
            ?? Membership::durationDaysForPeriod($data['billing_period'] ?? 'month');

        Membership::activate($user, $data['plan'], $days);

        return back()->with('success', 'Member plan updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentRow(PlanUpgrade $upgrade): array
    {
        $base = $upgrade->toAdminArray();
        $listings = $upgrade->user?->listings ?? collect();

        return array_merge($base, [
            'product' => 'Listing membership',
            'product_detail' => Membership::label($upgrade->to_plan).' plan · listing visibility & limits',
            'listings_count' => $listings->count(),
            'paid_listings_count' => $listings
                ->whereIn('tier', [Membership::STANDARD, Membership::PREMIUM])
                ->count(),
            'listings' => $listings
                ->take(5)
                ->map(fn (Listing $listing) => [
                    'id' => $listing->id,
                    'title' => $listing->title ?: 'Untitled',
                    'slug' => $listing->slug,
                    'status' => $listing->status,
                    'tier' => $listing->tier,
                    'edit_href' => route('admin.listings.edit', $listing->slug),
                ])
                ->values()
                ->all(),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function counts(): array
    {
        return [
            'pending' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_PENDING)->count(),
            'approved' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_APPROVED)->count(),
            'rejected' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_REJECTED)->count(),
            'cancelled' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_CANCELLED)->count(),
            'all' => PlanUpgrade::query()->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function stats(): array
    {
        $pending = PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_PENDING);
        $approved = PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_APPROVED);

        $paidMembers = User::query()
            ->whereIn('plan', [Membership::STANDARD, Membership::PREMIUM])
            ->count();

        $featuredListings = Listing::query()->where('tier', Membership::STANDARD)->count();
        $premiumListings = Listing::query()->where('tier', Membership::PREMIUM)->count();
        $publishedPaid = Listing::query()
            ->whereIn('tier', [Membership::STANDARD, Membership::PREMIUM])
            ->where('status', 'published')
            ->count();

        return [
            'currency' => 'KES',
            'pending_count' => (clone $pending)->count(),
            'pending_amount' => (int) (clone $pending)->sum('amount'),
            'approved_count' => (clone $approved)->count(),
            'approved_amount' => (int) (clone $approved)->sum('amount'),
            'month_revenue' => (int) PlanUpgrade::query()
                ->where('status', PlanUpgrade::STATUS_APPROVED)
                ->where('reviewed_at', '>=', now()->startOfMonth())
                ->sum('amount'),
            'week_revenue' => (int) PlanUpgrade::query()
                ->where('status', PlanUpgrade::STATUS_APPROVED)
                ->where('reviewed_at', '>=', now()->startOfWeek())
                ->sum('amount'),
            'paid_members' => $paidMembers,
            'featured_listings' => $featuredListings,
            'premium_listings' => $premiumListings,
            'published_paid_listings' => $publishedPaid,
            'avg_ticket' => (int) round((clone $approved)->avg('amount') ?? 0),
        ];
    }

    /**
     * @return array{by_method: list<array<string, mixed>>, by_plan: list<array<string, mixed>>, recent: list<array<string, mixed>>}
     */
    private function breakdowns(): array
    {
        $byMethod = PlanUpgrade::query()
            ->where('status', PlanUpgrade::STATUS_APPROVED)
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get()
            ->map(function ($row) {
                $method = $row->payment_method ?: 'unknown';
                $label = collect(PaymentMethods::options())
                    ->firstWhere('value', $method)['label'] ?? ucfirst($method);

                return [
                    'method' => $method,
                    'label' => $label,
                    'count' => (int) $row->count,
                    'total' => (int) $row->total,
                ];
            })
            ->values()
            ->all();

        $byPlan = PlanUpgrade::query()
            ->where('status', PlanUpgrade::STATUS_APPROVED)
            ->select('to_plan', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('to_plan')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'plan' => $row->to_plan,
                'label' => Membership::label($row->to_plan),
                'count' => (int) $row->count,
                'total' => (int) $row->total,
            ])
            ->values()
            ->all();

        $recent = PlanUpgrade::query()
            ->with(['user:id,name,email'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (PlanUpgrade $upgrade) => [
                'id' => $upgrade->id,
                'member' => $upgrade->user?->name,
                'to_label' => Membership::label($upgrade->to_plan),
                'amount' => $upgrade->amount,
                'currency' => $upgrade->currency,
                'method' => $upgrade->payment_method,
                'reference' => $upgrade->payment_reference,
                'status' => $upgrade->status,
                'created_at' => $upgrade->created_at?->toIso8601String(),
            ])
            ->all();

        return [
            'by_method' => $byMethod,
            'by_plan' => $byPlan,
            'recent' => $recent,
        ];
    }
}
