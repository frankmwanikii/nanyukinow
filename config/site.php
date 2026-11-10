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

];
