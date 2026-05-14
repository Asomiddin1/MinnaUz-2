<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vocabulary extends Model
{
    use HasFactory;

    protected $fillable = [
        'level_id', 'word', 'reading', 'meaning', 'type', 'examples'
    ];

    protected $casts = [
        'examples' => 'array',
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}