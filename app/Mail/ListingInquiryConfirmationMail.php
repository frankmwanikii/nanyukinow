<?php

namespace App\Mail;

use App\Models\Listing;
use App\Support\ListingSearch;
use App\Support\MailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ListingInquiryConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Listing $listing,
        public string $senderName,
        public string $senderEmail,
        public ?string $senderPhone,
        public string $messageBody,
    ) {}

    public function envelope(): Envelope
    {
        $brand = MailBranding::context();

        return new Envelope(
            subject: 'We sent your message about '.$this->listing->title,
            replyTo: [
                new Address($brand['contactEmail'], $brand['appName']),
            ],
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::context();

        return new Content(
            html: 'mail.listing-inquiry-confirmation',
            text: 'mail.listing-inquiry-confirmation-text',
            with: [
                ...$brand,
                'listingUrl' => route('listings.show', $this->listing->slug),
                'exploreUrl' => route('explore'),
                'recommended' => $this->recommendedListings(),
            ],
        );
    }

    /**
     * @return list<array{title: string, location: string|null, url: string, image: string|null}>
     */
    private function recommendedListings(): array
    {
        $base = ListingSearch::publishedQuery()
            ->where('id', '!=', $this->listing->id)
            ->whereNotNull('image_url')
            ->where('image_url', '!=', '');

        $sameCategory = (clone $base)
            ->when(
                $this->listing->category_id,
                fn ($query) => $query->where('category_id', $this->listing->category_id),
            )
            ->orderByDesc('is_featured')
            ->orderByDesc('priority')
            ->orderByDesc('rating')
            ->limit(3)
            ->get();

        $recommended = $sameCategory;

        if ($recommended->count() < 3) {
            $extra = (clone $base)
                ->whereNotIn('id', $recommended->pluck('id')->all())
                ->orderByDesc('is_featured')
                ->orderByDesc('is_trending')
                ->orderByDesc('priority')
                ->orderByDesc('rating')
                ->limit(3 - $recommended->count())
                ->get();

            $recommended = $recommended->concat($extra);
        }

        return $recommended
            ->take(3)
            ->map(fn (Listing $item) => [
                'title' => (string) $item->title,
                'location' => $item->location ?: $item->city,
                'url' => route('listings.show', $item->slug),
                'image' => $this->absoluteUrl($item->image_url),
            ])
            ->values()
            ->all();
    }

    private function absoluteUrl(?string $url): ?string
    {
        if (! filled($url)) {
            return null;
        }

        $url = trim((string) $url);
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return rtrim((string) config('app.url'), '/').'/'.ltrim($url, '/');
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
