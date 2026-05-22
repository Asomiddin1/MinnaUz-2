<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Translatable\HasTranslations;

class Grammar extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'level_id',
        'title',
        'meaning',
        'description',
        'examples',
    ];

    public $translatable = [
        'title',
        'meaning',
        'description',
        'examples',
    ];

    protected $casts = [
        'level_id' => 'integer',
        'examples' => 'array',
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    // ✅ FIX: missing method (ENG MUHIM)
    public function translateField($field, $locale = 'en')
    {
        return $this->getTranslation($field, $locale) ?? null;
    }

    public function getTitleIn($locale = 'en')
    {
        return $this->getTranslation('title', $locale);
    }
}