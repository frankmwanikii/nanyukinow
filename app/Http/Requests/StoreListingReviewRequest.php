<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingReviewRequest extends FormRequest
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
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:10', 'max:2000'],
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
            'body.max' => 'Reviews can be at most 2000 characters.',
        ];
    }
}
