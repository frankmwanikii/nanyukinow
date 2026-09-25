<?php

namespace App\Http\Requests\Account;

use App\Support\Membership;
use App\Support\PaymentMethods;
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
            'billing_period' => ['nullable', Rule::in(['month', 'year', 'one_time'])],
            'payment_method' => ['required', Rule::in(PaymentMethods::keys())],
            'payment_reference' => ['required', 'string', 'max:120'],
            'member_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'payment_method.required' => 'Choose how you paid.',
            'payment_reference.required' => 'Enter your payment confirmation / transaction ID.',
        ];
    }
}
