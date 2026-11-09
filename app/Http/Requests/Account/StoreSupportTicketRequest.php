<?php

namespace App\Http\Requests\Account;

use App\Models\SupportTicket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupportTicketRequest extends FormRequest
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
            'subject' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'min:20', 'max:5000'],
            'priority' => ['required', Rule::in(SupportTicket::PRIORITIES)],
            'attachment' => [
                'nullable',
                'file',
                'max:8192',
                'mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'subject.required' => 'Add a short subject for your ticket.',
            'body.required' => 'Describe what you need help with.',
            'body.min' => 'Please add a bit more detail (at least 20 characters).',
            'priority.required' => 'Choose a priority.',
            'priority.in' => 'Choose a valid priority.',
            'attachment.max' => 'Attachments must be 8 MB or smaller.',
            'attachment.mimes' => 'Upload a JPG, PNG, WebP, GIF, PDF, DOC, or DOCX file.',
        ];
    }
}
