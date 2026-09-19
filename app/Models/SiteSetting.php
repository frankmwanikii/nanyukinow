<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Throwable;

class SiteSetting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'label',
        'type',
        'value',
        'help',
        'sort_order',
    ];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $settings = static::cachedMap();

        return array_key_exists($key, $settings) ? $settings[$key] : $default;
    }

    /**
     * @return array<string, mixed>
     */
    public static function cachedMap(): array
    {
        try {
            $settings = Cache::rememberForever('site_settings', function () {
                return static::query()->pluck('value', 'key')->all();
            });
        } catch (Throwable) {
            static::forgetCache();
            $settings = static::query()->pluck('value', 'key')->all();
            Cache::forever('site_settings', $settings);
        }

        // Recover from stale/corrupt cache (e.g. serialized Collection → Incomplete_Class).
        if ($settings instanceof Collection) {
            $settings = $settings->all();
            Cache::forever('site_settings', $settings);
        }

        if (! is_array($settings)) {
            static::forgetCache();
            $settings = static::query()->pluck('value', 'key')->all();
            Cache::forever('site_settings', $settings);
        }

        return $settings;
    }

    public static function forgetCache(): void
    {
        Cache::forget('site_settings');
    }

    protected static function booted(): void
    {
        static::saved(fn () => static::forgetCache());
        static::deleted(fn () => static::forgetCache());
    }
}
