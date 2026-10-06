<?php

namespace App\Support;

class CategoryKey
{
    /**
     * @var array<string, array{slug: string, label: string}>
     */
    public const DEFINITIONS = [
        'eatDrink' => ['slug' => 'eat-drink', 'label' => 'Eat & Drink'],
        'stay' => ['slug' => 'stay', 'label' => 'Stay'],
        'thingsToDo' => ['slug' => 'things-to-do', 'label' => 'Things to do'],
        'services' => ['slug' => 'services', 'label' => 'Services'],
        'shopping' => ['slug' => 'shopping', 'label' => 'Shopping'],
        'properties' => ['slug' => 'properties', 'label' => 'Properties'],
        'events' => ['slug' => 'events', 'label' => 'Events'],
    ];

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
            default => array_key_exists($slug, self::DEFINITIONS) ? $slug : null,
        };
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::DEFINITIONS);
    }

    public static function isValid(?string $key): bool
    {
        return $key !== null && array_key_exists($key, self::DEFINITIONS);
    }

    public static function slug(?string $key): ?string
    {
        $normalized = self::fromSlug($key);

        return $normalized ? (self::DEFINITIONS[$normalized]['slug'] ?? null) : null;
    }

    public static function label(?string $key): ?string
    {
        $normalized = self::fromSlug($key);

        return $normalized ? (self::DEFINITIONS[$normalized]['label'] ?? null) : null;
    }

    /**
     * @return list<array{key: string, slug: string, label: string}>
     */
    public static function options(): array
    {
        $options = [];

        foreach (self::DEFINITIONS as $key => $meta) {
            $options[] = [
                'key' => $key,
                'slug' => $meta['slug'],
                'label' => $meta['label'],
            ];
        }

        return $options;
    }
}
