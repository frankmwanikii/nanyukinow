<?php

namespace App\Models;

use Database\Factories\ListingReviewFactory;
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
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
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

    /**
     * Recalculate and persist the listing's average rating from member reviews.
     */
    public static function syncListingRating(Listing $listing): void
    {
        $average = static::query()
            ->where('listing_id', $listing->id)
            ->avg('rating');

        $listing->forceFill([
            'rating' => $average !== null ? round((float) $average, 1) : null,
        ])->save();
    }
}
