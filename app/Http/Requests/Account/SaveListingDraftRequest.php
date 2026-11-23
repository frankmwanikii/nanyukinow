<?php

namespace App\Http\Requests\Account;

use App\Support\ListingSubcategories;
use App\Support\Membership;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveListingDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $allowed = Membership::allowedTiers($this->user()->effectivePlan());

        return [
            'title' => ['nullable', 'string', 'max:160'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'subcategory' => ['nullable', 'array', 'max:20'],
            'subcategory.*' => ['string', 'max:120'],
            'property_type' => ['nullable', 'string', 'max:80'],
            'location' => ['nullable', 'string', 'max:180'],
            'city' => ['nullable', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:50000'],
            'phone' => ['nullable', 'string', 'max:40'],
            'whatsapp' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:120'],
            'website' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'venue' => ['nullable', 'string', 'max:180'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'price_range' => ['nullable', 'string', 'max:40'],
            'image_url' => ['nullable', 'string', 'max:8192'],
            'logo_url' => ['nullable', 'string', 'max:8192'],
            'event_poster_url' => ['nullable', 'string', 'max:8192'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'event_poster' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'gallery_files' => ['nullable', 'array', 'max:300'],
            'gallery_files.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'gallery_urls' => ['nullable', 'array', 'max:300'],
            'gallery_urls.*' => ['nullable'],
            'gallery_file_meta' => ['nullable', 'array', 'max:300'],
            'gallery_file_meta.*.kind' => ['nullable', 'string', 'max:60'],
            'gallery_file_meta.*.label' => ['nullable', 'string', 'max:120'],
            'amenities' => ['nullable', 'array', 'max:40'],
            'amenities.*' => ['string', 'max:80'],
            'hours' => ['nullable', 'array'],
            'social_links' => ['nullable', 'array'],
            'details' => ['nullable', 'array'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date'],
            'ticket_options' => ['nullable', 'array', 'max:40'],
            'ticket_options.*.name' => ['nullable', 'string', 'max:120'],
            'ticket_options.*.amount' => ['nullable', 'integer', 'min:0', 'max:999999999'],
            'ticket_price' => ['nullable', 'string', 'max:120'],
            'early_bird_price' => ['nullable', 'string', 'max:120'],
            'gate_price' => ['nullable', 'string', 'max:120'],
            'ticket_url' => ['nullable', 'string', 'max:500'],
            'tier' => ['nullable', Rule::in($allowed)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [
            'amenities' => $this->decodeArrayField('amenities'),
            'hours' => $this->decodeArrayField('hours'),
            'social_links' => $this->decodeArrayField('social_links'),
            'details' => $this->decodeArrayField('details'),
            'ticket_options' => $this->decodeArrayField('ticket_options'),
            'gallery_urls' => $this->decodeArrayField('gallery_urls'),
            'gallery_file_meta' => $this->decodeArrayField('gallery_file_meta'),
            'subcategory' => $this->decodeSubcategoryField(),
            'location' => $this->normalizeLocationField(),
            'address' => $this->normalizeAddressField(),
        ];

        foreach (['start_at', 'end_at'] as $dateField) {
            if ($this->input($dateField) === '') {
                $merge[$dateField] = null;
            }
        }

        $this->merge($merge);
    }

    private function normalizeLocationField(): ?string
    {
        $value = $this->input('location');

        if (is_array($value)) {
            $parts = array_values(array_filter(array_map(
                fn ($part) => is_string($part) ? trim($part) : '',
                $value,
            )));

            return $parts === [] ? null : implode(', ', $parts);
        }

        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : Str::limit($trimmed, 180, '');
    }

    private function normalizeAddressField(): ?string
    {
        $value = $this->input('address');

        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : Str::limit($trimmed, 255, '');
    }

    /**
     * @return list<string>|null
     */
    private function decodeSubcategoryField(): ?array
    {
        $normalized = ListingSubcategories::normalize($this->input('subcategory'));

        return $normalized === [] ? null : $normalized;
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
}
