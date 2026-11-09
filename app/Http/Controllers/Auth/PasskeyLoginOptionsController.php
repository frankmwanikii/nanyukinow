<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Passkeys\Actions\GenerateVerificationOptions;
use Laravel\Passkeys\Support\WebAuthn;

class PasskeyLoginOptionsController extends Controller
{
    /**
     * Build login options, optionally scoped to an account's passkeys.
     */
    public function __invoke(Request $request, GenerateVerificationOptions $generate): JsonResponse
    {
        $user = null;
        $login = Str::lower(trim((string) $request->query('login', '')));

        if ($login !== '') {
            $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
            $candidate = User::query()->where($field, $login)->first();

            if ($candidate instanceof User && $candidate->hasPasskeysEnabled()) {
                $user = $candidate;
            }
        }

        $options = $generate($user);
        $serialized = WebAuthn::toJson($options);
        $request->session()->put('passkey.verification_options', $serialized);

        return response()->json([
            'options' => WebAuthn::toBrowserArray($options),
        ]);
    }
}
