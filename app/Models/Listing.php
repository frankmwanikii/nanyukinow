<?php

namespace App\Models;

use App\Casts\SubcategoryList;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Listing extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'subcategory',
        'property_type',
        'title',
        'slug',
        'location',
        'description',
        'tagline',
        'phone',
        'email',
        'website',
        'whatsapp',
        'address',
        'venue',
        'city',
        'latitude',
        'longitude',
        'start_at',
        'end_at',
        'ticket_price',
        'early_bird_price',
        'gate_price',
        'ticket_options',
        'ticket_url',
        'image_url',
        'logo_url',
        'event_poster_url',
        'rating',
        'status',
        'tier',
        'priority',
        'views_count',
        'likes_count',
        'price_range',
        'gallery',
        'hours',
        'amenities',
        'social_links',
        'details',
        'expires_at',
        'published_at',
        'claim_status',
        'is_verified',
        'claim_grace_ends_at',
        'is_featured',
        'is_trending',
        'is_published',
        'suppressed_by_plan_expiry',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'latitude' => 'float',
            'longitude' => 'float',
            'priority' => 'integer',
            'views_count' => 'integer',
            'likes_count' => 'integer',
            'gallery' => 'array',
            'hours' => 'array',
            'amenities' => 'array',
            'social_links' => 'array',
            'details' => 'array',
            'ticket_options' => 'array',
            'subcategory' => SubcategoryList::class,
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'expires_at' => 'datetime',
            'published_at' => 'datetime',
            'is_verified' => 'boolean',
            'claim_grace_ends_at' => 'datetime',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'is_published' => 'boolean',
            'suppressed_by_plan_expiry' => 'boolean',
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

    public function claims(): HasMany
    {
        return $this->hasMany(ListingClaim::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ListingReview::class);
    }

    public function bookmarkedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'listing_bookmarks')
            ->withTimestamps();
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->where('suppressed_by_plan_expiry', false)
            ->where(function (Builder $q) {
                $q->whereNull('status')->orWhere('status', 'published');
            })
            ->where(function (Builder $q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function expiryLabel(): string
    {
        if ($this->expires_at === null) {
            return 'No expiry';
        }

        if ($this->isExpired()) {
            return 'Expired';
        }

        return 'Expires '.$this->expires_at->diffForHumans();
    }
}
