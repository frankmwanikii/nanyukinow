<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Support\Membership;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'username',
    'email',
    'phone',
    'avatar_url',
    'password',
    'email_verified_at',
    'is_admin',
    'plan',
    'plan_started_at',
    'plan_expires_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'plan_started_at' => 'datetime',
            'plan_expires_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if (! filled($user->plan)) {
                $user->plan = Membership::FREE;
            }
            if ($user->plan_started_at === null) {
                $user->plan_started_at = now();
            }
        });
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    public function bookmarkedListings(): BelongsToMany
    {
        return $this->belongsToMany(Listing::class, 'listing_bookmarks')
            ->withTimestamps()
            ->orderByPivot('created_at', 'desc');
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function planUpgrades(): HasMany
    {
        return $this->hasMany(PlanUpgrade::class);
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function getRouteKeyName(): string
    {
        return 'username';
    }

    public function resolveRouteBinding($value, $field = null): ?static
    {
        $field ??= $this->getRouteKeyName();

        $user = static::query()->where($field, $value)->first();

        if ($user) {
            return $user;
        }

        // Legacy / missing-username URLs: /admin/users/6
        if (ctype_digit((string) $value)) {
            return static::query()->whereKey($value)->first();
        }

        return null;
    }

    public function planIsExpired(): bool
    {
        if ($this->plan_expires_at === null) {
            return false;
        }

        return $this->plan_expires_at->isPast();
    }

    public function effectivePlan(): string
    {
        if ($this->planIsExpired()) {
            return Membership::FREE;
        }

        return Membership::normalize($this->plan);
    }
}
