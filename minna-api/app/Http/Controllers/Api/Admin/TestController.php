<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    /**
     * Barcha testlarni ko'rish (Pagination bilan)
     */
    public function index(Request $request)
    {
        $query = Test::withCount('sections')->latest();

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Yangi test yaratish + 3 ta JLPT bo'limini avtomatik qo'shish
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'level'      => 'required|in:N1,N2,N3,N4,N5',
            'is_premium' => 'required', // FormData orqali kelgani uchun string bo'lishi mumkin
            'time'       => 'required|numeric|min:1', 
            'pass_score' => 'required|numeric|min:1',
            'audio_file' => 'nullable|file|mimes:mp3,wav|max:40960', // 40MB max
        ]);

        return DB::transaction(function () use ($request, $data) {
            
            // 1. Audio faylni yuklash (agar bo'lsa)
            $audioUrl = null;
            if ($request->hasFile('audio_file')) {
                $path = $request->file('audio_file')->store('tests/audio', 'public');
                $audioUrl = '/storage/' . $path;
            }

            // 2. Testni yaratish
            $test = Test::create([
                'title'      => $data['title'],
                'level'      => $data['level'],
                'is_premium' => filter_var($request->is_premium, FILTER_VALIDATE_BOOLEAN),
                'time'       => (int) $data['time'],
                'pass_score' => (int) $data['pass_score'],
                'audio_url'  => $audioUrl,
            ]);

            // 3. JLPT uchun standart 3 ta bo'limni (Section) yaratish
            $sections = [
                ['name' => 'Moji-Goi (Vocabulary)', 'type' => 'vocabulary', 'order' => 1],
                ['name' => 'Bunpou-Dokkai (Grammar & Reading)', 'type' => 'grammar_reading', 'order' => 2],
                ['name' => 'Choukai (Listening)', 'type' => 'listening', 'order' => 3],
            ];

            foreach ($sections as $section) {
                $test->sections()->create($section);
            }

            return response()->json([
                'message' => 'Test va 3 ta bo\'lim muvaffaqiyatli yaratildi', 
                'data' => $test->load('sections')
            ], 201);
        });
    }

    /**
     * Test tafsilotlari (Bo'limlar va savollari bilan birga)
     */
    public function show($id)
    {
        // Savollarni Mondai va Question raqami bo'yicha tartiblab olamiz
        $test = Test::with(['sections.questions' => function($q) {
            $q->orderBy('mondai_number')->orderBy('question_number');
        }])->findOrFail($id);

        return response()->json(['data' => $test]);
    }

    /**
     * Test ma'lumotlarini tahrirlash
     */
    public function update(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $data = $request->validate([
            'title'      => 'sometimes|string|max:255',
            'level'      => 'sometimes|in:N1,N2,N3,N4,N5',
            'is_premium' => 'sometimes',
            'time'       => 'sometimes|numeric|min:1',
            'pass_score' => 'sometimes|numeric|min:1',
            'audio_file' => 'nullable|file|mimes:mp3,wav|max:40960',
        ]);

        // Audio faylni yangilash
        if ($request->hasFile('audio_file')) {
            // Eski faylni o'chirish
            if ($test->audio_url) {
                $oldPath = str_replace('/storage/', '', $test->audio_url);
                Storage::disk('public')->delete($oldPath);
            }
            
            // Yangi faylni saqlash
            $path = $request->file('audio_file')->store('tests/audio', 'public');
            $data['audio_url'] = '/storage/' . $path;
        }

        // Boolean qiymatni to'g'rilash
        if (isset($request->is_premium)) {
            $data['is_premium'] = filter_var($request->is_premium, FILTER_VALIDATE_BOOLEAN);
        }

        $test->update($data);

        return response()->json([
            'message' => 'Test muvaffaqiyatli yangilandi',
            'data' => $test
        ]);
    }

    /**
     * Testni va unga tegishli audio faylni o'chirish
     */
    public function destroy($id)
    {
        $test = Test::findOrFail($id);

        // Audio fayli bo'lsa, uni storage'dan o'chiramiz
        if ($test->audio_url) {
            $path = str_replace('/storage/', '', $test->audio_url);
            Storage::disk('public')->delete($path);
        }

        // Testni o'chiramiz (Cascade o'chirish yoqilgan bo'lsa, sectionlar ham o'chadi)
        $test->delete();

        return response()->json(['message' => 'Test va barcha ma\'lumotlar o‘chirildi']);
    }
}