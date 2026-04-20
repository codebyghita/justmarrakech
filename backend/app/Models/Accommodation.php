<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTranslations;

class Accommodation extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'type',
        'location',
        'price_per_night',
        'max_guests',
        'images',
        'featured',
        'status',
        'is_active',
    ];

    protected $casts = [
        'images' => 'json',
        'featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    // The fields we want to auto-translate
    protected $translatable = [
        'title',
        'description',
        'location',
        'type'
    ];
}
