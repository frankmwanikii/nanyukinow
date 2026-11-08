<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class WebpConverter
{
    public const QUALITY = 80;

    /**
     * Store an upload as WebP (quality {@see QUALITY}) and remove the original.
     * Already-WebP uploads are kept as-is. Non-convertible files are stored unchanged.
     */
    public static function storeAsWebp(UploadedFile $file, string $folder, string $disk = 'public'): string
    {
        if (! $file->isValid()) {
            throw new \RuntimeException('The uploaded image is invalid or incomplete.');
        }

        $diskInstance = Storage::disk($disk);
        // Keep upload folders writable for the web user (OpenLiteSpeed runs as nobody).
        if (! $diskInstance->exists($folder)) {
            $diskInstance->makeDirectory($folder);
        }
        $absoluteFolder = $diskInstance->path($folder);
        if (is_dir($absoluteFolder) && ! is_writable($absoluteFolder)) {
            @chmod($absoluteFolder, 0775);
        }
        if (! is_writable($absoluteFolder)) {
            throw new \RuntimeException('Image storage folder is not writable.');
        }

        $path = $file->store($folder, $disk);

        // store() returns false on failure when the disk has throw=false; concatenating
        // false into '/storage/' silently produced broken '/storage/' URLs in the DB.
        if (! is_string($path) || $path === '') {
            throw new \RuntimeException('Failed to store the uploaded image.');
        }

        $converted = static::convertStored($path, $disk);
        $relative = is_string($converted) && $converted !== '' ? $converted : $path;

        if ($relative === '') {
            throw new \RuntimeException('Failed to store the uploaded image.');
        }

        return '/storage/'.$relative;
    }

    /**
     * Convert a file already on a Laravel disk to WebP. Deletes the original when conversion
     * succeeds and the extension changes. Returns the new relative path, the same path if
     * already WebP, or null when the file cannot be converted.
     */
    public static function convertStored(string $relativePath, string $disk = 'public', int $quality = self::QUALITY): ?string
    {
        $diskInstance = Storage::disk($disk);

        if (! $diskInstance->exists($relativePath)) {
            return null;
        }

        try {
            $absolute = $diskInstance->path($relativePath);
        } catch (Throwable) {
            return null;
        }

        $convertedAbsolute = static::convertAbsoluteFile($absolute, $quality, deleteOriginal: true);

        if ($convertedAbsolute === null) {
            return null;
        }

        $root = rtrim(str_replace('\\', '/', $diskInstance->path('')), '/').'/';
        $normalized = str_replace('\\', '/', $convertedAbsolute);

        if (! str_starts_with($normalized, $root)) {
            return basename($normalized);
        }

        return ltrim(substr($normalized, strlen($root)), '/');
    }

    /**
     * Convert a real filesystem image to WebP beside the source file.
     * Returns the absolute WebP path, the source path if already WebP, or null on failure.
     */
    public static function convertAbsoluteFile(string $absolutePath, int $quality = self::QUALITY, bool $deleteOriginal = true): ?string
    {
        if (! is_file($absolutePath) || ! function_exists('imagewebp')) {
            return null;
        }

        $extension = Str::lower(pathinfo($absolutePath, PATHINFO_EXTENSION));

        if ($extension === 'webp') {
            return $absolutePath;
        }

        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'wbmp'], true)) {
            return null;
        }

        $image = static::createImageResource($absolutePath, $extension);

        if ($image === false) {
            return null;
        }

        if (function_exists('imagepalettetotruecolor')) {
            imagepalettetotruecolor($image);
        }

        if (function_exists('imagealphablending')) {
            imagealphablending($image, true);
        }

        if (function_exists('imagesavealpha')) {
            imagesavealpha($image, true);
        }

        $target = preg_replace('/\.[^.]+$/', '.webp', $absolutePath) ?: ($absolutePath.'.webp');
        $written = imagewebp($image, $target, $quality);
        imagedestroy($image);

        if (! $written || ! is_file($target)) {
            return null;
        }

        if ($deleteOriginal && $target !== $absolutePath) {
            @unlink($absolutePath);
        }

        return $target;
    }

    /**
     * Convert every convertible image under a directory (recursive).
     *
     * @return array{converted: int, skipped: int, failed: int}
     */
    public static function convertDirectory(string $absoluteDirectory, int $quality = self::QUALITY, bool $deleteOriginal = true): array
    {
        $stats = ['converted' => 0, 'skipped' => 0, 'failed' => 0];

        if (! is_dir($absoluteDirectory)) {
            return $stats;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($absoluteDirectory, \FilesystemIterator::SKIP_DOTS)
        );

        /** @var \SplFileInfo $file */
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $extension = Str::lower($file->getExtension());

            if ($extension === 'webp') {
                $stats['skipped']++;

                continue;
            }

            if (! in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'bmp'], true)) {
                $stats['skipped']++;

                continue;
            }

            $result = static::convertAbsoluteFile($file->getPathname(), $quality, $deleteOriginal);

            if ($result === null) {
                $stats['failed']++;

                continue;
            }

            $stats['converted']++;
        }

        return $stats;
    }

    /**
     * @return \GdImage|false
     */
    private static function createImageResource(string $absolutePath, string $extension): mixed
    {
        return match ($extension) {
            'jpg', 'jpeg' => @imagecreatefromjpeg($absolutePath),
            'png' => @imagecreatefrompng($absolutePath),
            'gif' => @imagecreatefromgif($absolutePath),
            'bmp', 'wbmp' => function_exists('imagecreatefrombmp')
                ? @imagecreatefrombmp($absolutePath)
                : false,
            default => false,
        };
    }
}
