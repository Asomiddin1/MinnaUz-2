<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = ['module_id', 'title', 'video_url', 'content', 'duration'];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    // Darsga yozilgan commentlar
    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    // Darsga bosilgan likelar (saqlanganlar)
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
}