<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunicationLog extends Model
{
    protected $fillable = [
        'campaign_id',
        'user_id',
        'channel',
        'recipient_email',
        'recipient_name',
        'subject',
        'body',
        'status',
        'starred',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'starred' => 'boolean',
            'sent_at' => 'datetime',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(CommunicationCampaign::class, 'campaign_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
