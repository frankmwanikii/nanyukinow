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
        return [
            'channel' => ['required', 'string', Rule::in(CommunicationCampaign::CHANNELS)],
            'audience' => ['required', 'string', Rule::in(CommunicationCampaign::AUDIENCES)],
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
        ];
    }
}
