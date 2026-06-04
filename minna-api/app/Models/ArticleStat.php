<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleStat extends Model
{
    protected $guarded = [];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}