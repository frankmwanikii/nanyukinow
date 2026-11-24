<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL').'/auth/google/callback'),
        'maps_key' => env('VITE_GOOGLE_MAPS_API_KEY', env('GOOGLE_MAPS_API_KEY')),
    ],

    /*
    | Gemini (Nyuki AI). Server-side only. Free-tier key from Google AI Studio.
    | https://aistudio.google.com/apikey
    */
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
    ],

    /*
    | Foursquare Places API (server-side only). Prefer Admin → Settings → Maps.
    | Docs: https://docs.foursquare.com/fsq-developers-places/reference/place-search
    */
    'foursquare' => [
        'api_key' => env('FOURSQUARE_API_KEY'),
        'api_version' => env('FOURSQUARE_API_VERSION', '2025-06-17'),
    ],

    'recaptcha' => [
        'secret' => env('RECAPTCHA_SECRET_KEY'),
    ],

    /*
    | Mobitech Bulk SMS — https://bulk.mobitechtechnologies.com/dev/sms
    | API: POST https://api.mobitechtechnologies.com/sms/sendsms
    | Auth header: h_api_key
    */
    'mobitech' => [
        'api_key' => env('MOBITECH_SMS_API_KEY'),
        'sender_name' => env('MOBITECH_SMS_SENDER_NAME', 'NanyukiNow'),
        'service_id' => (int) env('MOBITECH_SMS_SERVICE_ID', 0),
        'base_url' => env('MOBITECH_SMS_BASE_URL', 'https://api.mobitechtechnologies.com'),
    ],

];
