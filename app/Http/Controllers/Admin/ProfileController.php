<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Admin/Profile/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'remove_avatar' => ['sometimes', 'boolean'],
        ]);

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->boolean('remove_avatar')) {
            $this->deleteStoredAvatar($user->avatar_url);
            $user->avatar_url = null;
        }

        if ($request->hasFile('avatar')) {
            $this->deleteStoredAvatar($user->avatar_url);
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = Storage::disk('public')->url($path);
        }

        $user->save();

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Password updated.');
    }

    private function deleteStoredAvatar(?string $url): void
    {
        if (! $url) {
            return;
        }

        $marker = '/storage/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            return;
        }

        $relative = substr($url, $pos + strlen($marker));
        if ($relative !== '' && Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }
}
