<?php

namespace Tests\Unit;

use App\Support\Nyuki\NyukiSuggestions;
use Tests\TestCase;

class NyukiSuggestionsTest extends TestCase
{
    public function test_builds_follow_ups_and_explore_cta_for_stay_citations(): void
    {
        $suggestions = (new NyukiSuggestions)->forReply(
            'Quiet places to stay this weekend',
            [
                [
                    'title' => 'Olepangi Farm',
                    'categoryKey' => 'stay',
                ],
            ],
        );

        $this->assertSame(
            'Tell me more about Olepangi Farm',
            $suggestions['follow_ups'][0]['label'],
        );
        $this->assertCount(2, $suggestions['follow_ups']);
        $this->assertSame('Browse Stay', $suggestions['explore_cta']['label']);
        $this->assertSame('/explore?category=stay', $suggestions['explore_cta']['href']);
    }

    public function test_skips_tell_me_more_when_user_already_asked_details(): void
    {
        $suggestions = (new NyukiSuggestions)->forReply(
            "what's their phone number?",
            [
                [
                    'title' => 'Olepangi Farm',
                    'categoryKey' => 'stay',
                ],
            ],
        );

        $this->assertNotSame(
            'Tell me more about Olepangi Farm',
            $suggestions['follow_ups'][0]['label'] ?? null,
        );
        $this->assertSame('Browse Stay', $suggestions['explore_cta']['label']);
    }
}
