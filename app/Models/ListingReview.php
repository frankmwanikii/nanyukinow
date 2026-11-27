<?php

namespace App\Models;

use Database\Factories\ListingReviewFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingReview extends Model
{
    /** @use HasFactory<ListingReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'user_id',
        'rating',
        'body',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Recalculate and persist the listing's average rating from published reviews.
     */
    public static function syncListingRating(Listing $listing): void
    {
        $average = static::query()
            ->where('listing_id', $listing->id)
            ->published()
            ->avg('rating');

        $listing->forceFill([
            'rating' => $average !== null ? round((float) $average, 1) : null,
        ])->save();
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'rating' => (int) $this->rating,
            'body' => $this->body,
            'is_published' => (bool) $this->is_published,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'listing' => $this->listing ? [
                'id' => $this->listing->id,
                'title' => $this->listing->title,
                'slug' => $this->listing->slug,
                'image' => $this->listing->image_url,
                'location' => $this->listing->location,
            ] : null,
            'author' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null,
        ];
    }
}
