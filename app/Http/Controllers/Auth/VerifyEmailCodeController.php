<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\EmailVerificationCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VerifyEmailCodeController extends Controller
{
    /**
     * Confirm the authenticated user's email with a 6-digit code.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('account.index', absolute: false));
        }

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:12'],
        ], [
            'code.required' => 'Enter the 6-digit code from your email.',
        ]);

        if (! EmailVerificationCode::matches($user, $validated['code'])) {
            throw ValidationException::withMessages([
                'code' => 'That code is invalid or has expired. Request a new one and try again.',
            ]);
        }

        if ($user->markEmailAsVerified()) {
            EmailVerificationCode::forget($user);
            event(new Verified($user));
        }

        return redirect()
            ->intended(route('account.index', absolute: false))
            ->with('success', 'Your email is verified. You’re ready to list, claim, and message.');
    }
}
