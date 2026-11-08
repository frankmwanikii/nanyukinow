<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NyukiPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_nyuki_page_is_public(): void
    {
        $this->get(route('nyuki'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Nyuki/Index')
                ->has('prompts', 4)
            );
    }
}
