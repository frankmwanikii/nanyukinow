<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PricingPlanUpdateRequest;
use App\Models\PricingPlan;
use App\Support\CategoryKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    public function index(Request $request): Response
    {
        $categoryKey = CategoryKey::fromSlug($request->string('category')->toString());

        PricingPlan::ensureDefaults();

        $plans = $categoryKey
            ? PricingPlan::orderedForAdmin($categoryKey)
            : collect();

        return Inertia::render('Admin/Pricing/Index', [
            'plans' => $plans,
            'categories' => CategoryKey::options(),
            'selectedCategory' => $categoryKey,
            'selectedCategoryLabel' => CategoryKey::label($categoryKey),
            'billingPeriods' => $this->billingPeriods(),
        ]);
    }

    public function edit(Request $request, PricingPlan $pricing): Response
    {
        $categoryKey = CategoryKey::fromSlug($pricing->category_key);
        $siblingPlans = PricingPlan::orderedForAdmin($categoryKey);

        return Inertia::render('Admin/Pricing/Edit', [
            'plan' => [
                'id' => $pricing->id,
                'key' => $pricing->key,
                'category_key' => $pricing->category_key,
                'category_label' => CategoryKey::label($pricing->category_key),
                'name' => $pricing->name,
                'tagline' => $pricing->tagline,
                'price_amount' => $pricing->price_amount,
                'yearly_price_amount' => $pricing->yearly_price_amount,
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
            'allPlans' => $siblingPlans,
            'categories' => CategoryKey::options(),
            'billingPeriods' => $this->billingPeriods(),
        ]);
    }

    public function update(PricingPlanUpdateRequest $request, PricingPlan $pricing): RedirectResponse
    {
        $data = $request->validated();

        if (($data['is_highlighted'] ?? false) === true) {
            PricingPlan::query()
                ->forCategory($pricing->category_key)
                ->whereKeyNot($pricing->id)
                ->update(['is_highlighted' => false]);
        }

        $pricing->update($data);

        return back()->with('success', "{$pricing->name} pricing saved for ".CategoryKey::label($pricing->category_key).'.');
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
        $categoryKey = $pricing->category_key;
        $category = CategoryKey::label($categoryKey) ?: $categoryKey;
        $pricing->delete();

        return redirect()
            ->route('admin.pricing.index', [
                'category' => CategoryKey::slug($categoryKey) ?: $categoryKey,
            ])
            ->with('success', "{$name} pricing removed from {$category}.");
    }
}
