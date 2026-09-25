<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\ListingClaim;
use App\Support\ListingMedia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ListingClaimController extends Controller
{
    public function store(Request $request, Listing $listing): RedirectResponse
    {
        if ($listing->claim_status === 'claimed') {
            throw ValidationException::withMessages([
                'listing' => 'This listing has already been claimed.',
            ]);
        }

        $hasPending = ListingClaim::query()
            ->where('listing_id', $listing->id)
            ->where('status', ListingClaim::STATUS_PENDING)
            ->exists();

        if ($hasPending || $listing->claim_status === 'pending') {
            throw ValidationException::withMessages([
                'listing' => 'A claim for this listing is already under review.',
            ]);
        }

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:40'],
            'reason' => ['required', 'string', 'max:4000'],
            'documents' => ['nullable', 'array', 'max:5'],
            'documents.*' => [
                'file',
                'max:8192',
                'mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx',
            ],
            'confirmed' => ['accepted'],
        ]);

        $documents = [];
        foreach ($request->file('documents', []) as $file) {
            if (! $file) {
                continue;
            }
            $documents[] = [
                'url' => ListingMedia::store($file, 'listings/claims'),
                'name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ];
        }

        DB::transaction(function () use ($request, $listing, $data, $documents): void {
            ListingClaim::query()->create([
                'listing_id' => $listing->id,
                'user_id' => $request->user()?->id,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'reason' => $data['reason'],
                'documents' => $documents,
                'status' => ListingClaim::STATUS_PENDING,
            ]);

            $listing->update(['claim_status' => 'pending']);
        });

        return back()->with(
            'success',
            'Claim submitted. We’ll review your request and get back to you.',
        );
    }
}
