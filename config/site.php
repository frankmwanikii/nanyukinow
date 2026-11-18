<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site preview gate
    |--------------------------------------------------------------------------
    |
    | When enabled, the public site stays locked until a visitor opens the
    | preview path once. That visit stores a session flag for later access.
    |
    */

    'preview_gate_enabled' => (bool) env('SITE_PREVIEW_GATE', true),

    'preview_path' => env('SITE_PREVIEW_PATH', 'nn-dev-preview'),

    'preview_session_key' => 'site_preview_unlocked',

    /*
    |--------------------------------------------------------------------------
    | Claim plan grace
    |--------------------------------------------------------------------------
    |
    | After a claim is approved, paid placement (tier / featured / promoted)
    | stays for this many days, then the listing moves to Free. Verified
    | status is kept either way.
    |
    */

    'claim_plan_grace_days' => (int) env('CLAIM_PLAN_GRACE_DAYS', 30),

];
