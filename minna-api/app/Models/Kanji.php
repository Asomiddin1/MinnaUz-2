<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kanji extends Model
{
    use HasFactory;

    protected $fillable = [
        'level_id', 'character', 'meaning', 'kunyomi', 'onyomi', 'examples'
    ];

    protected $casts = [
        'examples' => 'array', // JSON ni avtomatik massiv qilib beradi
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}