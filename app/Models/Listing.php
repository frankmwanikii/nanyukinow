<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Listing extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'location',
        'description',
        'image_url',
        'logo_url',
        'rating',
        'is_featured',
        'is_trending',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
