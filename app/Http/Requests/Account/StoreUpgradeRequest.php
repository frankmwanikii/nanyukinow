<?php

namespace App\Http\Requests\Account;

use App\Support\Membership;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUpgradeRequest extends FormRequest
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
        return [
            'to_plan' => ['required', Rule::in([Membership::STANDARD, Membership::PREMIUM])],
            'payment_reference' => ['required', 'string', 'max:80'],
            'payment_method' => ['nullable', 'string', 'max:40'],
            'member_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
