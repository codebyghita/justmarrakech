<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTranslations;

class PageContent extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'slug',
        'section',
        'type',
        'content',
        'image_path',
    ];

    protected $casts = [
        'content' => 'json',
    ];

    // The fields we want to auto-translate
    protected $translatable = [
        'content'
    ];
}
