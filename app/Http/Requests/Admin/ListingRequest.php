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
            'image_url', 'logo_url', 'slug', 'tagline', 'price_range',
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

        $this->merge($merge);
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
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
            'status' => ['required', Rule::in(['draft', 'pending', 'published', 'expired', 'archived'])],
            'tier' => ['required', Rule::in(['free', 'featured', 'premium'])],
            'priority' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'views_count' => ['nullable', 'integer', 'min:0'],
            'price_range' => ['nullable', 'string', 'max:50'],
            'gallery' => ['nullable'],
            'hours' => ['nullable'],
            'amenities' => ['nullable'],
            'social_links' => ['nullable'],
            'expires_at' => ['nullable', 'date'],
            'published_at' => ['nullable', 'date'],
            'claim_status' => ['required', Rule::in(['unclaimed', 'pending', 'claimed'])],
            'is_featured' => ['boolean'],
            'is_trending' => ['boolean'],
            'is_published' => ['boolean'],
        ];
    }
}
