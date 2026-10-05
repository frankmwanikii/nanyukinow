<?php

namespace App\Console\Commands;

use App\Support\WebpConverter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ConvertImagesToWebpCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'images:to-webp
                            {path? : Absolute or project-relative directory/file (default: storage/app/public)}
                            {--quality=80 : WebP quality 0-100}
                            {--keep-original : Keep source files after conversion}';

    /**
     * @var string
     */
    protected $description = 'Convert images to WebP (default quality 80) and delete the originals';

    public function handle(): int
    {
        if (! function_exists('imagewebp')) {
            $this->error('PHP GD WebP support is required (imagewebp).');

            return self::FAILURE;
        }

        $quality = max(0, min(100, (int) $this->option('quality')));
        $deleteOriginal = ! $this->option('keep-original');
        $input = $this->argument('path');

        $target = $input === null
            ? Storage::disk('public')->path('')
            : $this->resolvePath((string) $input);

        if (! file_exists($target)) {
            $this->error("Path not found: {$target}");

            return self::FAILURE;
        }

        $this->info("Converting to WebP at quality {$quality}".($deleteOriginal ? ' (deleting originals)' : ' (keeping originals)'));
        $this->line("Target: {$target}");

        if (is_file($target)) {
            $result = WebpConverter::convertAbsoluteFile($target, $quality, $deleteOriginal);

            if ($result === null) {
                $this->error('Conversion failed.');

                return self::FAILURE;
            }

            $this->info("Wrote {$result}");

            return self::SUCCESS;
        }

        $stats = WebpConverter::convertDirectory($target, $quality, $deleteOriginal);

        $this->newLine();
        $this->info("Converted: {$stats['converted']}");
        $this->line("Skipped: {$stats['skipped']}");
        $this->line("Failed: {$stats['failed']}");

        return $stats['failed'] > 0 && $stats['converted'] === 0
            ? self::FAILURE
            : self::SUCCESS;
    }

    private function resolvePath(string $path): string
    {
        if (str_starts_with($path, '/') || preg_match('/^[A-Za-z]:[\\\\\\/]/', $path) === 1) {
            return $path;
        }

        return base_path($path);
    }
}
