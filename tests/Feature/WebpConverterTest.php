<?php

namespace Tests\Feature;

use App\Support\ListingMedia;
use App\Support\WebpConverter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WebpConverterTest extends TestCase
{
    public function test_listing_media_store_converts_upload_to_webp_and_deletes_original(): void
    {
        Storage::fake('public');

        $url = ListingMedia::store(
            UploadedFile::fake()->image('cover.jpg', 120, 80),
            'listings/covers',
        );

        $this->assertStringEndsWith('.webp', $url);
        $this->assertStringStartsWith('/storage/listings/covers/', $url);

        $relative = str_replace('/storage/', '', $url);
        Storage::disk('public')->assertExists($relative);

        $files = Storage::disk('public')->allFiles('listings/covers');
        $this->assertCount(1, $files);
        $this->assertTrue(str_ends_with($files[0], '.webp'));
    }

    public function test_convert_directory_writes_webp_and_removes_source(): void
    {
        $dir = storage_path('framework/testing/webp-'.uniqid('', true));
        mkdir($dir, 0755, true);

        $source = $dir.'/sample.png';
        $image = imagecreatetruecolor(40, 30);
        imagepng($image, $source);
        imagedestroy($image);

        $stats = WebpConverter::convertDirectory($dir, WebpConverter::QUALITY, true);

        $this->assertSame(1, $stats['converted']);
        $this->assertFileExists($dir.'/sample.webp');
        $this->assertFileDoesNotExist($source);

        foreach (glob($dir.'/*') ?: [] as $file) {
            unlink($file);
        }
        rmdir($dir);
    }

    public function test_already_webp_files_are_left_alone(): void
    {
        Storage::fake('public');

        $url = ListingMedia::store(
            UploadedFile::fake()->image('already.webp', 60, 40),
            'listings/gallery',
        );

        $this->assertStringEndsWith('.webp', $url);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $url));
    }

    public function test_normalize_public_url_rejects_incomplete_and_browser_urls(): void
    {
        $this->assertNull(ListingMedia::normalizePublicUrl(null));
        $this->assertNull(ListingMedia::normalizePublicUrl(''));
        $this->assertNull(ListingMedia::normalizePublicUrl('/storage'));
        $this->assertNull(ListingMedia::normalizePublicUrl('/storage/'));
        $this->assertNull(ListingMedia::normalizePublicUrl('blob:https://example.test/abc'));
        $this->assertNull(ListingMedia::normalizePublicUrl('data:image/png;base64,xxx'));
        $this->assertSame(
            '/storage/listings/logos/a.webp',
            ListingMedia::normalizePublicUrl('/storage/listings/logos/a.webp'),
        );
    }

    public function test_store_rejects_invalid_upload_instead_of_returning_storage_root(): void
    {
        Storage::fake('public');

        $tmp = tempnam(sys_get_temp_dir(), 'badimg');
        $this->assertNotFalse($tmp);
        file_put_contents($tmp, 'not-an-image');

        $file = new UploadedFile(
            $tmp,
            'broken.jpg',
            'image/jpeg',
            UPLOAD_ERR_NO_FILE,
            true,
        );

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('invalid or incomplete');

        try {
            ListingMedia::store($file, 'listings/logos');
        } finally {
            @unlink($tmp);
        }
    }
}
