<?php

namespace App\Console\Commands;

use App\Models\Listing;
use App\Support\ListingMedia;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class MigrateListingRemoteMediaCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'listings:migrate-remote-media
                            {--dry-run : Report what would change without writing}
                            {--id= : Only migrate one listing id}
                            {--limit=0 : Max listings to process (0 = all)}';

    /**
     * @var string
     */
    protected $description = 'Download remote listing cover/logo/poster/gallery URLs into local /storage/';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = max(0, (int) $this->option('limit'));
        $onlyId = $this->option('id');

        $query = Listing::query()->orderBy('id');
        if (filled($onlyId)) {
            $query->whereKey((int) $onlyId);
        } else {
            $this->constrainToRemoteMedia($query);
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        $listings = $query->get();
        if ($listings->isEmpty()) {
            $this->info('No listings with remote media found.');

            return self::SUCCESS;
        }

        $this->info(($dryRun ? '[dry-run] ' : '').'Processing '.$listings->count().' listing(s)…');

        $totals = [
            'listings_changed' => 0,
            'imported' => 0,
            'failed' => 0,
            'skipped' => 0,
        ];

        foreach ($listings as $listing) {
            if ($dryRun) {
                $remoteCount = $this->countRemoteMedia($listing);
                if ($remoteCount === 0) {
                    $this->line("  #{$listing->id} {$listing->slug}: no remote media");

                    continue;
                }

                $totals['listings_changed']++;
                $totals['imported'] += $remoteCount;
                $this->line("  #{$listing->id} {$listing->slug}: would import {$remoteCount}");

                continue;
            }

            $result = ListingMedia::localizeListingRemoteMedia($listing);

            $totals['imported'] += $result['imported'];
            $totals['failed'] += $result['failed'];
            $totals['skipped'] += $result['skipped'];

            if (! $result['changed']) {
                $this->line("  #{$listing->id} {$listing->slug}: no changes");

                continue;
            }

            $totals['listings_changed']++;
            $this->line(
                "  #{$listing->id} {$listing->slug}: imported {$result['imported']}, failed {$result['failed']}",
            );

            $listing->forceFill([
                'image_url' => $result['image_url'],
                'logo_url' => $result['logo_url'],
                'event_poster_url' => $result['event_poster_url'],
                'gallery' => $result['gallery'],
            ])->save();
        }

        $this->newLine();
        $this->info('Listings updated: '.$totals['listings_changed']);
        $this->line('Images imported: '.$totals['imported']);
        $this->line('Images failed: '.$totals['failed']);
        $this->line('Already local / skipped: '.$totals['skipped']);

        if ($dryRun) {
            $this->comment('Dry run only. Re-run without --dry-run to write changes.');
        }

        return $totals['failed'] > 0 && $totals['imported'] === 0
            ? self::FAILURE
            : self::SUCCESS;
    }

    private function countRemoteMedia(Listing $listing): int
    {
        $count = 0;
        foreach ([$listing->image_url, $listing->logo_url, $listing->event_poster_url] as $url) {
            if (ListingMedia::isRemoteHttpUrl(is_string($url) ? $url : null)) {
                $count++;
            }
        }

        foreach (is_array($listing->gallery) ? $listing->gallery : [] as $entry) {
            $src = null;
            if (is_string($entry)) {
                $src = $entry;
            } elseif (is_array($entry)) {
                if (isset($entry['src']) && is_string($entry['src'])) {
                    $src = $entry['src'];
                } elseif (isset($entry['url']) && is_string($entry['url'])) {
                    $src = $entry['url'];
                }
            }

            if (ListingMedia::isRemoteHttpUrl($src)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * @param  Builder<Listing>  $query
     */
    private function constrainToRemoteMedia(Builder $query): void
    {
        $query->where(function (Builder $outer): void {
            foreach (['image_url', 'logo_url', 'event_poster_url'] as $column) {
                $outer->orWhere(function (Builder $q) use ($column): void {
                    $q->whereNotNull($column)
                        ->where(function (Builder $http) use ($column): void {
                            $http->where($column, 'like', 'http://%')
                                ->orWhere($column, 'like', 'https://%');
                        });
                });
            }

            $outer->orWhere(function (Builder $q): void {
                $q->whereNotNull('gallery')
                    ->where('gallery', '!=', '[]')
                    ->where(function (Builder $http): void {
                        $http->where('gallery', 'like', '%http://%')
                            ->orWhere('gallery', 'like', '%https://%');
                    });
            });
        });
    }
}
