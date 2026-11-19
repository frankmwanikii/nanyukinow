<?php

namespace Tests\Feature;

use App\Support\ListingMedia;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ListingMediaEventPosterTest extends TestCase
{
    #[Test]
    public function sync_prefers_poster_as_cover(): void
    {
        [$image, $poster] = ListingMedia::syncEventCoverAndPoster(
            '/storage/listings/covers/a.jpg',
            '/storage/listings/posters/b.jpg',
        );

        $this->assertSame('/storage/listings/posters/b.jpg', $image);
        $this->assertSame('/storage/listings/posters/b.jpg', $poster);
    }

    #[Test]
    public function sync_copies_cover_to_poster_when_poster_missing(): void
    {
        [$image, $poster] = ListingMedia::syncEventCoverAndPoster(
            '/storage/listings/covers/a.jpg',
            null,
        );

        $this->assertSame('/storage/listings/covers/a.jpg', $image);
        $this->assertSame('/storage/listings/covers/a.jpg', $poster);
    }

    #[Test]
    public function sync_returns_nulls_when_both_missing(): void
    {
        [$image, $poster] = ListingMedia::syncEventCoverAndPoster(null, null);

        $this->assertNull($image);
        $this->assertNull($poster);
    }
}
