<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NyukiController extends Controller
{
    /**
     * Nyuki AI — local guide for listings, recommendations, and town questions.
     */
    public function __invoke(Request $request): Response
    {
        return Inertia::render('Nyuki/Index', [
            'prompts' => [
                'Where should I eat lunch near town?',
                'Quiet places to stay this weekend',
                "What's on this Saturday night?",
                'Tell me about a listing I saved',
            ],
        ]);
    }
}
