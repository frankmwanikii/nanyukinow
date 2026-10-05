<?php

namespace Tests;

use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Coming-soon maintenance must not block feature tests.
        $this->withoutMiddleware(PreventRequestsDuringMaintenance::class);
    }
}
