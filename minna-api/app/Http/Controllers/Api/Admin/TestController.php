<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB; // Tranzaksiyalar uchun kerak

class TestController extends Controller
{
    /**
     * Barcha testlarni ko'rish
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
     * Yangi test yaratish + 3 TA BO'LIMNI QO'SHISH
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'level'      => 'required|string',
            'is_premium' => 'required',
            'time'       => 'required', 
            'pass_score' => 'required',
        ]);

        // DB::transaction - agar bitta section yaratilmay qolsa, hamma amalni bekor qiladi
        return DB::transaction(function () use ($data, $request) {
            
            // 1. Testni yaratish
            $test = Test::create([
                'title'      => $data['title'],
                'level'      => $data['level'],
                'is_premium' => filter_var($request->is_premium, FILTER_VALIDATE_BOOLEAN),
                'time'       => (int) $data['time'],
                'pass_score' => (int) $data['pass_score'],
            ]);

            // 2. JLPT uchun standart 3 ta bo'limni (Section) yaratish
            // Bu bo'limlarsiz frontendda savol qo'shish tugmasi chiqmaydi!
            $sections = [
                ['name' => 'Moji-Goi (Vocabulary)', 'type' => 'vocabulary', 'order' => 1],
                ['name' => 'Bunpou-Dokkai (Grammar & Reading)', 'type' => 'grammar_reading', 'order' => 2],
                ['name' => 'Choukai (Listening)', 'type' => 'listening', 'order' => 3],
            ];

            foreach ($sections as $section) {
                $test->sections()->create($section);
            }

            return response()->json([
                'message' => 'Test va 3 ta bo\'lim yaratildi', 
                'data' => $test->load('sections')
            ], 201);
        });
    }

    /**
     * Test tafsilotlari (Section va Savollar bilan birga)
     */
    public function show($id)
    {
        // with(['sections.questions']) - Frontend ishlashi uchun juda muhim!
        $test = Test::with(['sections.questions' => function($q) {
            $q->orderBy('mondai_number')->orderBy('question_number');
        }])->findOrFail($id);

        return response()->json(['data' => $test]);
    }

    /**
     * Testni tahrirlash
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

        if ($request->hasFile('audio_file')) {
            if ($test->audio_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $test->audio_url));
            }
            $path = $request->file('audio_file')->store('tests/audio', 'public');
            $data['audio_url'] = '/storage/' . $path;
        }

        if (isset($data['is_premium'])) {
            $data['is_premium'] = filter_var($request->is_premium, FILTER_VALIDATE_BOOLEAN);
        }

        $test->update($data);

        return response()->json([
            'message' => 'Test muvaffaqiyatli yangilandi',
            'data' => $test
        ]);
    }

    /**
     * Testni o'chirish
     */
    public function destroy($id)
    {
        $test = Test::findOrFail($id);

        if ($test->audio_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $test->audio_url));
        }

        $test->delete();
        return response()->json(['message' => 'O‘chirildi']);
    }
}