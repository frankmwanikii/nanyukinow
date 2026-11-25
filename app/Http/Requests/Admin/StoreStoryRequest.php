<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('stories', 'slug')],
            'story_category_id' => [
                Rule::requiredIf(fn () => $this->boolean('is_published')),
                'nullable',
                'integer',
                'exists:story_categories,id',
            ],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'author' => ['nullable', 'string', 'max:120'],
            'read_minutes' => ['nullable', 'integer', 'min:1', 'max:120'],
            'body' => ['nullable', 'string'],
            'sections' => ['nullable', 'array'],
            'sections.*.id' => ['nullable', 'string', 'max:120'],
            'sections.*.title' => ['nullable', 'string', 'max:255'],
            'sections.*.paragraphs' => ['nullable', 'array'],
            'sections.*.paragraphs.*' => ['nullable', 'string'],
            'sections.*.list' => ['nullable', 'array'],
            'sections.*.list.*.title' => ['nullable', 'string', 'max:255'],
            'sections.*.list.*.text' => ['nullable', 'string'],
            'sections.*.image' => ['nullable', 'string', 'max:2048'],
            'sections.*.imageAlt' => ['nullable', 'string', 'max:255'],
            'pro_tip' => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'is_featured' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
