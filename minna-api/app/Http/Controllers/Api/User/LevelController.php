<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Level;

class LevelController extends Controller
{
    // Bosh sahifa uchun barcha darajalar ro'yxati
    public function index()
    {
        // Faqat kerakli maydonlarni olamiz (tez ishlashi uchun)
        $levels = Level::select('id', 'slug', 'title', 'tags', 'video_count', 'lesson_count')->get();
        return response()->json($levels);
    }

    // Sizning jlpt-levels page'ingiz uchun bitta daraja barcha darslari bilan
    public function show($slug)
    {
        $level = Level::with([
            'modules' => function ($query) {
                $query->orderBy('order'); // Bo'limlarni tartibi bo'yicha
            },
            'modules.lessons' // Modul ichidagi darslarni ham qo'shib beradi
        ])
        ->where('slug', $slug)
        ->firstOrFail();

        return response()->json($level);
    }
}