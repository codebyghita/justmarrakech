<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnavailableDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'unavailable_type',
        'unavailable_id',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function unavailable()
    {
        return $this->morphTo();
    }
}
