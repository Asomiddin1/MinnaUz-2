<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\VideoLesson;
use Illuminate\Http\Request;

class VideoLessonController extends Controller
{
    // Barcha videolarni chiqarish (shuningdek kategoriya bo'yicha filtrlash)
    public function index(Request $request)
    {
        $query = VideoLesson::query();

        // Agar frontenddan ?category=Anime tili kelsa filterlaydi
        if ($request->has('category') && $request->category !== 'Barchasi') {
            $query->where('category', $request->category);
        }

        // Oxirgi qo'shilganlar birinchi chiqadi
        $videos = $query->latest()->get();

        return response()->json([
            'data' => $videos
        ]);
    }

    // Bitta videoni o'qish va ko'rishlar sonini oshirish
    public function show($id)
    {
        $video = VideoLesson::findOrFail($id);
        
        // Videoga kirganda ko'rishlar sonini 1 taga oshirib qo'yamiz
        $video->increment('views');

        return response()->json([
            'data' => $video
        ]);
    }
}