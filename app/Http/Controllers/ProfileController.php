<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Support\UserAvatar;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        UserAvatar::clearUnusable($user);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'avatarUrl' => UserAvatar::publicUrl($user->avatar_url),
            'passkeys' => $user->passkeys()
                ->latest()
                ->get()
                ->map(fn ($passkey) => [
                    'id' => $passkey->id,
                    'name' => $passkey->name,
                    'authenticator' => $passkey->authenticator,
                    'last_used_at' => $passkey->last_used_at?->toIso8601String(),
                    'created_at' => $passkey->created_at?->toIso8601String(),
                ])
                ->values(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->safe()->only(['name', 'email', 'phone']);
        $data['phone'] = filled($data['phone'] ?? null) ? trim((string) $data['phone']) : null;
        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->boolean('remove_avatar')) {
            UserAvatar::delete($user->avatar_url);
            $user->avatar_url = null;
        }

        if ($request->hasFile('avatar')) {
            UserAvatar::delete($user->avatar_url);
            $user->avatar_url = UserAvatar::store($request->file('avatar'));
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile updated.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        UserAvatar::delete($user->avatar_url);
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
