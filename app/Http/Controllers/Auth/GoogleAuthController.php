<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeMemberNotification;
use App\Support\UserAvatar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->credentialsConfigured()) {
            return redirect()
                ->route('home')
                ->with('status', 'Google sign-in is not configured yet. Please use email instead.');
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! $this->credentialsConfigured()) {
            return redirect()
                ->route('home')
                ->with('status', 'Google sign-in is not configured yet. Please use email instead.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()
                ->route('home')
                ->with('status', 'Google sign-in failed. Please try again or use email.');
        }

        $email = $googleUser->getEmail();

        if (! filled($email)) {
            return redirect()
                ->route('home')
                ->with('status', 'Google did not return an email address.');
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
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

        // Pull Google photo when the member has none yet (never overwrite a custom upload).
        if (! filled($user->avatar_url)) {
            $imported = UserAvatar::importFromUrl($googleUser->getAvatar());
            if ($imported) {
                $user->forceFill(['avatar_url' => $imported])->save();
            }
        }

        Auth::login($user, remember: true);

        return redirect()->intended(route('account.index', absolute: false));
    }

    private function credentialsConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'));
    }
}
