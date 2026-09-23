<?php

namespace App\Models;

use App\Models\SiteSetting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class SitePage extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'path',
        'description',
        'meta_title',
        'meta_description',
        'content',
        'is_published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public static function findBySlug(string $slug): ?self
    {
        static::ensureDefaults();

        return static::query()->where('slug', $slug)->first();
    }

    /**
     * Field schema used by the admin editor for each page.
     *
     * @return list<array{key: string, label: string, type: string, help?: string|null, rows?: int}>
     */
    public function fieldSchema(): array
    {
        return match ($this->slug) {
            'home' => [
                ['key' => 'hero_image', 'label' => 'Hero image URL', 'type' => 'image', 'help' => 'Main homepage hero background.'],
                ['key' => 'hero_headline', 'label' => 'Hero headline', 'type' => 'text'],
                ['key' => 'hero_subtext', 'label' => 'Hero subtext', 'type' => 'textarea', 'rows' => 3],
                ['key' => 'cta_label', 'label' => 'Primary CTA label', 'type' => 'text'],
                ['key' => 'cta_url', 'label' => 'Primary CTA URL', 'type' => 'text'],
                ['key' => 'gold_list_title', 'label' => 'Gold List title', 'type' => 'text'],
                ['key' => 'gold_list_subtitle', 'label' => 'Gold List subtitle', 'type' => 'text'],
                ['key' => 'airbnbs_title', 'label' => 'Airbnbs section title', 'type' => 'text'],
                ['key' => 'airbnbs_subtitle', 'label' => 'Airbnbs section subtitle', 'type' => 'text'],
            ],
            'explore' => [
                ['key' => 'headline', 'label' => 'Page headline', 'type' => 'text'],
                ['key' => 'subtext', 'label' => 'Supporting text', 'type' => 'textarea', 'rows' => 3],
                ['key' => 'empty_title', 'label' => 'Empty results title', 'type' => 'text'],
                ['key' => 'empty_body', 'label' => 'Empty results message', 'type' => 'textarea', 'rows' => 3],
            ],
            'pricing' => [
                ['key' => 'headline', 'label' => 'Page headline', 'type' => 'text'],
                ['key' => 'subtext', 'label' => 'Supporting text', 'type' => 'textarea', 'rows' => 3],
                ['key' => 'instructions', 'label' => 'How upgrades work', 'type' => 'textarea', 'rows' => 4, 'help' => 'Shown on the public pricing page.'],
            ],
            'stories' => [
                ['key' => 'headline', 'label' => 'Page headline', 'type' => 'text'],
                ['key' => 'subtext', 'label' => 'Supporting text', 'type' => 'textarea', 'rows' => 3],
            ],
            'terms', 'privacy' => [
                ['key' => 'hero_title', 'label' => 'Hero title', 'type' => 'text'],
                ['key' => 'hero_subtitle', 'label' => 'Hero subtitle', 'type' => 'textarea', 'rows' => 3],
                ['key' => 'body', 'label' => 'Page body', 'type' => 'textarea', 'rows' => 18, 'help' => 'Full page content. Use blank lines between paragraphs.'],
            ],
            default => [
                ['key' => 'headline', 'label' => 'Headline', 'type' => 'text'],
                ['key' => 'body', 'label' => 'Body', 'type' => 'textarea', 'rows' => 10],
            ],
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'path' => $this->path,
            'description' => $this->description,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'content' => $this->content ?? [],
            'is_published' => $this->is_published,
            'sort_order' => $this->sort_order,
            'fields' => $this->fieldSchema(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'public_url' => url($this->path === '/' ? '/' : ltrim($this->path, '/')),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'meta_title' => $this->meta_title ?: $this->title,
            'meta_description' => $this->meta_description,
            'content' => $this->content ?? [],
            'is_published' => $this->is_published,
        ];
    }

    public static function ensureDefaults(): void
    {
        foreach (static::defaults() as $row) {
            $existing = static::query()->where('slug', $row['slug'])->first();
            if ($existing) {
                continue;
            }

            if ($row['slug'] === 'home') {
                $row['content'] = array_merge($row['content'], [
                    'hero_image' => SiteSetting::getValue('hero_image', $row['content']['hero_image'] ?? ''),
                    'hero_headline' => SiteSetting::getValue('hero_headline', $row['content']['hero_headline'] ?? ''),
                    'hero_subtext' => SiteSetting::getValue('hero_subtext', $row['content']['hero_subtext'] ?? ''),
                    'cta_label' => SiteSetting::getValue('cta_label', $row['content']['cta_label'] ?? ''),
                    'cta_url' => SiteSetting::getValue('cta_url', $row['content']['cta_url'] ?? ''),
                ]);
            }

            if ($row['slug'] === 'pricing') {
                $row['content']['instructions'] = SiteSetting::getValue(
                    'upgrade_instructions',
                    $row['content']['instructions'] ?? '',
                );
            }

            static::query()->create($row);
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function defaults(): array
    {
        return [
            [
                'slug' => 'home',
                'title' => 'Home',
                'path' => '/',
                'description' => 'Homepage hero, CTAs, and featured section copy.',
                'meta_title' => 'Nanyuki Now',
                'meta_description' => 'Discover listings, stays, and stories in Nanyuki.',
                'content' => [
                    'hero_image' => '',
                    'hero_headline' => 'Explore Nanyuki',
                    'hero_subtext' => 'Places, stays, and stories from the highland town.',
                    'cta_label' => 'Explore listings',
                    'cta_url' => '/explore',
                    'gold_list_title' => 'The Nanyuki Gold List',
                    'gold_list_subtitle' => "We've done the groundwork so you don't have to",
                    'airbnbs_title' => 'Highland Airbnbs',
                    'airbnbs_subtitle' => 'Homes with character across Nanyuki, Timau, and Naromoru.',
                ],
                'is_published' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'explore',
                'title' => 'Explore',
                'path' => '/explore',
                'description' => 'Directory search, filters, and empty-state messaging.',
                'meta_title' => 'Explore Nanyuki',
                'meta_description' => 'Browse places to eat, stay, and do in Nanyuki.',
                'content' => [
                    'headline' => 'Explore Nanyuki',
                    'subtext' => 'Find places worth knowing across town and the highlands.',
                    'empty_title' => 'No listings match',
                    'empty_body' => 'Try another category, clear a filter, or search a different keyword.',
                ],
                'is_published' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'pricing',
                'title' => 'Pricing',
                'path' => '/pricing',
                'description' => 'Public membership plans and upgrade messaging.',
                'meta_title' => 'Pricing',
                'meta_description' => 'Membership plans for listing your business on Nanyuki Now.',
                'content' => [
                    'headline' => 'Plans that grow with your business',
                    'subtext' => 'Start free, then upgrade for better placement and more listings.',
                    'instructions' => 'Choose a plan, pick how you want to pay, then submit your payment reference. We activate your plan after verifying payment.',
                ],
                'is_published' => true,
                'sort_order' => 3,
            ],
            [
                'slug' => 'stories',
                'title' => 'Stories',
                'path' => '/stories',
                'description' => 'Stories & travel tips landing page copy.',
                'meta_title' => 'Stories & travel tips',
                'meta_description' => 'Local stories and travel tips from Nanyuki.',
                'content' => [
                    'headline' => 'Stories & travel tips',
                    'subtext' => 'Guides, dispatches, and notes from around Nanyuki.',
                ],
                'is_published' => true,
                'sort_order' => 4,
            ],
            [
                'slug' => 'terms',
                'title' => 'Terms of Service',
                'path' => '/terms',
                'description' => 'Legal terms for using Nanyuki Now.',
                'meta_title' => 'Terms of Service',
                'meta_description' => 'Terms of Service for Nanyuki Now.',
                'content' => [
                    'hero_title' => 'Terms of Service',
                    'hero_subtitle' => 'The agreement between you and Nanyuki Now for using this directory.',
                    'body' => '',
                ],
                'is_published' => true,
                'sort_order' => 5,
            ],
            [
                'slug' => 'privacy',
                'title' => 'Privacy Policy',
                'path' => '/privacy',
                'description' => 'How we collect and use personal information.',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Privacy Policy for Nanyuki Now.',
                'content' => [
                    'hero_title' => 'Privacy Policy',
                    'hero_subtitle' => 'How Nanyuki Now collects, uses, and protects your information.',
                    'body' => '',
                ],
                'is_published' => true,
                'sort_order' => 6,
            ],
        ];
    }

    /**
     * @return Collection<int, self>
     */
    public static function ordered(): Collection
    {
        static::ensureDefaults();

        return static::query()->orderBy('sort_order')->orderBy('id')->get();
    }
}
