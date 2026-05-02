<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamResultAnswer extends Model
{
    protected $fillable = [
        'exam_result_id', 'question_id', 'selected_option',
        'correct_option', 'is_correct', 'points',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points' => 'integer',
    ];

    public function examResult()
    {
        return $this->belongsTo(ExamResult::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}