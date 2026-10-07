<?php

namespace App\Http\Requests\Admin;

use App\Models\CommunicationCampaign;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBroadcastRequest extends FormRequest
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
        $mode = $this->string('mode')->toString();
        $isDraft = $this->string('intent')->toString() === 'draft';

        return [
            'intent' => ['nullable', 'string', Rule::in(['send', 'draft'])],
            'mode' => ['required', 'string', Rule::in(['audience', 'single'])],
            'channel' => ['required', 'string', Rule::in(CommunicationCampaign::CHANNELS)],
            'audience' => [
                Rule::requiredIf($mode === 'audience'),
                'nullable',
                'string',
                Rule::in(CommunicationCampaign::AUDIENCES),
            ],
            'to_email' => [
                Rule::requiredIf($mode === 'single' && ! $isDraft),
                'nullable',
                'email',
                'max:255',
            ],
            'to_name' => ['nullable', 'string', 'max:120'],
            'subject' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:10000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'subject.required' => 'Add a subject line.',
            'body.required' => 'Write a message before sending.',
            'to_email.required' => 'Choose or enter a recipient.',
        ];
    }
}
