<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $status = Password::sendResetLink(
                $request->only('email')
            );
        } catch (Throwable $e) {
            Log::error('Password reset link failed to send.', [
                'email' => $request->string('email')->toString(),
                'message' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'email' => 'We could not send the reset link right now. Please try again in a moment.',
            ]);
        }

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with(
                'status',
                'If that email is registered, a password reset link is on its way. Check your inbox and spam folder.',
            );
        }

        // Keep account existence private for unknown emails.
        if ($status === Password::INVALID_USER) {
            return back()->with(
                'status',
                'If that email is registered, a password reset link is on its way. Check your inbox and spam folder.',
            );
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
