<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Passkeys\Contracts\PasskeyLoginResponse as PasskeyLoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class PasskeyLoginResponse implements PasskeyLoginResponseContract
{
    /**
     * @param  Request  $request
     */
    public function toResponse($request): Response
    {
        $request->session()->flash('success', 'Welcome back. You are signed in.');

        $redirect = redirect()->intended(config('passkeys.redirect', '/account'));

        if ($request->wantsJson()) {
            return new JsonResponse([
                'redirect' => $redirect->getTargetUrl(),
            ], 200);
        }

        return $redirect;
    }
}
