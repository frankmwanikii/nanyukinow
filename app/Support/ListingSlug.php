<?php

namespace App\Support;

use App\Models\Listing;
use Illuminate\Support\Str;

class ListingSlug
{
    /**
     * Draft / placeholder slugs that should be replaced by the listing title.
     */
    public static function isPlaceholder(?string $slug): bool
    {
        $slug = Str::lower(trim((string) $slug));

        if ($slug === '' || $slug === 'listing' || $slug === 'untitled') {
            return true;
        }

        if (str_starts_with($slug, 'untitled')) {
            return true;
        }

        // e.g. untitled-draft-draft-2, frayo-draft-5, draft-12
        if (preg_match('/(^|-)draft(-\d+)?$/', $slug) === 1) {
            return true;
        }

        if (preg_match('/-draft-\d+/', $slug) === 1) {
            return true;
        }

        return false;
    }

    /**
     * Build a unique URL slug from the listing name.
     */
    public static function make(string $title, ?int $ignoreId = null, ?string $preferred = null): string
    {
        $preferred = $preferred !== null ? trim($preferred) : null;

        if ($preferred !== null && $preferred !== '' && ! self::isPlaceholder(Str::slug($preferred))) {
            $base = Str::slug($preferred) ?: 'listing';
        } else {
            $base = Str::slug($title) ?: 'listing';
        }

        if (self::isPlaceholder($base)) {
            $base = Str::slug($title) ?: 'listing';
        }

        if ($base === '' || self::isPlaceholder($base)) {
            $base = 'listing';
        }

        $slug = $base;
        $i = 2;

        while (
            Listing::query()
                ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
