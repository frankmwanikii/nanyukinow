<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Support\ListingEditLock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingEditLockController extends Controller
{
    public function store(Request $request, Listing $listing): JsonResponse
    {
        $token = $request->string('token')->toString();

        $result = $token !== ''
            ? ListingEditLock::heartbeat($listing, $request->user(), $token)
            : ListingEditLock::acquire($listing, $request->user());

        return response()->json($result, $result['held'] ? 200 : 409);
    }

    public function destroy(Request $request, Listing $listing): JsonResponse
    {
        ListingEditLock::release(
            $listing,
            $request->user(),
            $request->string('token')->toString() ?: null,
        );

        return response()->json(['released' => true]);
    }
}
