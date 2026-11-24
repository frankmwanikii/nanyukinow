<?php

namespace App\Support;

use App\Models\SiteSetting;
use Illuminate\Support\Str;

class HeroSlides
{
    public const SETTING_KEY = 'hero_slides';

    public const MAX_SLIDES = 8;

    /**
     * @return list<array{id: string, image: string, imageMobile: ?string, alt: string, title: string, credit: string}>
     */
    public static function defaults(): array
    {
        return [
            [
                'id' => 'brand',
                'image' => '/images/hero/slide_1.webp',
                'imageMobile' => '/images/hero/slide_1_mobile.webp',
                'alt' => 'Mount Kenya, wildlife, and town life around Nanyuki',
                'title' => 'Nanyuki Now',
                'credit' => 'Mount Kenya, wildlife, and town life',
            ],
            [
                'id' => 'wildlife',
                'image' => '/images/hero/slide-2.webp',
                'imageMobile' => '/images/hero/slide_2_mobile.webp',
                'alt' => 'Black rhinos on the Laikipia plains near Nanyuki',
                'title' => "Discover Nanyuki's wild side",
                'credit' => 'Black rhinos on the Laikipia plains',
            ],
            [
                'id' => 'cabin',
                'image' => '/images/hero/slide-3.webp',
                'imageMobile' => null,
                'alt' => 'A-frame cabin stay in Nanyuki at dusk',
                'title' => 'Unwind in the heart of Nanyuki',
                'credit' => 'Stay. Relax. Explore',
            ],
            [
                'id' => 'stay',
                'image' => '/images/hero/bnb3.webp',
                'imageMobile' => null,
                'alt' => 'Warm stone-walled stay interior in Nanyuki',
                'title' => 'Your home away from home',
                'credit' => 'Stone-walled guest stays in town',
            ],
            [
                'id' => 'dining',
                'image' => '/images/hero/slide_4.webp',
                'imageMobile' => null,
                'alt' => 'Dining with a view of Mount Kenya at dusk',
                'title' => "Nanyuki's finest flavors",
                'credit' => 'Dining with a Mount Kenya view',
            ],
        ];
    }

    /**
     * Ensure the hero_slides setting row exists (seeded with defaults).
     */
    public static function ensureSetting(): SiteSetting
    {
        $setting = SiteSetting::query()->firstOrCreate(
            ['key' => self::SETTING_KEY],
            [
                'group' => 'branding',
                'label' => 'Homepage hero slides',
                'type' => 'json',
                'value' => json_encode(self::defaults(), JSON_UNESCAPED_SLASHES),
                'help' => 'Ordered slides for the homepage hero slider.',
                'sort_order' => 20,
            ],
        );

        if (! filled($setting->value)) {
            $setting->update([
                'value' => json_encode(self::defaults(), JSON_UNESCAPED_SLASHES),
            ]);
            $setting->refresh();
        }

        return $setting;
    }

    /**
     * Public slides for the homepage (falls back to built-in defaults).
     *
     * @return list<array{id: string, image: string, imageMobile: ?string, alt: string, title: string, credit: string}>
     */
    public static function forHome(): array
    {
        self::ensureSetting();

        $raw = SiteSetting::getValue(self::SETTING_KEY);
        $slides = self::normalize(self::decode($raw));

        return $slides !== [] ? $slides : self::defaults();
    }

    /**
     * Persist a validated slide list.
     *
     * @param  list<array<string, mixed>>  $slides
     * @return list<array{id: string, image: string, imageMobile: ?string, alt: string, title: string, credit: string}>
     */
    public static function save(array $slides): array
    {
        $normalized = self::normalize($slides);
        if ($normalized === []) {
            $normalized = self::defaults();
        }

        $setting = self::ensureSetting();
        $setting->update([
            'value' => json_encode(array_values($normalized), JSON_UNESCAPED_SLASHES),
        ]);
        SiteSetting::forgetCache();

        return $normalized;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function decode(mixed $raw): array
    {
        if (is_array($raw)) {
            return array_values($raw);
        }

        if (! is_string($raw) || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? array_values($decoded) : [];
    }

    /**
     * @param  list<array<string, mixed>>  $slides
     * @return list<array{id: string, image: string, imageMobile: ?string, alt: string, title: string, credit: string}>
     */
    public static function normalize(array $slides): array
    {
        $out = [];

        foreach (array_slice(array_values($slides), 0, self::MAX_SLIDES) as $index => $slide) {
            if (! is_array($slide)) {
                continue;
            }

            $image = ListingMedia::normalizePublicUrl(
                isset($slide['image']) ? (string) $slide['image'] : null,
            );
            if ($image === null) {
                continue;
            }

            $imageMobile = ListingMedia::normalizePublicUrl(
                isset($slide['imageMobile']) ? (string) $slide['imageMobile'] : null,
            );

            $id = trim((string) ($slide['id'] ?? ''));
            if ($id === '') {
                $id = 'slide-'.($index + 1).'-'.Str::lower(Str::random(6));
            }

            $title = trim((string) ($slide['title'] ?? ''));
            $credit = trim((string) ($slide['credit'] ?? ''));
            $alt = trim((string) ($slide['alt'] ?? ''));
            if ($alt === '') {
                $alt = $title !== '' ? $title : 'Homepage hero photo';
            }

            $out[] = [
                'id' => Str::limit($id, 64, ''),
                'image' => $image,
                'imageMobile' => $imageMobile,
                'alt' => Str::limit($alt, 255, ''),
                'title' => Str::limit($title, 120, ''),
                'credit' => Str::limit($credit, 160, ''),
            ];
        }

        return $out;
    }
}
