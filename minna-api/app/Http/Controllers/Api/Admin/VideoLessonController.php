<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VideoLesson;
use App\Http\Resources\VideoLessonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VideoLessonController extends Controller
{
    public function index()
    {
        $videos = VideoLesson::latest()->get();
        return VideoLessonResource::collection($videos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category'    => 'required|string|max:255',
            'title'       => 'required|string|max:255',
            'thumbnail'   => 'nullable|string|url',
            'description' => 'nullable|string',
            'youtube_id'  => 'nullable|string',
            'transcript'  => 'nullable|array', // ['uz' => '...', 'ja' => '...'] formatda qabul qiladi
        ]);

        $video = VideoLesson::create($validated);
        
        return response()->json([
            'message' => 'Video muvaffaqiyatli qo\'shildi', 
            'data'    => new VideoLessonResource($video)
        ], 201);
    }

    // Diqqat: argument nomi {video} ga moslab $video qilindi
    public function show(VideoLesson $video) 
    {
        return new VideoLessonResource($video);
    }

    // Diqqat: argument nomi {video} ga moslab $video qilindi
    public function update(Request $request, VideoLesson $video)
    {
        $validated = $request->validate([
            'category'    => 'sometimes|string|max:255',
            'title'       => 'sometimes|string|max:255',
            'thumbnail'   => 'nullable|string|url',
            'description' => 'nullable|string',
            'youtube_id'  => 'nullable|string',
            'transcript'  => 'nullable|array',
        ]);

        $video->update($validated);
        
        return response()->json([
            'message' => 'Video yangilandi', 
            'data'    => new VideoLessonResource($video)
        ]);
    }

    // Diqqat: argument nomi {video} ga moslab $video qilindi
    public function destroy(VideoLesson $video)
    {
        $video->delete();
        return response()->json(['message' => 'Video o\'chirildi']);
    }

    // ==========================================
    // YOUTUBE DAN MA'LUMOT TORTISH
    // ==========================================
    public function fetchFromYoutube(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->url;

        preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/\s]{11})%i', $url, $match);
        $youtube_id = $match[1] ?? null;

        if (!$youtube_id) {
            return response()->json(['message' => 'Yaroqsiz YouTube ssilkasi!'], 400);
        }

        try {
            $response = Http::get("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={$youtube_id}&format=json");

            if ($response->successful()) {
                $data = $response->json();
                
                return response()->json([
                    'youtube_id' => $youtube_id,
                    'title'      => $data['title'] ?? '',
                    'thumbnail'  => "https://img.youtube.com/vi/{$youtube_id}/maxresdefault.jpg",
                ]);
            }

            return response()->json(['message' => 'YouTube dan ma\'lumot topilmadi'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Xatolik yuz berdi: ' . $e->getMessage()], 500);
        }
    }
}