<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use App\Support\CategoryKey;
use App\Support\Membership;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PricingPageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $page = SitePage::findBySlug('pricing');

        return Inertia::render('Pricing', [
            'plansByCategory' => Membership::publicPlansByCategory(),
            'categories' => CategoryKey::options(),
            'initialCategory' => CategoryKey::fromSlug($request->string('category')->toString()),
            'currentPlan' => $user ? Membership::planSummary($user) : null,
            'page' => $page?->toPublicArray(),
        ]);
    }
}
