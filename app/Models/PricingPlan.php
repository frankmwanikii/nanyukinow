<?php

namespace App\Models;

use App\Support\CategoryKey;
use App\Support\Membership;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class PricingPlan extends Model
{
    protected $fillable = [
        'key',
        'category_key',
        'name',
        'tagline',
        'price_amount',
        'yearly_price_amount',
        'currency',
        'billing_period',
        'price_label',
        'inclusions',
        'cta_label',
        'is_highlighted',
        'is_active',
        'sort_order',
        'listing_limit',
    ];

    protected function casts(): array
    {
        return [
            'price_amount' => 'integer',
            'yearly_price_amount' => 'integer',
            'inclusions' => 'array',
            'is_highlighted' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'listing_limit' => 'integer',
        ];
    }

    /**
     * Resolve the charge amount for a billing period.
     */
    public function amountForPeriod(?string $period = 'month'): int
    {
        if ($period === 'year') {
            if ($this->yearly_price_amount !== null) {
                return max(0, (int) $this->yearly_price_amount);
            }

            // Fallback: 10 months (≈2 months free) when yearly is unset.
            return max(0, (int) $this->price_amount) * 10;
        }

        return max(0, (int) $this->price_amount);
    }

    /**
     * @param  Builder<PricingPlan>  $query
     * @return Builder<PricingPlan>
     */
    public function scopeForCategory(Builder $query, ?string $categoryKey): Builder
    {
        $normalized = CategoryKey::fromSlug($categoryKey);

        if ($normalized === null) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where('category_key', $normalized);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function defaults(): array
    {
        return [
            [
                'key' => Membership::FREE,
                'name' => 'Free',
                'tagline' => 'One free listing to get discovered in Nanyuki.',
                'price_amount' => 0,
                'yearly_price_amount' => 0,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => 'Free',
                'inclusions' => [
                    '1 free listing',
                    'Basic listing profile',
                    'Appear in search & explore',
                    'Phone, WhatsApp & website links',
                    'One primary photo',
                    'Community reviews',
                ],
                'cta_label' => 'List for free',
                'is_highlighted' => false,
                'is_active' => true,
                'sort_order' => 1,
                'listing_limit' => 1,
            ],
            [
                'key' => Membership::STANDARD,
                'name' => 'Standard',
                'tagline' => 'Featured badge, better placement, and room to grow.',
                'price_amount' => 2500,
                'yearly_price_amount' => 25000,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => null,
                'inclusions' => [
                    'Up to 3 listings',
                    'Everything in Free',
                    'Featured badge on cards',
                    'Priority placement in category feeds',
                    'Photo gallery (up to 8 images)',
                    'Highlighted in featured collections',
                ],
                'cta_label' => 'Go Standard',
                'is_highlighted' => true,
                'is_active' => true,
                'sort_order' => 2,
                'listing_limit' => 3,
            ],
            [
                'key' => Membership::PREMIUM,
                'name' => 'Premium',
                'tagline' => 'Maximum visibility with premium placement and polish.',
                'price_amount' => 5500,
                'yearly_price_amount' => 55000,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => null,
                'inclusions' => [
                    'Up to 10 listings',
                    'Everything in Standard',
                    'Premium badge on cards',
                    'Top-of-feed priority boost',
                    'Extended gallery & rich media',
                    'Homepage & story callouts (when available)',
                    'Priority support for listing updates',
                ],
                'cta_label' => 'Go Premium',
                'is_highlighted' => false,
                'is_active' => true,
                'sort_order' => 3,
                'listing_limit' => 10,
            ],
        ];
    }

    public static function ensureDefaults(): void
    {
        foreach (CategoryKey::keys() as $categoryKey) {
            static::ensureDefaultsForCategory($categoryKey);
        }
    }

    public static function ensureDefaultsForCategory(?string $categoryKey): void
    {
        $normalized = CategoryKey::fromSlug($categoryKey);
        if ($normalized === null) {
            return;
        }

        $existingKeys = static::query()
            ->forCategory($normalized)
            ->pluck('key')
            ->all();

        if (count($existingKeys) >= 3) {
            return;
        }

        $template = static::query()
            ->whereIn('key', [Membership::FREE, Membership::STANDARD, Membership::PREMIUM])
            ->orderBy('id')
            ->get()
            ->groupBy('key');

        foreach (static::defaults() as $plan) {
            if (in_array($plan['key'], $existingKeys, true)) {
                continue;
            }

            $source = $template->get($plan['key'])?->first();
            $payload = $source
                ? [
                    ...$source->only([
                        'name',
                        'tagline',
                        'price_amount',
                        'yearly_price_amount',
                        'currency',
                        'billing_period',
                        'price_label',
                        'inclusions',
                        'cta_label',
                        'is_highlighted',
                        'is_active',
                        'sort_order',
                        'listing_limit',
                    ]),
                    'key' => $plan['key'],
                    'category_key' => $normalized,
                ]
                : [
                    ...$plan,
                    'category_key' => $normalized,
                ];

            static::query()->create($payload);
        }
    }

    public static function findForCategory(string $planKey, ?string $categoryKey): ?self
    {
        $normalized = CategoryKey::fromSlug($categoryKey);
        $planKey = Membership::normalize($planKey);

        if ($normalized !== null) {
            static::ensureDefaultsForCategory($normalized);

            $match = static::query()
                ->forCategory($normalized)
                ->where('key', $planKey)
                ->first();

            if ($match) {
                return $match;
            }
        }

        return static::query()->where('key', $planKey)->orderBy('id')->first();
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'category_key' => $this->category_key,
            'category_label' => CategoryKey::label($this->category_key),
            'name' => $this->name,
            'tagline' => $this->tagline,
            'price_amount' => $this->price_amount,
            'yearly_price_amount' => $this->yearly_price_amount,
            'currency' => $this->currency,
            'billing_period' => $this->billing_period,
            'price_label' => $this->price_label,
            'inclusions' => array_values($this->inclusions ?? []),
            'cta_label' => $this->cta_label,
            'is_highlighted' => $this->is_highlighted,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'listing_limit' => (int) ($this->listing_limit ?: Membership::listingLimit($this->key)),
            'badge_label' => Membership::badgeLabel($this->key),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    public static function orderedForAdmin(?string $categoryKey = null): Collection
    {
        $normalized = CategoryKey::fromSlug($categoryKey);
        if ($normalized === null) {
            return collect();
        }

        static::ensureDefaultsForCategory($normalized);

        return static::query()
            ->forCategory($normalized)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (self $plan) => $plan->toAdminArray())
            ->values();
    }
}
