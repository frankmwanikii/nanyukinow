<?php

namespace App\Support;

class ListingSubcategories
{
    /**
     * Normalize subcategory input (string, JSON string, or list) to a clean list of labels.
     *
     * @param  mixed  $value
     * @return list<string>
     */
    public static function normalize(mixed $value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_string($value)) {
            $trimmed = trim($value);
            if ($trimmed === '') {
                return [];
            }

            $decoded = json_decode($trimmed, true);
            if (is_array($decoded)) {
                $value = $decoded;
            } else {
                return [$trimmed];
            }
        }

        if (! is_array($value)) {
            return [];
        }

        $out = [];
        foreach ($value as $item) {
            if (! is_string($item) && ! is_numeric($item)) {
                continue;
            }
            $label = trim((string) $item);
            if ($label === '' || in_array($label, $out, true)) {
                continue;
            }
            $out[] = $label;
        }

        return $out;
    }

    /**
     * @param  mixed  $value
     */
    public static function encode(mixed $value): ?string
    {
        $normalized = self::normalize($value);

        return $normalized === [] ? null : json_encode(array_values($normalized));
    }
}
