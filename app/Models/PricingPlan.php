<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class PricingPlan extends Model
{
    protected $fillable = [
        'key',
        'name',
        'tagline',
        'price_amount',
        'currency',
        'billing_period',
        'price_label',
        'inclusions',
        'cta_label',
        'is_highlighted',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_amount' => 'integer',
            'inclusions' => 'array',
            'is_highlighted' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return list<array{
     *     key: string,
     *     name: string,
     *     tagline: string,
     *     price_amount: int,
     *     currency: string,
     *     billing_period: string,
     *     price_label: ?string,
     *     inclusions: list<string>,
     *     cta_label: string,
     *     is_highlighted: bool,
     *     is_active: bool,
     *     sort_order: int
     * }>
     */
    public static function defaults(): array
    {
        return [
            [
                'key' => 'free',
                'name' => 'Free',
                'tagline' => 'Get listed and start being discovered.',
                'price_amount' => 0,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => 'Free',
                'inclusions' => [
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
            ],
            [
                'key' => 'featured',
                'name' => 'Featured',
                'tagline' => 'Stand out with a mint badge and better placement.',
                'price_amount' => 2500,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => null,
                'inclusions' => [
                    'Everything in Free',
                    'Featured badge on cards',
                    'Priority placement in category feeds',
                    'Photo gallery (up to 8 images)',
                    'Highlighted in “featured” collections',
                    'Basic performance insights',
                ],
                'cta_label' => 'Go Featured',
                'is_highlighted' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'premium',
                'name' => 'Premium',
                'tagline' => 'Maximum visibility with top placement and polish.',
                'price_amount' => 5500,
                'currency' => 'KES',
                'billing_period' => 'month',
                'price_label' => null,
                'inclusions' => [
                    'Everything in Featured',
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
            ],
        ];
    }

    public static function ensureDefaults(): void
    {
        if (static::query()->exists()) {
            return;
        }

        foreach (static::defaults() as $plan) {
            static::query()->create($plan);
        }
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'name' => $this->name,
            'tagline' => $this->tagline,
            'price_amount' => $this->price_amount,
            'currency' => $this->currency,
            'billing_period' => $this->billing_period,
            'price_label' => $this->price_label,
            'inclusions' => array_values($this->inclusions ?? []),
            'cta_label' => $this->cta_label,
            'is_highlighted' => $this->is_highlighted,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    public static function orderedForAdmin(): Collection
    {
        static::ensureDefaults();

        return static::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (self $plan) => $plan->toAdminArray())
            ->values();
    }
}
