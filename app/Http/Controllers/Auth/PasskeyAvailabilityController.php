<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PasskeyAvailabilityController extends Controller
{
    /**
     * Check whether the given account has a passkey registered.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login' => ['required', 'string', 'max:255'],
        ]);

        $login = Str::lower(trim($validated['login']));
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::query()->where($field, $login)->first();

        if (! $user) {
            return response()->json([
                'status' => 'unknown',
            ]);
        }

        return response()->json([
            'status' => $user->hasPasskeysEnabled() ? 'ready' : 'missing',
        ]);
    }
}
