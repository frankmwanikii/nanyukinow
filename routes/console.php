<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('payments:confirm-palpluss')
    ->everyMinute()
    ->withoutOverlapping(5);

Schedule::command('membership:process-renewals')
    ->dailyAt('08:00')
    ->withoutOverlapping(30);

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
