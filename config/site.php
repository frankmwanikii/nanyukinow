<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site preview gate
    |--------------------------------------------------------------------------
    |
    | When enabled, the public site stays locked until a visitor opens the
    | preview path once. That visit stores a session flag for later access.
    | Admin Settings → Site access can override this at runtime.
    |
    */

    'preview_gate_enabled' => (bool) env('SITE_PREVIEW_GATE', true),

    'preview_path' => env('SITE_PREVIEW_PATH', 'nn-dev-preview'),

    'preview_session_key' => 'site_preview_unlocked',

    /*
    |--------------------------------------------------------------------------
    | Staff console path
    |--------------------------------------------------------------------------
    |
    | Prefix for all admin routes (login included). Use a non-guessable value
    | in production via ADMIN_PATH. Letters, numbers, and hyphens only.
    | Default stays "admin" for local/tests.
    |
    */

    'admin_path' => env('ADMIN_PATH', 'admin'),

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
