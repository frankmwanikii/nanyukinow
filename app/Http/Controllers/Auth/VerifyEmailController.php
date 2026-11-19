<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\EmailVerificationCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified (signed link).
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('account.index', absolute: false));
        }

        if ($request->user()->markEmailAsVerified()) {
            EmailVerificationCode::forget($request->user());
            event(new Verified($request->user()));
        }

        return redirect()
            ->intended(route('account.index', absolute: false))
            ->with('success', 'Your email is verified. You’re ready to list, claim, and message.');
    }
}
