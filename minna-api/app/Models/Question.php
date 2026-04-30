<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table = 'questions';

    protected $fillable = [
        'test_id',   // 👈 BU JUDA MUHIM! Buni qo'shish shart.
        'type',
        'level',
        'question',
        'options',
        'answer',
        'text',
        'audio_url',
        'time'
    ];

    // options JSON bo‘lgani uchun array qilib ishlatamiz
    protected $casts = [
        'options' => 'array',
    ];

    // 💡 Testga qayta bog'lanish (Inverse relationship)
    public function test()
    {
        return $this->belongsTo(Test::class);
    }
}