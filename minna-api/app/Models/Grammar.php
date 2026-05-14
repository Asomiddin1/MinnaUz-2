<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grammar extends Model
{
    use HasFactory;

    // Ruxsat etilgan ustunlar (Mass assignment uchun)
    protected $fillable = [
        'level_id',
        'title',
        'meaning',
        'description',
        'examples',
    ];

    // JSON ma'lumotni avtomatik ravishda PHP Array ga o'tkazish uchun
    protected $casts = [
        'examples' => 'array',
    ];

    /**
     * Grammatika qaysi darajaga (Level) tegishli ekanligini belgilash
     */
    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}