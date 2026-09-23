<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PricingPlanUpdateRequest;
use App\Models\PricingPlan;
use App\Support\AdminPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPagination::perPage($request);
        $page = max(1, $request->integer('page', 1));
        $all = PricingPlan::orderedForAdmin();
        $total = $all->count();
        $items = $all->slice(($page - 1) * $perPage, $perPage)->values();

        $plans = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );

        return Inertia::render('Admin/Pricing/Index', [
            'plans' => $plans,
            'filters' => [
                'per_page' => $perPage,
            ],
            'billingPeriods' => $this->billingPeriods(),
        ]);
    }

    public function edit(PricingPlan $pricing): Response
    {
        return Inertia::render('Admin/Pricing/Edit', [
            'plan' => [
                'id' => $pricing->id,
                'key' => $pricing->key,
                'name' => $pricing->name,
                'tagline' => $pricing->tagline,
                'price_amount' => $pricing->price_amount,
                'currency' => $pricing->currency,
                'billing_period' => $pricing->billing_period,
                'price_label' => $pricing->price_label,
                'inclusions' => $pricing->inclusions ?? [],
                'cta_label' => $pricing->cta_label,
                'is_highlighted' => (bool) $pricing->is_highlighted,
                'is_active' => (bool) $pricing->is_active,
                'sort_order' => $pricing->sort_order,
                'listing_limit' => $pricing->listing_limit,
                'updated_at' => $pricing->updated_at?->toIso8601String(),
            ],
            'billingPeriods' => $this->billingPeriods(),
        ]);
    }

    public function update(PricingPlanUpdateRequest $request, PricingPlan $pricing): RedirectResponse
    {
        $data = $request->validated();

        if (($data['is_highlighted'] ?? false) === true) {
            PricingPlan::query()
                ->whereKeyNot($pricing->id)
                ->update(['is_highlighted' => false]);
        }

        $pricing->update($data);

        return back()->with('success', "{$pricing->name} pricing saved.");
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function billingPeriods(): array
    {
        return [
            ['value' => 'month', 'label' => 'Per month'],
            ['value' => 'year', 'label' => 'Per year'],
            ['value' => 'one_time', 'label' => 'One-time'],
        ];
    }

    public function destroy(PricingPlan $pricing): RedirectResponse
    {
        $name = $pricing->name;
        $pricing->delete();

        return back()->with('success', "{$name} tier deleted.");
    }
}
