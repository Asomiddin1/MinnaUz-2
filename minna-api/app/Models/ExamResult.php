<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamResult extends Model
{
    protected $fillable = [
        'user_id', 'test_id', 'total_questions', 'correct_count',
        'wrong_count', 'unanswered_count', 'score', 'passed', 'time_spent',
    ];

    protected $casts = [
        'passed' => 'boolean',
        'total_questions' => 'integer',
        'correct_count' => 'integer',
        'wrong_count' => 'integer',
        'unanswered_count' => 'integer',
        'score' => 'integer',
        'time_spent' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function answers()
    {
        return $this->hasMany(ExamResultAnswer::class);
    }
}