<?php

namespace App\Passkeys;

use Laravel\Passkeys\Actions\GenerateVerificationOptions;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\Passkeys;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\PublicKeyCredentialRequestOptions;

class PreferClientDeviceVerificationOptions extends GenerateVerificationOptions
{
    /**
     * Prefer Touch ID / Windows Hello / device unlock on this computer or phone.
     */
    public function __invoke(?PasskeyUser $user = null): PublicKeyCredentialRequestOptions
    {
        return PublicKeyCredentialRequestOptions::create(
            challenge: random_bytes(32),
            rpId: Passkeys::relyingPartyId(),
            allowCredentials: $this->allowCredentials($user),
            userVerification: AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_REQUIRED,
            timeout: Passkeys::timeout(),
            hints: ['client-device'],
        );
    }
}
