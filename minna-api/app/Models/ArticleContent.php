<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleContent extends Model
{
    protected $guarded = [];

    // Maqolaga bog'lanish
    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}