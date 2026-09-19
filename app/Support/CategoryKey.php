<?php

namespace App\Support;

class CategoryKey
{
    /**
     * Normalize DB category slug to the camelCase keys used by the React UI.
     */
    public static function fromSlug(?string $slug): ?string
    {
        if ($slug === null || $slug === '') {
            return null;
        }

        return match ($slug) {
            'eat-drink', 'eatDrink' => 'eatDrink',
            'things-to-do', 'thingsToDo' => 'thingsToDo',
            'stay' => 'stay',
            'services' => 'services',
            'shopping' => 'shopping',
            'properties' => 'properties',
            'events' => 'events',
            default => $slug,
        };
    }
}
