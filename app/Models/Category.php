<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'icon',
        'sort_order',
    ];

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(CategorySubcategory::class)
            ->orderBy('sort_order')
            ->orderBy('name');
    }
}
