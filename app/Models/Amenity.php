<?php

namespace App\Models;

use App\Support\AmenityIcon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Amenity extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'icon_key',
        'category_key',
        'is_active',
        'usage_count',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'usage_count' => 'integer',
        ];
    }

    public static function makeSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'amenity';
        $slug = $base;
        $i = 1;

        while (static::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }

    public static function findOrCreateNamed(string $name, ?string $categoryKey = null): self
    {
        $name = trim($name);
        $existing = static::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        if ($existing) {
            if (! filled($existing->icon_key)) {
                $existing->forceFill([
                    'icon_key' => AmenityIcon::guess(
                        (string) $existing->slug,
                        (string) $existing->name,
                    ),
                ])->saveQuietly();
            }

            return $existing;
        }

        $slug = static::makeSlug($name);

        return static::query()->create([
            'name' => $name,
            'slug' => $slug,
            'icon_key' => AmenityIcon::guess($slug, $name),
            'category_key' => $categoryKey,
            'is_active' => true,
            'usage_count' => 0,
        ]);
    }
}
