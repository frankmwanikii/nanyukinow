<?php

namespace App\Support;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ListingEditLock
{
    public const TTL_SECONDS = 90;

    public static function cacheKey(int $listingId): string
    {
        return "listing-edit-lock:{$listingId}";
    }

    /**
     * @return array{user_id: int, name: string, token: string, acquired_at: string}|null
     */
    public static function get(Listing $listing): ?array
    {
        $lock = Cache::get(self::cacheKey($listing->id));

        if (! is_array($lock) || ! isset($lock['user_id'], $lock['token'])) {
            return null;
        }

        return [
            'user_id' => (int) $lock['user_id'],
            'name' => (string) ($lock['name'] ?? 'Admin'),
            'token' => (string) $lock['token'],
            'acquired_at' => (string) ($lock['acquired_at'] ?? now()->toIso8601String()),
        ];
    }

    /**
     * @return array{held: bool, token: ?string, editor: ?array{id: int, name: string}}
     */
    public static function acquire(Listing $listing, User $user): array
    {
        $existing = self::get($listing);

        if ($existing !== null && $existing['user_id'] === (int) $user->id) {
            return self::refresh($listing, $user, $existing['token'], $existing['acquired_at']);
        }

        if ($existing !== null) {
            return [
                'held' => false,
                'token' => null,
                'editor' => [
                    'id' => $existing['user_id'],
                    'name' => $existing['name'],
                ],
            ];
        }

        $token = (string) Str::uuid();
        $payload = [
            'user_id' => $user->id,
            'name' => $user->name,
            'token' => $token,
            'acquired_at' => now()->toIso8601String(),
        ];

        if (! Cache::add(self::cacheKey($listing->id), $payload, self::TTL_SECONDS)) {
            $race = self::get($listing);

            if ($race !== null && $race['user_id'] === (int) $user->id) {
                return self::refresh($listing, $user, $race['token'], $race['acquired_at']);
            }

            return [
                'held' => false,
                'token' => null,
                'editor' => $race === null ? null : [
                    'id' => $race['user_id'],
                    'name' => $race['name'],
                ],
            ];
        }

        return [
            'held' => true,
            'token' => $token,
            'editor' => [
                'id' => (int) $user->id,
                'name' => (string) $user->name,
            ],
        ];
    }

    /**
     * @return array{held: bool, token: ?string, editor: ?array{id: int, name: string}}
     */
    public static function heartbeat(Listing $listing, User $user, string $token): array
    {
        $existing = self::get($listing);

        if ($existing === null) {
            return self::acquire($listing, $user);
        }

        if ($existing['user_id'] !== (int) $user->id || $existing['token'] !== $token) {
            return [
                'held' => false,
                'token' => null,
                'editor' => [
                    'id' => $existing['user_id'],
                    'name' => $existing['name'],
                ],
            ];
        }

        return self::refresh($listing, $user, $token, $existing['acquired_at']);
    }

    public static function release(Listing $listing, User $user, ?string $token = null): void
    {
        $existing = self::get($listing);

        if ($existing === null) {
            return;
        }

        if ($existing['user_id'] !== (int) $user->id) {
            return;
        }

        if ($token !== null && $token !== '' && $existing['token'] !== $token) {
            return;
        }

        Cache::forget(self::cacheKey($listing->id));
    }

    public static function conflictMessage(Listing $listing, User $user): ?string
    {
        $existing = self::get($listing);

        if ($existing === null || $existing['user_id'] === (int) $user->id) {
            return null;
        }

        return 'This listing is being edited by '.$existing['name'].'. Try again when they finish.';
    }

    public static function assertWritable(Listing $listing, User $user): void
    {
        $message = self::conflictMessage($listing, $user);

        if ($message === null) {
            return;
        }

        abort(423, $message);
    }

    /**
     * @param  list<int>  $listingIds
     * @return array<int, array{id: int, name: string}>
     */
    public static function editorsFor(array $listingIds): array
    {
        $editors = [];

        foreach ($listingIds as $listingId) {
            $lock = Cache::get(self::cacheKey((int) $listingId));

            if (! is_array($lock) || ! isset($lock['user_id'])) {
                continue;
            }

            $editors[(int) $listingId] = [
                'id' => (int) $lock['user_id'],
                'name' => (string) ($lock['name'] ?? 'Admin'),
            ];
        }

        return $editors;
    }

    /**
     * @return array{held: bool, token: string, editor: array{id: int, name: string}}
     */
    private static function refresh(Listing $listing, User $user, string $token, string $acquiredAt): array
    {
        $payload = [
            'user_id' => $user->id,
            'name' => $user->name,
            'token' => $token,
            'acquired_at' => $acquiredAt,
        ];

        Cache::put(self::cacheKey($listing->id), $payload, self::TTL_SECONDS);

        return [
            'held' => true,
            'token' => $token,
            'editor' => [
                'id' => (int) $user->id,
                'name' => (string) $user->name,
            ],
        ];
    }
}
