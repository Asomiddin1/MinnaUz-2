<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    // Bular bazaga ma'lumot yozish uchun ruxsat beradi
    protected $fillable = ['user_id', 'role', 'message'];
}