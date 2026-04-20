<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityCategory extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'slug',
        'name',
        'hero_title',
        'hero_subtitle',
        'hero_description',
        'hero_support',
        'badges',
        'image',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'badges' => 'array',
    ];

    protected $translatable = [
        'name',
        'hero_title',
        'hero_subtitle',
        'hero_description',
        'hero_support',
        'badges',
    ];

    public function activities()
    {
        return $this->hasMany(Activity::class, 'activity_category_id');
    }
}

