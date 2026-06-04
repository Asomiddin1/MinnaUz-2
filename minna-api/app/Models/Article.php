<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $guarded = [];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function stats()
    {
        return $this->hasMany(ArticleStat::class);
    }

    public function contents()
    {
        return $this->hasMany(ArticleContent::class)->orderBy('sort_order');
    }

    public function vocabularies()
    {
        return $this->hasMany(ArticleVocabulary::class);
    }
    public function quizzes()
{
    return $this->hasMany(ArticleQuiz::class);
}
}