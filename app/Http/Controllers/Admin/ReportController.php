<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ListingReport;
use App\Support\AdminPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: 'pending';
        if (! in_array($status, ['all', 'pending', 'reviewed', 'dismissed'], true)) {
            $status = 'pending';
        }

        $q = $request->string('q')->toString();
        $perPage = AdminPagination::perPage($request, 15);

        $query = ListingReport::query()
            ->with([
                'listing:id,title,slug,image_url,location',
                'user:id,name,email',
                'reviewer:id,name',
            ])
            ->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($inner) use ($like) {
                $inner->where('reason', 'like', $like)
                    ->orWhere('details', 'like', $like)
                    ->orWhere('reporter_name', 'like', $like)
                    ->orWhere('reporter_email', 'like', $like)
                    ->orWhereHas('listing', function ($listing) use ($like) {
                        $listing->where('title', 'like', $like)
                            ->orWhere('slug', 'like', $like);
                    });
            });
        }

        $reports = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (ListingReport $report) => $report->toAdminArray());

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'counts' => $this->counts(),
        ]);
    }

    public function show(ListingReport $report): Response
    {
        $report->load([
            'listing:id,title,slug,image_url,location',
            'user:id,name,email',
            'reviewer:id,name',
        ]);

        return Inertia::render('Admin/Reports/Show', [
            'report' => $report->toAdminArray(),
            'counts' => $this->counts(),
        ]);
    }

    public function resolve(Request $request, ListingReport $report): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:reviewed,dismissed'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $report->update([
            'status' => $data['status'],
            'admin_notes' => $data['admin_notes'] ?? $report->admin_notes,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return redirect()
            ->route('admin.reports.index', ['status' => 'pending'])
            ->with('success', $data['status'] === 'dismissed'
                ? 'Report dismissed.'
                : 'Report marked as reviewed.');
    }

    public function destroy(ListingReport $report): RedirectResponse
    {
        $report->delete();

        return redirect()
            ->route('admin.reports.index')
            ->with('success', 'Report deleted.');
    }

    /**
     * @return array{pending: int, reviewed: int, dismissed: int, all: int}
     */
    private function counts(): array
    {
        return [
            'pending' => ListingReport::query()->where('status', ListingReport::STATUS_PENDING)->count(),
            'reviewed' => ListingReport::query()->where('status', ListingReport::STATUS_REVIEWED)->count(),
            'dismissed' => ListingReport::query()->where('status', ListingReport::STATUS_DISMISSED)->count(),
            'all' => ListingReport::query()->count(),
        ];
    }
}
