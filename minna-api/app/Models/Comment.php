<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['user_id', 'lesson_id', 'comment'];

    public function user()
    {
        return $this->belongsTo(User::class); // Comment egasi
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class); // Qaysi darsga yozilgani
    }
}