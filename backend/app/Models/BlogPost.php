<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasTranslations;

class BlogPost extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'category',
        'image',
        'status',
        'meta_description'
    ];

    protected $casts = [
        'image' => 'json'
    ];

    protected $translatable = [
        'title',
        'excerpt',
        'content',
    ];
}
