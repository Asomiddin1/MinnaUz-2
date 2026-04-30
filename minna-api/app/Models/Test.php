<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    protected $fillable = [
        'title', 
        'level', 
        'type',
        'audio_url',
        'is_premium' ,
        'time',       
        'pass_score' 
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}