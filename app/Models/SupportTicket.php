<?php

namespace App\Models;

use Database\Factories\SupportTicketFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicket extends Model
{
    /** @use HasFactory<SupportTicketFactory> */
    use HasFactory;

    public const STATUS_OPEN = 'open';

    public const STATUS_ANSWERED = 'answered';

    public const STATUS_CLOSED = 'closed';

    public const PRIORITY_LOW = 'low';

    public const PRIORITY_NORMAL = 'normal';

    public const PRIORITY_HIGH = 'high';

    public const PRIORITY_URGENT = 'urgent';

    /** @var list<string> */
    public const STATUSES = [
        self::STATUS_OPEN,
        self::STATUS_ANSWERED,
        self::STATUS_CLOSED,
    ];

    /** @var list<string> */
    public const PRIORITIES = [
        self::PRIORITY_LOW,
        self::PRIORITY_NORMAL,
        self::PRIORITY_HIGH,
        self::PRIORITY_URGENT,
    ];

    protected $fillable = [
        'user_id',
        'subject',
        'body',
        'attachment_path',
        'attachment_name',
        'attachment_mime',
        'attachment_size',
        'priority',
        'status',
        'admin_reply',
        'reviewed_by',
        'answered_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'attachment_size' => 'integer',
            'answered_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function hasAttachment(): bool
    {
        return filled($this->attachment_path);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function reference(): string
    {
        return 'TKT-'.str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public static function priorityLabel(string $priority): string
    {
        return match ($priority) {
            self::PRIORITY_LOW => 'Low',
            self::PRIORITY_HIGH => 'High',
            self::PRIORITY_URGENT => 'Urgent',
            default => 'Normal',
        };
    }

    public static function statusLabel(string $status): string
    {
        return match ($status) {
            self::STATUS_ANSWERED => 'Answered',
            self::STATUS_CLOSED => 'Closed',
            default => 'Open',
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function toMemberArray(): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference(),
            'subject' => $this->subject,
            'body' => $this->body,
            'has_attachment' => $this->hasAttachment(),
            'attachment' => $this->hasAttachment() ? [
                'name' => $this->attachment_name,
                'mime' => $this->attachment_mime,
                'size' => $this->attachment_size,
                'url' => route('account.tickets.attachment', $this),
            ] : null,
            'priority' => $this->priority,
            'priority_label' => self::priorityLabel($this->priority),
            'status' => $this->status,
            'status_label' => self::statusLabel($this->status),
            'admin_reply' => $this->admin_reply,
            'answered_at' => $this->answered_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
