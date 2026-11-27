<?php

namespace App\Http\Requests\Account;

use App\Support\CategoryKey;
use App\Support\Membership;
use App\Support\PaymentMethods;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InitiateUpgradePaymentRequest extends FormRequest
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
        $method = $this->input('payment_method');

        return [
            'to_plan' => ['required', Rule::in([Membership::STANDARD, Membership::PREMIUM])],
            'category' => ['nullable', 'string', Rule::in(CategoryKey::keys())],
            'billing_period' => ['nullable', Rule::in(['month', 'year', 'one_time'])],
            'payment_method' => ['required', Rule::in(PaymentMethods::liveKeys())],
            'phone' => [
                Rule::requiredIf(
                    $method === PaymentMethods::MPESA
                    || ($method === PaymentMethods::PAYSTACK
                        && $this->input('paystack_mode', 'mpesa') !== 'card'),
                ),
                'nullable',
                'string',
                'max:32',
            ],
            'email' => [
                Rule::requiredIf(
                    $method === PaymentMethods::PAYPAL
                    && $this->input('paypal_mode', 'wallet') !== 'card',
                ),
                'nullable',
                'email',
                'max:255',
            ],
            'paypal_mode' => ['nullable', Rule::in(['wallet', 'card'])],
            'paystack_mode' => ['nullable', Rule::in(['mpesa', 'card'])],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:8'],
            'return_url' => ['nullable', 'string', 'max:500'],
            'cancel_url' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.required' => 'Enter the phone number to pay from.',
            'email.required' => 'Enter your email address.',
            'email.email' => 'Enter a valid email address.',
            'payment_method.required' => 'Choose a payment method.',
        ];
    }
}
