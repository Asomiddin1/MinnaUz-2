<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    /**
     * Barcha video darslarni ko'rsatish
     */
    public function index(Request $request)
    {
        // Admin panelda dars qaysi modulga va darajaga tegishliligini ko'rish uchun munosabatlarni yuklaymiz
        $query = Lesson::with('module.level');

        // Filtr: Agar faqat bitta modulga (masalan, N5 Grammatika) tegishli darslarni ko'rmoqchi bo'lsak
        if ($request->has('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        return response()->json($query->get());
    }

    /**
     * Yangi video dars qo'shish
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id', // Modul rostdan ham borligini tekshirish
            'title'     => 'required|string|max:255',
            'video_url' => 'required|url',               // YouTube yoki Vimeo ssilkasi uchun to'g'ri URL format ekanini tekshiradi
            'content'   => 'nullable|string',            // Agar dars tagiga matnli tushuntirish kerak bo'lsa
            'duration'  => 'nullable|string'             // Masalan: "12:30"
        ]);

        $lesson = Lesson::create($validated);

        return response()->json([
            'message' => 'Video dars muvaffaqiyatli yaratildi!',
            'data'    => $lesson
        ], 201);
    }

    /**
     * Bitta darsni to'liq ko'rish
     */
    public function show(Lesson $lesson)
    {
        return response()->json($lesson->load('module.level'));
    }

    /**
     * Video darsni tahrirlash (Edit)
     */
    public function update(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title'     => 'required|string|max:255',
            'video_url' => 'required|url',
            'content'   => 'nullable|string',
            'duration'  => 'nullable|string'
        ]);

        $lesson->update($validated);

        return response()->json([
            'message' => 'Video dars yangilandi!',
            'data'    => $lesson
        ]);
    }

    /**
     * Video darsni o'chirish
     */
    public function destroy(Lesson $lesson)
    {
        $lesson->delete();

        return response()->json([
            'message' => 'Video dars muvaffaqiyatli o\'chirildi!'
        ]);
    }
}