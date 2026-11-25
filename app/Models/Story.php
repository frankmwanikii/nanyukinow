<?php

namespace App\Models;

use App\Support\SafeHtml;
use Database\Factories\StoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Story extends Model
{
    /** @use HasFactory<StoryFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'subtitle',
        'slug',
        'story_category_id',
        'category',
        'excerpt',
        'image_url',
        'author',
        'read_minutes',
        'body',
        'sections',
        'pro_tip',
        'is_published',
        'is_featured',
        'views',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'sections' => 'array',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'views' => 'integer',
            'published_at' => 'datetime',
            'read_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function storyCategory(): BelongsTo
    {
        return $this->belongsTo(StoryCategory::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Normalize body to HTML for storage (plain paragraphs become <p> tags).
     */
    public static function normalizeBodyHtml(?string $body): ?string
    {
        $body = is_string($body) ? trim($body) : '';
        if ($body === '') {
            return null;
        }

        if (! preg_match('/<[a-z][\s\S]*>/i', $body)) {
            $paragraphs = preg_split("/\n\s*\n/", str_replace("\r\n", "\n", $body)) ?: [];
            $html = collect($paragraphs)
                ->map(static fn (string $part): string => trim($part))
                ->filter()
                ->map(static fn (string $part): string => '<p>'.e($part).'</p>')
                ->implode('');

            return $html !== '' ? SafeHtml::sanitizeStory($html) : null;
        }

        $clean = SafeHtml::sanitizeStory($body);

        return $clean !== '' ? $clean : null;
    }

    /**
     * HTML ready for public render.
     */
    public function bodyHtml(): string
    {
        return self::normalizeBodyHtml($this->body) ?? '';
    }

    /**
     * Plain-text paragraphs for search / legacy consumers.
     *
     * @return list<string>
     */
    public function bodyParagraphs(): array
    {
        $plain = SafeHtml::toPlainText($this->bodyHtml());
        if ($plain === '') {
            return [];
        }

        $parts = preg_split("/\n\s*\n/", $plain) ?: [];

        return array_values(array_filter(
            array_map(static fn (string $part): string => trim($part), $parts),
            static fn (string $part): bool => $part !== '',
        ));
    }

    public function recordView(): void
    {
        $this->increment('views');
        $this->refresh();
    }

    /**
     * @return array{prev: ?array<string, mixed>, next: ?array<string, mixed>}
     */
    public function adjacent(): array
    {
        $prev = static::query()
            ->published()
            ->with('storyCategory')
            ->where('published_at', '<', $this->published_at)
            ->orderByDesc('published_at')
            ->first();

        $next = static::query()
            ->published()
            ->with('storyCategory')
            ->where('published_at', '>', $this->published_at)
            ->orderBy('published_at')
            ->first();

        return [
            'prev' => $prev?->toPublicArray(),
            'next' => $next?->toPublicArray(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function popular(int $limit = 5, ?int $excludeId = null): array
    {
        return static::query()
            ->published()
            ->with('storyCategory')
            ->when($excludeId, fn ($q) => $q->whereKeyNot($excludeId))
            ->orderByDesc('is_featured')
            ->orderByDesc('views')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get()
            ->map(fn (Story $story) => $story->toPublicArray())
            ->values()
            ->all();
    }

    /**
     * @return array{
     *     id: int,
     *     slug: string,
     *     title: string,
     *     subtitle: string|null,
     *     category: string|null,
     *     categorySlug: string|null,
     *     excerpt: string|null,
     *     image: string|null,
     *     author: string|null,
     *     publishedAt: string|null,
     *     readMinutes: int,
     *     views: int,
     *     body: list<string>,
     *     bodyHtml: string,
     *     sections: list<array<string, mixed>>,
     *     proTip: string|null,
     *     isFeatured: bool
     * }
     */
    public function toPublicArray(): array
    {
        $categoryName = $this->storyCategory?->name ?? $this->category;
        $categorySlug = $this->storyCategory?->slug;
        $bodyHtml = $this->bodyHtml();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'category' => $categoryName,
            'categorySlug' => $categorySlug,
            'excerpt' => $this->excerpt,
            'image' => $this->image_url,
            'author' => $this->author,
            'publishedAt' => $this->published_at?->toDateString(),
            'readMinutes' => $this->read_minutes ?? 5,
            'views' => (int) ($this->views ?? 0),
            'body' => $this->bodyParagraphs(),
            'bodyHtml' => $bodyHtml,
            'sections' => is_array($this->sections) ? array_values($this->sections) : [],
            'proTip' => $this->pro_tip,
            'isFeatured' => (bool) $this->is_featured,
        ];
    }
}
