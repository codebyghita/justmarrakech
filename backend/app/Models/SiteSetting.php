<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;

class SiteSetting extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'key',
        'value',
    ];

    protected $translatable = [
        'value'
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
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && (is_array($decoded) || is_object($decoded))) {
                $this->attributes['value'] = $value;
                return;
            }
        }
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

