<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnavailableSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'unavailable_type',
        'unavailable_id',
        'date',
        'time',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}

