<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Support\Membership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PremiumTrialController extends Controller
{
    public function claim(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! Membership::claimPremiumTrial($user)) {
            return back()->with(
                'error',
                'This Premium trial is no longer available on your account.',
            );
        }

        return back()->with(
            'success',
            'Premium trial is on. You have three months to explore the full plan.',
        );
    }

    public function dismiss(Request $request): RedirectResponse
    {
        Membership::dismissTrialBanner($request->user());

        return back();
    }
}
