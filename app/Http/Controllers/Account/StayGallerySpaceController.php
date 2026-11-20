<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\StayGallerySpace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StayGallerySpaceController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ]);

        $space = StayGallerySpace::findOrCreateNamed($data['name']);

        return response()->json([
            'space' => [
                'id' => $space->id,
                'name' => $space->name,
                'slug' => $space->slug,
            ],
        ], 201);
    }
}
