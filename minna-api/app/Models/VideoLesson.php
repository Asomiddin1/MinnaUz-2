<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations; // <-- Paket trait'ini chaqiramiz

class VideoLesson extends Model
{
    use HasFactory, HasTranslations; // <-- Traitni modelga qo'shamiz

    protected $fillable = [
        'category',
        'title',
        'thumbnail',
        'description',
        'youtube_id',
        'views',
        'transcript'
    ];

    // Paketga aynan qaysi maydon ko'p tilli ekanini aytamiz
    public $translatable = ['transcript']; 

    protected $casts = [
        // 'transcript' => 'array' <-- Buni o'chirib tashlang yoki olib tashlang
    ];
}