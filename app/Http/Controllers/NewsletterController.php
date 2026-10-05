<?php

namespace App\Http\Controllers;

use App\Mail\NewsletterSubscriptionConfirmationMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower(trim($data['email']));

        NewsletterSubscriber::query()->updateOrCreate(
            ['email' => $email],
            ['subscribed_at' => now()],
        );

        try {
            Mail::to($email)->send(new NewsletterSubscriptionConfirmationMail($email));
        } catch (\Throwable $e) {
            report($e);
        }

        $message = 'You’re subscribed — welcome to Nanyuki Insider.';

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }

        return back()->with('success', $message);
    }
}
