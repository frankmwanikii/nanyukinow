<?php

namespace App\Support\Nyuki;

use App\Models\User;
use App\Support\ListingSearch;
use RuntimeException;

class NyukiChat
{
    public function __construct(
        private GeminiClient $gemini,
        private ListingContextBuilder $listings,
        private NyukiSuggestions $suggestions,
    ) {}

    /**
     * @param  list<array{role: string, content: string}>  $history
     * @return array{
     *     reply: string,
     *     citations: list<array<string, mixed>>,
     *     follow_ups: list<array{label: string}>,
     *     explore_cta: array{label: string, href: string}|null,
     *     model: string
     * }
     */
    public function reply(string $message, array $history = [], ?User $user = null): array
    {
        if (! $this->gemini->configured()) {
            throw new RuntimeException(
                'Nyuki is not connected yet. Add a GEMINI_API_KEY in the server environment.',
            );
        }

        $context = $this->listings->build($message, $user);
        $system = $this->systemPrompt($user !== null);

        $turns = [];
        foreach (array_slice($history, -10) as $row) {
            $role = ($row['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
            $text = trim((string) ($row['content'] ?? ''));
            if ($text === '') {
                continue;
            }
            $turns[] = ['role' => $role, 'text' => $text];
        }

        $turns[] = [
            'role' => 'user',
            'text' => $message."\n\n---\n".$context['context_text'],
        ];

        $generated = $this->gemini->generate($system, $turns);
        $rawReply = $generated['text'];
        $citations = $this->filterCited($rawReply, $context['citations']);
        $suggestions = $this->suggestions->forReply($message, $citations);

        return [
            'reply' => $this->plainReply($rawReply),
            'citations' => $citations,
            'follow_ups' => $suggestions['follow_ups'],
            'explore_cta' => $suggestions['explore_cta'],
            'model' => $generated['model'],
        ];
    }

    private function systemPrompt(bool $signedIn): string
    {
        $saved = $signedIn
            ? 'The visitor may be signed in. If they ask about saved or bookmarked places, use any saved listings included in the directory context.'
            : 'The visitor may be a guest. If they ask about saved listings and none appear in context, invite them to sign in and bookmark places.';

        return <<<PROMPT
You are Nyuki, the local guide for Nanyuki Now (nanyukinow.co.ke), a highland town directory covering Nanyuki, Timau, and Naromoru.

Personality: warm, clear, practical, and conversational, like a sharp local friend. Keep answers focused. Prefer short paragraphs and concrete recommendations over fluff.

Formatting (use this exact Markdown subset; the app renders it):
1. Use **double asterisks** for bold on key phrases and listing titles when helpful.
2. Use __double underscores__ for underline on short labels like section titles when useful.
3. Use bullet lists with a leading "- " (hyphen + space) for highlights, amenities, or quick facts. Keep each bullet one short line.
4. Use numbered lists with "1. " when order matters.
5. You may use a short plain section label ending with a colon, for example: Quick highlights:
6. Do not use code fences, raw HTML, or tables.
7. Do not paste /listings/... paths or URLs. The app shows listing cards and turns listing titles into links. Use the exact listing title from the directory.
8. Avoid em dashes. Prefer commas, periods, or colons.

Grounding rules (listings-first):
1. The DIRECTORY CONTEXT is live from the Nanyuki Now database for this request. Treat it as the source of truth.
2. Matching is case-insensitive and partial. If the visitor says "olepangi" and the context has "Olepangi Farm", that is the same place. Prefer the closest title match.
3. Prefer published listings from the DIRECTORY CONTEXT. Never invent a business, event, phone number, price, amenity, or hours that is not in the context.
4. When the visitor asks for details, use the full fields provided (about, hours, contact, amenities, prices, address) and answer specifically.
5. You may add light town or travel context when it helps, but keep recommendations tied to the directory.
6. If the directory context does not cover the ask, say so plainly and suggest browsing Explore or refining the question.
7. When you recommend a place, use its exact title from the directory context.
8. Do not invent discounts, availability, or "open now" unless hours in context support it. If unsure, say to confirm with the listing.

{$saved}

Answer in the same language the visitor uses when clear; otherwise use English.
PROMPT;
    }

    /**
     * Keep renderable Markdown, strip only paths/noise the UI already handles.
     */
    public function plainReply(string $text): string
    {
        $text = str_replace("\r\n", "\n", $text);

        // Listing path leftovers the UI already covers with cards
        $text = preg_replace('/\s*\(\/listings\/[a-z0-9\-]+\/?\)/iu', '', $text) ?? $text;
        $text = preg_replace('/\s*\/listings\/[a-z0-9\-]+\/?/iu', '', $text) ?? $text;

        // Normalize bullet markers the model may emit
        $lines = preg_split("/\n/", $text) ?: [];
        $clean = [];
        foreach ($lines as $line) {
            $line = preg_replace('/^\s*[•]\s+/u', '- ', $line) ?? $line;
            $line = preg_replace('/^\s*\*\s+/u', '- ', $line) ?? $line;
            $line = preg_replace('/^\s*#{4,6}\s+/u', '', $line) ?? $line;
            $clean[] = rtrim($line);
        }

        $text = implode("\n", $clean);
        $text = preg_replace("/\n{3,}/u", "\n\n", $text) ?? $text;

        return trim($text);
    }

    /**
     * @param  list<array<string, mixed>>  $citations
     * @return list<array<string, mixed>>
     */
    private function filterCited(string $reply, array $citations): array
    {
        if ($citations === []) {
            return [];
        }

        $hay = mb_strtolower($reply);
        $hayCompact = ListingSearch::compact($reply);
        $matched = [];

        foreach ($citations as $citation) {
            $slug = mb_strtolower((string) ($citation['slug'] ?? ''));
            $title = mb_strtolower((string) ($citation['title'] ?? ''));
            $href = mb_strtolower((string) ($citation['href'] ?? ''));
            $titleCompact = ListingSearch::compact($title);
            $slugCompact = ListingSearch::compact($slug);

            if (
                ($slug !== '' && str_contains($hay, $slug))
                || ($href !== '' && str_contains($hay, $href))
                || ($title !== '' && str_contains($hay, $title))
                || ($titleCompact !== '' && str_contains($hayCompact, $titleCompact))
                || ($slugCompact !== '' && str_contains($hayCompact, $slugCompact))
            ) {
                $matched[] = $citation;
            }
        }

        return $matched !== [] ? array_values($matched) : array_slice($citations, 0, 4);
    }
}
