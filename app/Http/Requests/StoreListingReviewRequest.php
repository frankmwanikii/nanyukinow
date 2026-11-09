<?php

namespace App\Http\Requests;

use App\Support\ListingTierSupport;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreListingReviewRequest extends FormRequest
{
    public const MAX_WORDS = 400;

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
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:10', 'max:20000'],
        ];
    }

    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('body')) {
                    return;
                }

                $words = ListingTierSupport::wordCount((string) $this->input('body'));

                if ($words > self::MAX_WORDS) {
                    $validator->errors()->add(
                        'body',
                        'Reviews can be at most '.self::MAX_WORDS.' words.',
                    );
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rating.required' => 'Please choose a star rating.',
            'rating.min' => 'Please choose a star rating.',
            'rating.max' => 'Please choose a star rating.',
            'body.required' => 'Please write a short review.',
            'body.min' => 'Please write at least 10 characters.',
        ];
    }
}
