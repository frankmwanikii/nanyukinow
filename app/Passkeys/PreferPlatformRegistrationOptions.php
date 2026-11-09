<?php

namespace App\Passkeys;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\Passkeys;
use RuntimeException;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\PublicKeyCredentialCreationOptions;

class PreferPlatformRegistrationOptions extends GenerateRegistrationOptions
{
    /**
     * Create a passkey on this device (Mac Touch ID, Windows Hello, phone unlock).
     */
    public function __invoke(Authenticatable $user): PublicKeyCredentialCreationOptions
    {
        if (! $user instanceof PasskeyUser) {
            throw new RuntimeException('User model must implement the PasskeyUser contract.');
        }

        return PublicKeyCredentialCreationOptions::create(
            rp: $this->relyingParty(),
            user: $this->userEntity($user),
            challenge: random_bytes(32),
            pubKeyCredParams: $this->supportedAlgorithms(),
            authenticatorSelection: $this->authenticatorSelection(),
            attestation: PublicKeyCredentialCreationOptions::ATTESTATION_CONVEYANCE_PREFERENCE_NONE,
            excludeCredentials: $this->excludedCredentials($user),
            timeout: Passkeys::timeout(),
            hints: ['client-device'],
        );
    }

    /**
     * Prefer this Mac/PC/phone unlock surface, not a QR phone handoff.
     */
    public function authenticatorSelection(): AuthenticatorSelectionCriteria
    {
        return AuthenticatorSelectionCriteria::create(
            authenticatorAttachment: AuthenticatorSelectionCriteria::AUTHENTICATOR_ATTACHMENT_PLATFORM,
            userVerification: AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_REQUIRED,
            residentKey: AuthenticatorSelectionCriteria::RESIDENT_KEY_REQUIREMENT_REQUIRED,
        );
    }
}
