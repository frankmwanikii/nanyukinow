<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::check() && Auth::user()?->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $login = $credentials['login'];
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (! Auth::attempt([$field => $login, 'password' => $credentials['password']], $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'login' => 'These credentials do not match our records.',
            ]);
        }

        if (! Auth::user()?->isAdmin()) {
            Auth::logout();

            throw ValidationException::withMessages([
                'login' => 'This account does not have admin access.',
            ]);
        }

        $previewKey = (string) config('site.preview_session_key');
        $previewUnlocked = $request->session()->get($previewKey) === true;
        $intended = $request->session()->pull('url.intended');

        $request->session()->regenerate();

        if ($previewUnlocked) {
            $request->session()->put($previewKey, true);
        }

        // Only honor intended URLs inside admin; public intended URLs can strand
        // staff behind the preview gate after a session rotate.
        if (is_string($intended) && $intended !== '') {
            $path = parse_url($intended, PHP_URL_PATH) ?: '';
            if (str_starts_with($path, '/admin')) {
                return redirect()->to($intended);
            }
        }

        return redirect()->route('admin.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
