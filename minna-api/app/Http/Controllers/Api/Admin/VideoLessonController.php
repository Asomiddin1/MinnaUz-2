<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VideoLesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; // Http fasadini qo'shamiz

class VideoLessonController extends Controller
{
    public function index()
    {
        return response()->json(VideoLesson::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'thumbnail' => 'nullable|string|url',
            'description' => 'nullable|string',
            'youtube_id' => 'nullable|string',
            'transcript' => 'nullable|array',
        ]);

        $video = VideoLesson::create($validated);
        return response()->json(['message' => 'Video muvaffaqiyatli qo\'shildi', 'data' => $video], 201);
    }

    public function show(VideoLesson $videoLesson) // route model binding
    {
        return response()->json($videoLesson);
    }

    public function update(Request $request, VideoLesson $videoLesson)
    {
        $validated = $request->validate([
            'category' => 'sometimes|string|max:255',
            'title' => 'sometimes|string|max:255',
            'thumbnail' => 'nullable|string|url',
            'description' => 'nullable|string',
            'youtube_id' => 'nullable|string',
            'transcript' => 'nullable|array',
        ]);

        $videoLesson->update($validated);
        return response()->json(['message' => 'Video yangilandi', 'data' => $videoLesson]);
    }

    public function destroy(VideoLesson $videoLesson)
    {
        $videoLesson->delete();
        return response()->json(['message' => 'Video o\'chirildi']);
    }

    // ==========================================
    // YOUTUBE DAN MA'LUMOT TORTISH (YANGI)
    // ==========================================
    public function fetchFromYoutube(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->url;

        // URL ichidan YouTube ID ni qirqib olish uchun Regex
        preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/\s]{11})%i', $url, $match);
        $youtube_id = $match[1] ?? null;

        if (!$youtube_id) {
            return response()->json(['message' => 'Yaroqsiz YouTube ssilkasi!'], 400);
        }

        try {
            // YouTube ning ochiq oEmbed API'siga so'rov yuboramiz
            $response = Http::get("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={$youtube_id}&format=json");

            if ($response->successful()) {
                $data = $response->json();
                
                return response()->json([
                    'youtube_id' => $youtube_id,
                    'title' => $data['title'] ?? '',
                    // Sifatli rasmni ID orqali o'zimiz yasab olamiz
                    'thumbnail' => "https://img.youtube.com/vi/{$youtube_id}/maxresdefault.jpg",
                ]);
            }

            return response()->json(['message' => 'YouTube dan ma\'lumot topilmadi'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Xatolik yuz berdi: ' . $e->getMessage()], 500);
        }
    }
}