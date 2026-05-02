<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    /**
     * Jadvalda to'ldirilishi mumkin bo'lgan ustunlar.
     */
    protected $fillable = [
    'title',
    'level',
    'is_premium',
    'time',        // Migratsiyadagi 'time'
    'pass_score',  // Migratsiyadagi 'pass_score'
    'audio_url',
    'description',
];

    /**
     * Ma'lumotlarni o'z holatida konvertatsiya qilish (Casting).
     */
    protected $casts = [
    'is_premium' => 'boolean',
    'time' => 'integer',
    'pass_score' => 'integer',
];
    // --- BOG'LANISHLAR (RELATIONS) ---

    /**
     * Testga tegishli bo'limlar (Sections).
     * N4/N5 uchun 3 ta, N1/N2 uchun 2 ta bo'lishi mumkin.
     */
    public function sections()
    {
        return $this->hasMany(Section::class)->orderBy('order', 'asc');
    }

    /**
     * Testga tegishli barcha savollar bo'limlar orqali.
     */
    public function questions()
    {
        return $this->hasManyThrough(Question::class, Section::class);
    }

    /**
     * Foydalanuvchilarning ushbu test bo'yicha urinishlari (natijalari).
     */
    public function attempts()
    {
        return $this->hasMany(UserTestAttempt::class);
    }

    // --- YORDAMCHI METODLAR (HELPERS) ---

    /**
     * Foydalanuvchi ushbu testni yechishga ruxsati borligini tekshirish.
     */
    public function canBeAccessedBy($user = null): bool
    {
        // Test tekin bo'lsa hamma ko'radi
        if (!$this->is_premium) {
            return true;
        }

        // Test premium bo'lsa, foydalanuvchi login qilgan va premium bo'lishi kerak
        return $user && $user->is_premium;
    }

    /**
     * Testning umumiy savollar sonini hisoblash.
     */
    public function getTotalQuestionsCountAttribute(): int
    {
        return $this->questions()->count();
    }

    /**
     * Test darajasiga qarab ball hisoblash turini aniqlash.
     */
    public function getScoringTypeAttribute(): string
    {
        return in_array($this->level, ['N4', 'N5']) ? 'two_sections' : 'three_sections';
    }

    // --- SCOPES (QIDIRUVNI OSONLASHTIRISH) ---

    public function scopePremium($query)
    {
        return $query->where('is_premium', true);
    }

    public function scopeFree($query)
    {
        return $query->where('is_premium', false);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }
}