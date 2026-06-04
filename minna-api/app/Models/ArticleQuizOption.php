<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleQuizOption extends Model
{
    protected $guarded = [];

    public function quiz()
    {
        return $this->belongsTo(ArticleQuiz::class, 'article_quiz_id');
    }
}