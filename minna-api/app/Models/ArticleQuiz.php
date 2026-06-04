<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleQuiz extends Model
{
    protected $guarded = [];

    public function options()
    {
        return $this->hasMany(ArticleQuizOption::class);
    }
}
