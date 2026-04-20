<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    public function getValueAttribute($value)
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    public function setValueAttribute($value): void
    {
        $this->attributes['value'] = json_encode($value, JSON_UNESCAPED_UNICODE);
    }

    public static function getMany(array $defaults): array
    {
        $settings = static::query()
            ->whereIn('key', array_keys($defaults))
            ->get()
            ->keyBy('key');

        $resolved = [];
        foreach ($defaults as $key => $defaultValue) {
            $resolved[$key] = $settings->has($key)
                ? $settings[$key]->value
                : $defaultValue;
        }

        return $resolved;
    }
}

