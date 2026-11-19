<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeMemberNotification;
use App\Support\Recaptcha;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Check whether an email is already registered.
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $taken = User::query()
            ->where('email', Str::lower($validated['email']))
            ->exists();

        return response()->json([
            'available' => ! $taken,
            'message' => $taken
                ? 'This email is already registered. Please sign in.'
                : null,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'alpha_dash',
                'unique:'.User::class,
            ],
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => [
                'required',
                'confirmed',
                Rules\Password::min(8)
                    ->letters()
                    ->numbers()
                    ->symbols(),
            ],
            'g-recaptcha-response' => ['required', 'string'],
        ], [
            'email.unique' => 'This email is already registered. Please sign in.',
            'g-recaptcha-response.required' => 'Please complete the security check.',
        ]);

        Recaptcha::validateRequest(
            $request->string('g-recaptcha-response')->toString(),
            $request->ip(),
        );

        $name = trim($request->string('first_name').' '.$request->string('last_name'));

        $user = User::create([
            'name' => $name,
            'username' => Str::lower($request->username),
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        $user->sendEmailVerificationNotification();
        $user->notify(new WelcomeMemberNotification);

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
