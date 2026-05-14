<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideoLesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'title',
        'thumbnail',
        'description',
        'youtube_id',
        'views',
        'transcript'
    ];

    protected $casts = [
        'transcript' => 'array', // JSON ni PHP massiviga avtomatik o'giradi
    ];
}