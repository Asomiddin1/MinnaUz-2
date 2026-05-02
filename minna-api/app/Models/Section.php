<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    /**
     * To'ldirilishi mumkin bo'lgan ustunlar.
     */
    protected $fillable = [
        'test_id',    // Qaysi testga tegishli
        'name',       // Bo'lim nomi (Moji-Goi, Choukai, etc.)
        'type',       // Turi (vocabulary, grammar_reading, listening, language_knowledge_reading)
        'order',      // Tartib raqami (1, 2, 3)
        'time_limit', // Ushbu bo'lim uchun ajratilgan vaqt (minutda)
    ];

    /**
     * Ma'lumot turlarini konvertatsiya qilish.
     */
    protected $casts = [
        'order' => 'integer',
        'time_limit' => 'integer',
        'test_id' => 'integer',
    ];

    // --- BOG'LANISHLAR (RELATIONS) ---

    /**
     * Bo'lim tegishli bo'lgan Testni olish.
     */
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    /**
     * Bo'limga tegishli savollarni olish.
     * Savollar mondai_number bo'yicha tartiblanadi.
     */
    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('mondai_number', 'asc');
    }

    // --- YORDAMCHI METODLAR (HELPERS) ---

    /**
     * Bo'lim turiga qarab rasm yoki audio kerakligini tekshirish.
     * Masalan, frontendda Listening bo'limi bo'lsa Audio pleerni chiqarish uchun.
     */
    public function isListening(): bool
    {
        return $this->type === 'listening';
    }

    /**
     * Bo'limdagi jami ballar yig'indisini hisoblash (Raw score).
     */
    public function getMaxRawPoints(): int
    {
        return $this->questions()->sum('points');
    }

    // --- SCOPES ---

    /**
     * Bo'limlarni tartib bo'yicha olish.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}