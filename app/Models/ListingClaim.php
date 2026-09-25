<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingClaim extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'listing_id',
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'reason',
        'documents',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function fullName(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        $documents = collect($this->documents ?? [])
            ->filter(fn ($doc) => is_array($doc) && ! empty($doc['url']))
            ->values()
            ->map(fn (array $doc) => [
                'url' => $doc['url'],
                'name' => $doc['name'] ?? basename((string) $doc['url']),
                'mime' => $doc['mime'] ?? null,
                'size' => $doc['size'] ?? null,
            ])
            ->all();

        return [
            'id' => $this->id,
            'listing_id' => $this->listing_id,
            'listing' => $this->listing ? [
                'id' => $this->listing->id,
                'title' => $this->listing->title,
                'slug' => $this->listing->slug,
                'image' => $this->listing->image_url,
                'claim_status' => $this->listing->claim_status,
                'location' => $this->listing->location,
                'user_id' => $this->listing->user_id,
            ] : null,
            'user_id' => $this->user_id,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'username' => $this->user->username,
            ] : null,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->fullName(),
            'email' => $this->email,
            'phone' => $this->phone,
            'reason' => $this->reason,
            'documents' => $documents,
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'reviewed_by' => $this->reviewed_by,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
