<?php

namespace Tests;

use App\Http\Middleware\EnsureSitePreviewAccess;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Coming-soon maintenance must not block feature tests.
        $this->withoutMiddleware(PreventRequestsDuringMaintenance::class);
        // Laravel 12 CSRF middleware is active in HTTP tests unless disabled.
        $this->withoutMiddleware(PreventRequestForgery::class);
        // Preview lock would 404 the public site whenever the setting is on.
        $this->withoutMiddleware(EnsureSitePreviewAccess::class);
    }
}
