<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $table = 'questions';

    /**
     * To'ldirilishi mumkin bo'lgan ustunlar.
     */
    protected $fillable = [
        'section_id',      // Bo'lim IDsi
        'mondai_number',   // Mondai 1, 2, 3...
        'question_number', // Mondai ichidagi savol tartibi (1, 2, 3...)
        'type',            // Savol turi (kanji_reading, grammar, star, listening, etc.)
        'question_text',   // Savol matni
        'passage',         // Reading uchun matn yoki Listening skripti
        'audio_path',      // Listening audio fayl yo'li
        'image_path',      // Agar savolda rasm bo'lsa (Listening yoki Reading grafiklari)
        'options',         // Javob variantlari (Array/JSON)
        'correct_answer',  // To'g'ri javob (masalan: "A" yoki index)
        'points',          // Ushbu savol uchun beriladigan ball
    ];

    /**
     * Ma'lumot turlarini konvertatsiya qilish.
     */
    protected $casts = [
        'options' => 'array',       // JSON-ni avtomatik PHP array-ga aylantiradi
        'points' => 'integer',
        'mondai_number' => 'integer',
        'question_number' => 'integer',
        'section_id' => 'integer',
    ];

    // --- BOG'LANISHLAR (RELATIONS) ---

    /**
     * Savol tegishli bo'lgan bo'limni (Section) olish.
     */
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Savol tegishli bo'lgan Testni olish (Section orqali).
     */
    public function test()
    {
        return $this->section->test();
    }

    // --- YORDAMCHI METODLAR (HELPERS) ---

    /**
     * Foydalanuvchi javobini tekshirish.
     */
    public function isCorrect($answer): bool
    {
        return $this->correct_answer === $answer;
    }

    /**
     * Audio faylning to'liq URL manzilini qaytarish.
     */
    public function getAudioUrlAttribute()
    {
        return $this->audio_path ? asset('storage/' . $this->audio_path) : null;
    }

    /**
     * Rasmning to'liq URL manzilini qaytarish.
     */
    public function getImageUrlAttribute()
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }

    // --- SCOPES ---

    /**
     * Muayyan Mondai bo'yicha filtrlash.
     */
    public function scopeByMondai($query, $number)
    {
        return $query->where('mondai_number', $number);
    }

    /**
     * Faqat listening savollarini olish.
     */
    public function scopeListening($query)
    {
        return $query->whereNotNull('audio_path');
    }
}