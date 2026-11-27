<?php

namespace App\Console\Commands;

use App\Support\MediaDeduplicator;
use Illuminate\Console\Command;

class DeduplicateListingMediaCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'listings:dedupe-media
                            {--dry-run : Report duplicates without rewriting or deleting}';

    /**
     * @var string
     */
    protected $description = 'Collapse identical listing media files onto one path and rewrite DB references';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info(($dryRun ? '[dry-run] ' : '').'Scanning listing media for duplicate content…');

        $result = MediaDeduplicator::collapseDuplicates($dryRun);

        $this->table(
            ['Metric', 'Count'],
            [
                ['Files scanned', $result['scanned']],
                ['Unique images kept', $result['kept']],
                ['Duplicate groups', $result['groups']],
                ['Files removed'.($dryRun ? ' (would)' : ''), $result['files_removed']],
                ['Records rewritten'.($dryRun ? ' (would touch)' : ''), $result['refs_rewritten']],
            ],
        );

        if ($result['groups'] === 0) {
            $this->info('No content duplicates found.');
        } elseif ($dryRun) {
            $this->comment('Dry run only. Re-run without --dry-run to collapse duplicates.');
        } else {
            $this->info('Duplicate media collapsed. Gallery should now show one copy per unique photo.');
        }

        return self::SUCCESS;
    }
}
