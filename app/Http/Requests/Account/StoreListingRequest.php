<?php

namespace App\Http\Requests\Account;

use App\Support\Membership;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreListingRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:160'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'location' => ['nullable', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:5000'],
            'phone' => ['nullable', 'string', 'max:40'],
            'whatsapp' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:120'],
            'website' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'tier' => ['required', Rule::in($allowed)],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('tier')) {
            $this->merge(['tier' => $this->user()->effectivePlan()]);
        }
    }
}
