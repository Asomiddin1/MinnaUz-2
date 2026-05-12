<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kanji extends Model
{
    protected $fillable = ['level_id', 'character', 'meaning', 'kunyomi', 'onyomi', 'examples'];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}