<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PricingPlanUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'tagline' => ['nullable', 'string', 'max:200'],
            'price_amount' => ['required', 'integer', 'min:0', 'max:99999999'],
            'yearly_price_amount' => ['nullable', 'integer', 'min:0', 'max:99999999'],
            'currency' => ['required', 'string', 'max:8'],
            'billing_period' => ['required', Rule::in(['month', 'year', 'one_time'])],
            'price_label' => ['nullable', 'string', 'max:40'],
            'inclusions' => ['required', 'array', 'min:1', 'max:20'],
            'inclusions.*' => ['required', 'string', 'max:160'],
            'cta_label' => ['required', 'string', 'max:60'],
            'is_highlighted' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'listing_limit' => ['required', 'integer', 'min:0', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $inclusions = $this->input('inclusions', []);

        if (is_array($inclusions)) {
            $inclusions = array_values(array_filter(
                array_map(fn ($item) => is_string($item) ? trim($item) : $item, $inclusions),
                fn ($item) => is_string($item) && $item !== '',
            ));
        }

        $this->merge([
            'inclusions' => $inclusions,
            'is_highlighted' => $this->boolean('is_highlighted'),
            'is_active' => $this->boolean('is_active'),
            'price_label' => $this->filled('price_label') ? $this->string('price_label')->toString() : null,
            'tagline' => $this->filled('tagline') ? $this->string('tagline')->toString() : null,
            'yearly_price_amount' => $this->filled('yearly_price_amount')
                ? $this->integer('yearly_price_amount')
                : null,
        ]);
    }
}
