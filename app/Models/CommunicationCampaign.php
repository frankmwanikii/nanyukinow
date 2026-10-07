<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunicationCampaign extends Model
{
    public const CHANNEL_EMAIL = 'email';

    public const CHANNEL_SMS = 'sms';

    public const AUDIENCE_ALL_MEMBERS = 'all_members';

    public const AUDIENCE_NEWSLETTER = 'newsletter';

    public const AUDIENCE_PLAN_FREE = 'plan_free';

    public const AUDIENCE_PLAN_STANDARD = 'plan_featured';

    public const AUDIENCE_PLAN_PREMIUM = 'plan_premium';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    public const STATUS_PARTIAL = 'partial';

    /** @var list<string> */
    public const CHANNELS = [
        self::CHANNEL_EMAIL,
        self::CHANNEL_SMS,
    ];

    /** @var list<string> */
    public const AUDIENCES = [
        self::AUDIENCE_ALL_MEMBERS,
        self::AUDIENCE_NEWSLETTER,
        self::AUDIENCE_PLAN_FREE,
        self::AUDIENCE_PLAN_STANDARD,
        self::AUDIENCE_PLAN_PREMIUM,
    ];

    protected $fillable = [
        'user_id',
        'channel',
        'audience',
        'subject',
        'body',
        'status',
        'recipient_count',
        'sent_count',
        'failed_count',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'recipient_count' => 'integer',
            'sent_count' => 'integer',
            'failed_count' => 'integer',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function audienceLabel(): string
    {
        return match ($this->audience) {
            self::AUDIENCE_ALL_MEMBERS => 'All members',
            self::AUDIENCE_NEWSLETTER => 'Newsletter subscribers',
            self::AUDIENCE_PLAN_FREE => 'Free plan',
            self::AUDIENCE_PLAN_STANDARD => 'Standard plan',
            self::AUDIENCE_PLAN_PREMIUM => 'Premium plan',
            default => $this->audience,
        };
    }
}
