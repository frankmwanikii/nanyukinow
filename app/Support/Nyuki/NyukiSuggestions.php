<?php

namespace App\Support\Nyuki;

use App\Support\CategoryKey;

class NyukiSuggestions
{
    /**
     * Build short follow-up chips and an optional Explore CTA after a reply.
     *
     * @param  list<array<string, mixed>>  $citations
     * @return array{
     *     follow_ups: list<array{label: string}>,
     *     explore_cta: array{label: string, href: string}|null
     * }
     */
    public function forReply(string $message, array $citations): array
    {
        $categoryKey = $this->dominantCategoryKey($citations);
        $askedDetails = $this->asksDetails($message);
        $firstTitle = trim((string) ($citations[0]['title'] ?? ''));

        $followUps = [];

        if ($firstTitle !== '' && ! $askedDetails) {
            $followUps[] = [
                'label' => $this->shortLabel('Tell me more about '.$firstTitle),
            ];
        }

        foreach ($this->categoryFollowUps($categoryKey, $message) as $label) {
            if (count($followUps) >= 2) {
                break;
            }
            if ($this->alreadyCovered($label, $followUps)) {
                continue;
            }
            $followUps[] = ['label' => $label];
        }

        while (count($followUps) < 2) {
            $fallback = $this->genericFollowUps($message);
            $added = false;
            foreach ($fallback as $label) {
                if ($this->alreadyCovered($label, $followUps)) {
                    continue;
                }
                $followUps[] = ['label' => $label];
                $added = true;
                break;
            }
            if (! $added) {
                break;
            }
        }

        return [
            'follow_ups' => array_slice($followUps, 0, 2),
            'explore_cta' => $this->exploreCta($categoryKey),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $citations
     */
    private function dominantCategoryKey(array $citations): ?string
    {
        $counts = [];

        foreach ($citations as $citation) {
            $key = CategoryKey::resolve(
                (string) ($citation['categoryKey'] ?? $citation['category'] ?? ''),
            );
            if ($key === null) {
                continue;
            }
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }

        if ($counts === []) {
            return null;
        }

        arsort($counts);

        return array_key_first($counts);
    }

    /**
     * @return list<string>
     */
    private function categoryFollowUps(?string $categoryKey, string $message): array
    {
        $lower = mb_strtolower($message);

        return match ($categoryKey) {
            'eatDrink' => array_values(array_filter([
                str_contains($lower, 'lunch') ? null : 'Best for a quick lunch?',
                'Any quiet cafes near town?',
                'Somewhere good for dinner?',
            ])),
            'stay' => [
                'Which ones have a pool?',
                'Quiet places this weekend?',
            ],
            'thingsToDo' => [
                'Outdoor options near town?',
                'Good for a half day?',
            ],
            'events' => [
                "What's on this Saturday?",
                'Any family friendly events?',
            ],
            'shopping' => [
                'Where can I find gifts?',
                'Any markets open today?',
            ],
            'services' => [
                'Who can help with car hire?',
                'Any guides for day trips?',
            ],
            'properties' => [
                'Any rentals near town?',
                'Show me smaller places first.',
            ],
            default => [],
        };
    }

    /**
     * @return list<string>
     */
    private function genericFollowUps(string $message): array
    {
        $lower = mb_strtolower($message);

        return array_values(array_filter([
            str_contains($lower, 'eat') || str_contains($lower, 'lunch') || str_contains($lower, 'dinner')
                ? null
                : 'Where should I eat near town?',
            str_contains($lower, 'stay') || str_contains($lower, 'hotel') || str_contains($lower, 'lodge')
                ? null
                : 'Quiet places to stay this weekend?',
            "What's open in Nanyuki today?",
        ]));
    }

    /**
     * @return array{label: string, href: string}|null
     */
    private function exploreCta(?string $categoryKey): ?array
    {
        if ($categoryKey === null || ! CategoryKey::isValid($categoryKey)) {
            return null;
        }

        $label = CategoryKey::label($categoryKey);
        if ($label === null) {
            return null;
        }

        return [
            'label' => 'Browse '.$label,
            'href' => route('explore', ['category' => $categoryKey], absolute: false),
        ];
    }

    private function asksDetails(string $message): bool
    {
        $lower = mb_strtolower($message);

        return (bool) preg_match(
            '/\b(phone|number|hours|open|contact|address|amenities|details?|tell me more|more about)\b/u',
            $lower,
        );
    }

    /**
     * @param  list<array{label: string}>  $existing
     */
    private function alreadyCovered(string $label, array $existing): bool
    {
        $needle = mb_strtolower($label);
        foreach ($existing as $row) {
            if (mb_strtolower((string) ($row['label'] ?? '')) === $needle) {
                return true;
            }
        }

        return false;
    }

    private function shortLabel(string $label): string
    {
        $label = trim($label);
        if (mb_strlen($label) <= 42) {
            return $label;
        }

        return rtrim(mb_substr($label, 0, 39)).'…';
    }
}
