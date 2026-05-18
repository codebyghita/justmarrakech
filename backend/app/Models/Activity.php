<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTranslations;

class Activity extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'full_description',
        'location',
        'duration',
        'group_size',
        'price_from',
        'price_type',
        'max_persons',
        'category',
        'activity_category_id',
        'images',
        'pricing_details',
        'highlights',
        'included',
        'not_included',
        'formulas',
        'faq',
        'practical_info_points',
        'whatsapp_link',
        'status',
        'featured',
        'is_active',
        'is_blocking_enabled',
        'meta_description',
        'location_address',
        'google_maps_url',
        'experience_details',
        'timeline',
        'detailed_info',
    ];

    protected $casts = [
        'images' => 'json',
        'pricing_details' => 'json',
        'highlights' => 'json',
        'included' => 'json',
        'not_included' => 'json',
        'formulas' => 'json',
        'faq' => 'json',
        'practical_info_points' => 'json',
        'timeline' => 'json',
        'is_active' => 'boolean',
        'featured' => 'boolean',
        'is_blocking_enabled' => 'boolean',
    ];

    // The fields we want to auto-translate
    protected $translatable = [
        'title',
        'description',
        'full_description',
        'location',
        'duration',
        'group_size',
        'included',
        'not_included',
        'formulas',
        'faq',
        'practical_info_points',
        'experience_details',
        'timeline',
        'detailed_info'
    ];

    public function activityCategory()
    {
        return $this->belongsTo(ActivityCategory::class, 'activity_category_id');
    }
}
