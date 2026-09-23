<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PricingPlanUpdateRequest;
use App\Models\PricingPlan;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Pricing/Index', [
            'plans' => PricingPlan::orderedForAdmin(),
            'billingPeriods' => [
                ['value' => 'month', 'label' => 'Per month'],
                ['value' => 'year', 'label' => 'Per year'],
                ['value' => 'one_time', 'label' => 'One-time'],
            ],
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

    public function destroy(PricingPlan $pricing): RedirectResponse
    {
        $name = $pricing->name;
        $pricing->delete();

        return back()->with('success', "{$name} tier deleted.");
    }
}
