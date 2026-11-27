<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\SitePage;
use App\Models\Story;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    /**
     * Public XML sitemap of indexable pages only (no auth, admin, or draft URLs).
     */
    public function __invoke(): Response
    {
        $xml = Cache::remember('sitemap.xml', now()->addHour(), function (): string {
            return view('sitemap', [
                'urls' => $this->urls(),
            ])->render();
        });

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * @return list<array{loc: string, lastmod: ?string}>
     */
    private function urls(): array
    {
        $urls = [];

        foreach ($this->staticPages() as $page) {
            $urls[] = $page;
        }

        Listing::query()
            ->published()
            ->orderBy('id')
            ->get(['slug', 'updated_at', 'published_at'])
            ->each(function (Listing $listing) use (&$urls): void {
                $urls[] = [
                    'loc' => route('listings.show', $listing->slug),
                    'lastmod' => $this->formatLastmod($listing->updated_at ?? $listing->published_at),
                ];
            });

        Story::query()
            ->published()
            ->orderBy('id')
            ->get(['slug', 'updated_at', 'published_at'])
            ->each(function (Story $story) use (&$urls): void {
                $urls[] = [
                    'loc' => route('stories.show', $story->slug),
                    'lastmod' => $this->formatLastmod($story->updated_at ?? $story->published_at),
                ];
            });

        return $urls;
    }

    /**
     * @return list<array{loc: string, lastmod: ?string}>
     */
    private function staticPages(): array
    {
        $slugs = [
            'home' => 'home',
            'explore' => 'explore',
            'pricing' => 'pricing',
            'stories' => 'stories.index',
            'terms' => 'terms',
            'privacy' => 'privacy',
        ];

        $pages = SitePage::query()
            ->whereIn('slug', array_keys($slugs))
            ->get(['slug', 'updated_at'])
            ->keyBy('slug');

        $urls = [];

        foreach ($slugs as $slug => $routeName) {
            $urls[] = [
                'loc' => route($routeName),
                'lastmod' => $this->formatLastmod($pages->get($slug)?->updated_at),
            ];
        }

        return $urls;
    }

    private function formatLastmod(mixed $value): ?string
    {
        if ($value instanceof Carbon) {
            return $value->toAtomString();
        }

        if (is_string($value) && $value !== '') {
            return Carbon::parse($value)->toAtomString();
        }

        return null;
    }
}
