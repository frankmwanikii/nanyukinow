<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Ziggy route groups
    |--------------------------------------------------------------------------
    |
    | Public pages must not expose admin.* URIs (that would leak ADMIN_PATH).
    | Admin pages get the full route list.
    |
    */

    'groups' => [
        'guest' => ['!admin.*'],
    ],

];
