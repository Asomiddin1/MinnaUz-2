<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Test;
use Illuminate\Support\Facades\Storage; // Storage uchun kerak

class TestController extends Controller
{
    /**
     * 1. Barcha testlarni olish (Ro'yxat)
     */
    public function index()
    {
        return response()->json(Test::latest()->get());
    }

    /**
     * 2. Yangi test yaratish va Audio yuklash
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'level'      => 'required|string',
            'type'       => 'required|string',
            'is_premium' => 'boolean',
            'time'       => 'required|numeric|min:1', // 👈 Vaqt (min 1 daqiqa)
            'pass_score' => 'required|numeric|min:1|max:100', // 👈 Ball (1 dan 100 gacha)
            'audio_file' => 'nullable|mimes:mp3,wav,ogg,m4a|max:40960' 
        ]);

        $audioUrl = null;
        if ($request->hasFile('audio_file')) {
            $path = $request->file('audio_file')->store('audios', 'public');
            $audioUrl = '/storage/' . $path; 
        }

        $test = new Test();
        $test->title = $request->title;
        $test->level = $request->level;
        $test->type = $request->type;
        $test->is_premium = $request->input('is_premium') == '1' ? true : false;
        $test->time = $request->time;             // 👈 Saqlash
        $test->pass_score = $request->pass_score; // 👈 Saqlash
        $test->audio_url = $audioUrl;
        $test->save();

        return response()->json(['status' => true, 'message' => 'Yaratildi', 'data' => $test], 201);
    }

    public function update(Request $request, $id)
    {
        $test = Test::findOrFail($id);
        
        $request->validate([
            'title'      => 'required|string|max:255',
            'level'      => 'required|string',
            'type'       => 'required|string',
            'time'       => 'required|numeric|min:1',
            'pass_score' => 'required|numeric|min:1|max:100',
            'audio_file' => 'nullable|mimes:mp3,wav,ogg,m4a|max:40960'
        ]);

        $test->title = $request->title;
        $test->level = $request->level;
        $test->type = $request->type;
        $test->is_premium = $request->input('is_premium') == '1' ? true : false;
        $test->time = $request->time;             // 👈 Yangilash
        $test->pass_score = $request->pass_score; // 👈 Yangilash

        if ($request->hasFile('audio_file')) {
            if ($test->audio_url) {
                $oldPath = str_replace('/storage/', '', $test->audio_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('audio_file')->store('audios', 'public');
            $test->audio_url = '/storage/' . $path;
        }

        $test->save();

        return response()->json(['status' => true, 'data' => $test]);
    }

    /**
     * 4. O'chirish (Delete) va Audioni tozalash
     */
    public function destroy($id)
    {
        $test = Test::findOrFail($id);
        
        // Test o'chirilganda, serverdagi MP3 faylni ham o'chirib yuboramiz
        if ($test->audio_url) {
            $oldPath = str_replace('/storage/', '', $test->audio_url);
            Storage::disk('public')->delete($oldPath);
        }
        
        $test->delete();
        return response()->json(['status' => true, 'message' => 'Test muvaffaqiyatli o\'chirildi']);
    }

    /**
     * 5. Bitta testni ko'rish (Show)
     */
    public function show($id)
    {
        $test = Test::find($id);

        if (!$test) {
            return response()->json([
                'success' => false,
                'message' => 'Test topilmadi'
            ], 404);
        }

        return response()->json($test, 200);
    }

    /**
     * 6. Testga tegishli savollarni olish
     */
    public function getQuestions($testId)
    {
        $test = Test::with('questions')->find($testId);

        if (!$test) {
            return response()->json([
                'success' => false,
                'message' => 'Test topilmadi'
            ], 404);
        }

        // Faqat savollarni qaytarish
        return response()->json($test->questions, 200);
    }
}