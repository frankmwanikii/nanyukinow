<?php

namespace App\Models;

use App\Support\Membership;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanUpgrade extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'from_plan',
        'to_plan',
        'amount',
        'currency',
        'billing_period',
        'status',
        'payment_reference',
        'payment_method',
        'member_notes',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'username' => $this->user->username,
            ] : null,
            'from_plan' => $this->from_plan,
            'from_label' => Membership::label($this->from_plan),
            'to_plan' => $this->to_plan,
            'to_label' => Membership::label($this->to_plan),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'billing_period' => $this->billing_period,
            'status' => $this->status,
            'payment_reference' => $this->payment_reference,
            'payment_method' => $this->payment_method,
            'member_notes' => $this->member_notes,
            'admin_notes' => $this->admin_notes,
            'reviewed_by' => $this->reviewed_by,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    public function toMemberArray(): array
    {
        return [
            'id' => $this->id,
            'from_plan' => $this->from_plan,
            'from_label' => Membership::label($this->from_plan),
            'to_plan' => $this->to_plan,
            'to_label' => Membership::label($this->to_plan),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'billing_period' => $this->billing_period,
            'status' => $this->status,
            'payment_reference' => $this->payment_reference,
            'payment_method' => $this->payment_method,
            'member_notes' => $this->member_notes,
            'admin_notes' => $this->status === self::STATUS_REJECTED ? $this->admin_notes : null,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
