<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Support\CategoryKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AmenityController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'category_key' => ['nullable', 'string', 'max:40'],
        ]);

        $categoryKey = CategoryKey::fromSlug($data['category_key'] ?? null);
        $amenity = Amenity::findOrCreateNamed($data['name'], $categoryKey);

        return response()->json([
            'amenity' => [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'slug' => $amenity->slug,
                'icon_key' => $amenity->icon_key,
                'category_key' => $amenity->category_key,
            ],
        ], 201);
    }
}
