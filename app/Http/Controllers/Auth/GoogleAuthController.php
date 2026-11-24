<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeMemberNotification;
use App\Support\UserAvatar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public const INTENT_LOGIN = 'login';

    public const INTENT_REGISTER = 'register';

    public function redirect(Request $request): RedirectResponse
    {
        if (! $this->credentialsConfigured()) {
            return redirect()
                ->route('home')
                ->with('status', 'Google sign-in is not configured yet. Please use email instead.');
        }

        $intent = $request->string('intent')->toString() === self::INTENT_REGISTER
            ? self::INTENT_REGISTER
            : self::INTENT_LOGIN;

        $request->session()->put('google_auth_intent', $intent);

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! $this->credentialsConfigured()) {
            return redirect()
                ->route('home')
                ->with('status', 'Google sign-in is not configured yet. Please use email instead.');
        }

        $intent = $request->session()->pull('google_auth_intent', self::INTENT_LOGIN);
        $allowCreate = $intent === self::INTENT_REGISTER;

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()
                ->route('home')
                ->with('status', 'Google sign-in failed. Please try again or use email.');
        }

        $email = Str::lower((string) $googleUser->getEmail());

        if (! filled($email)) {
            return redirect()
                ->route('home')
                ->with('status', 'Google did not return an email address.');
        }

        // Match password login: always resolve by normalized email so one account
        // (and one avatar) is shared across Google and email sign-in.
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            if (! $allowCreate) {
                return redirect()
                    ->route('login')
                    ->with('status', 'No account found with those details. Join first, then sign in with Google.');
            }

            $base = Str::lower(Str::slug(Str::before($email, '@'), '_')) ?: 'user';
            $base = Str::limit(preg_replace('/[^a-z0-9_-]/', '', $base) ?: 'user', 24, '');
            $username = $base;
            $i = 1;

            while (User::query()->where('username', $username)->exists()) {
                $username = Str::limit($base, 20, '').$i;
                $i++;
            }

            $user = User::query()->create([
                'name' => $googleUser->getName() ?: 'Nanyuki Now member',
                'username' => $username,
                'email' => $email,
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(40)),
            ]);

            $user->notify(new WelcomeMemberNotification);
        } elseif (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        // Drop broken "/storage/" (or missing) paths so they don't block import
        // and don't diverge from what password login shows.
        UserAvatar::clearUnusable($user);

        // Pull Google photo only when there is no usable avatar yet.
        // Never overwrite a custom upload (or any existing usable photo).
        if (! UserAvatar::isUsable($user->avatar_url)) {
            $imported = UserAvatar::importFromUrl($googleUser->getAvatar());
            if ($imported) {
                $user->forceFill(['avatar_url' => $imported])->save();
            }
        }

        Auth::login($user, remember: true);

        return redirect()
            ->intended(route('account.index', absolute: false))
            ->with('success', 'Welcome back. You are signed in.');
    }

    private function credentialsConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'));
    }
}
