<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\ListingReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ListingReportController extends Controller
{
    public function store(Request $request, Listing $listing): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:120'],
            'details' => ['required', 'string', 'min:10', 'max:5000'],
            'reporter_name' => ['nullable', 'string', 'max:120'],
            'reporter_email' => ['nullable', 'email', 'max:255'],
        ]);

        $user = $request->user();

        ListingReport::query()->create([
            'listing_id' => $listing->id,
            'user_id' => $user?->id,
            'reason' => $data['reason'],
            'details' => trim($data['details']),
            'reporter_name' => $data['reporter_name']
                ?? $user?->name,
            'reporter_email' => isset($data['reporter_email'])
                ? strtolower(trim($data['reporter_email']))
                : $user?->email,
            'status' => ListingReport::STATUS_PENDING,
        ]);

        $success = 'Thanks — we received your report.';

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $success,
            ]);
        }

        return back()->with('success', $success);
    }
}
