<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SitePreviewController extends Controller
{
    /**
     * Unlock the site for this browser session, then continue to the home page.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $request->session()->put((string) config('site.preview_session_key'), true);

        return redirect()
            ->route('home')
            ->with('success', 'Preview unlocked for this browser.');
    }
}
