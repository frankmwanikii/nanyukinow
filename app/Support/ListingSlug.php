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
     * Auto generated fallback slugs such as "listing" or "listing-2".
     */
    public static function isGeneric(?string $slug): bool
    {
        $slug = Str::lower(trim((string) $slug));

        return preg_match('/^listing(-\d+)?$/', $slug) === 1;
    }

    /**
     * Slugs that must always be replaced by the listing title.
     */
    public static function needsTitleSlug(?string $slug): bool
    {
        return self::isPlaceholder($slug) || self::isGeneric($slug);
    }

    /**
     * Determine whether a slug was generated from the given listing title.
     */
    public static function followsTitle(?string $slug, ?string $title): bool
    {
        $slug = Str::lower(trim((string) $slug));
        $titleSlug = Str::slug((string) $title);

        if ($slug === '') {
            return true;
        }

        if ($titleSlug === '') {
            return self::needsTitleSlug($slug);
        }

        return $slug === $titleSlug
            || preg_match('/^'.preg_quote($titleSlug, '/').'-\d+$/', $slug) === 1;
    }

    /**
     * Build a unique URL slug from the listing name.
     */
    public static function make(string $title, ?int $ignoreId = null, ?string $preferred = null): string
    {
        $titleSlug = Str::slug($title);
        $preferredSlug = $preferred !== null ? Str::slug(trim($preferred)) : '';

        if ($preferredSlug !== '' && ! self::needsTitleSlug($preferredSlug)) {
            $base = $preferredSlug;
        } elseif ($titleSlug !== '' && ! self::isPlaceholder($titleSlug)) {
            $base = $titleSlug;
        } else {
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

    /**
     * Resolve the slug to store when a listing is saved.
     *
     * A slug generated from the previous title follows the new title, while a
     * slug that was customised by hand is preserved.
     */
    public static function resolve(
        string $title,
        ?int $listingId = null,
        ?string $currentSlug = null,
        ?string $currentTitle = null,
        ?string $submittedSlug = null,
    ): string {
        $submitted = $submittedSlug !== null ? trim($submittedSlug) : '';
        $current = $currentSlug !== null ? trim($currentSlug) : '';

        if ($submitted !== '' && $submitted !== $current) {
            return self::make($title, $listingId, $submitted);
        }

        if ($current !== ''
            && $currentTitle !== null
            && ! self::followsTitle($current, $currentTitle)) {
            return self::make($title, $listingId, $current);
        }

        return self::make($title, $listingId, null);
    }
}
