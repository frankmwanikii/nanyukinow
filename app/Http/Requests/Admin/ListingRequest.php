<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    protected function prepareForValidation(): void
    {
        $nullable = [
            'category_id', 'website', 'email', 'phone', 'whatsapp',
            'latitude', 'longitude', 'rating', 'expires_at', 'published_at',
            'image_url', 'logo_url', 'event_poster_url', 'slug', 'tagline', 'price_range',
            'subcategory', 'property_type', 'venue', 'city', 'address',
            'start_at', 'end_at', 'ticket_price', 'early_bird_price', 'gate_price', 'ticket_url',
        ];

        $merge = [];
        foreach ($nullable as $key) {
            if ($this->has($key) && ($this->input($key) === '' || $this->input($key) === null)) {
                $merge[$key] = null;
            }
        }

        if ($this->has('user_id') && ($this->input('user_id') === '' || $this->input('user_id') === null)) {
            $merge['user_id'] = null;
        }

        // Decode JSON fields from the form
        $merge['amenities'] = $this->decodeArrayField('amenities');
        $merge['hours'] = $this->decodeArrayField('hours');
        $merge['social_links'] = $this->decodeArrayField('social_links');
        $merge['details'] = $this->decodeArrayField('details');
        $merge['gallery_urls'] = $this->decodeArrayField('gallery_urls');

        $this->merge($merge);
    }

    /**
     * @return list<mixed>|array<string, mixed>|null
     */
    private function decodeArrayField(string $key): ?array
    {
        $value = $this->input($key);

        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);

            return is_array($decoded) ? $decoded : null;
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $listingId = $this->route('listing')?->id;

        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('listings', 'slug')->ignore($listingId)],
            'subcategory' => ['nullable', 'string', 'max:120'],
            'property_type' => ['nullable', 'string', 'max:80'],
            'location' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:50000'],
            'phone' => ['nullable', 'string', 'max:50'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'venue' => ['nullable', 'string', 'max:180'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'price_range' => ['nullable', 'string', 'max:50'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'event_poster_url' => ['nullable', 'string', 'max:2048'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'event_poster' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'gallery_files' => ['nullable', 'array', 'max:20'],
            'gallery_files.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'gallery_urls' => ['nullable', 'array', 'max:20'],
            'gallery_urls.*' => ['nullable', 'string', 'max:500'],
            'amenities' => ['nullable', 'array', 'max:40'],
            'amenities.*' => ['string', 'max:80'],
            'hours' => ['nullable', 'array'],
            'hours.*.day' => ['nullable', 'string', 'max:20'],
            'hours.*.open' => ['nullable', 'string', 'max:10'],
            'hours.*.close' => ['nullable', 'string', 'max:10'],
            'hours.*.closed' => ['nullable', 'boolean'],
            'social_links' => ['nullable', 'array'],
            'social_links.instagram' => ['nullable', 'string', 'max:255'],
            'social_links.facebook' => ['nullable', 'string', 'max:255'],
            'social_links.tiktok' => ['nullable', 'string', 'max:255'],
            'social_links.youtube' => ['nullable', 'string', 'max:255'],
            'social_links.links' => ['nullable', 'array', 'max:12'],
            'social_links.links.*.label' => ['nullable', 'string', 'max:80'],
            'social_links.links.*.url' => ['nullable', 'string', 'max:500'],
            'details' => ['nullable', 'array'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'ticket_price' => ['nullable', 'string', 'max:120'],
            'early_bird_price' => ['nullable', 'string', 'max:120'],
            'gate_price' => ['nullable', 'string', 'max:120'],
            'ticket_url' => ['nullable', 'string', 'max:500'],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
            'status' => ['required', Rule::in(['draft', 'pending', 'published', 'expired', 'archived'])],
            'tier' => ['required', Rule::in(['free', 'featured', 'premium'])],
            'priority' => ['nullable', 'integer', Rule::in([0, 1, 3, 4])],
            'views_count' => ['nullable', 'integer', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'published_at' => ['nullable', 'date'],
            'claim_status' => ['required', Rule::in(['unclaimed', 'pending', 'claimed'])],
            'is_featured' => ['boolean'],
            'is_trending' => ['boolean'],
            'is_published' => ['boolean'],
        ];
    }
}
