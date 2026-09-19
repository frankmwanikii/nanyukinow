<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Support\ListingMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EditorMediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:5120',
            ],
        ]);

        $url = ListingMedia::store($data['image'], 'listings/editor');

        return response()->json(['url' => $url], 201);
    }
}
