<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kanji;
use Illuminate\Http\Request;

class KanjiController extends Controller
{
    public function index()
    {
        return response()->json(Kanji::with('level')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'level_id' => 'required|exists:levels,id',
            'character' => 'required|string|max:255',
            'meaning' => 'required|string|max:255',
            'kunyomi' => 'nullable|string|max:255',
            'onyomi' => 'nullable|string|max:255',
            'examples' => 'nullable|array', // Massiv ekanligini tekshiramiz
        ]);

        $kanji = Kanji::create($validated);
        return response()->json(['message' => 'Kanji muvaffaqiyatli qo\'shildi', 'data' => $kanji], 201);
    }

    public function show(Kanji $kanji)
    {
        return response()->json($kanji->load('level'));
    }

    public function update(Request $request, Kanji $kanji)
    {
        $validated = $request->validate([
            'level_id' => 'sometimes|exists:levels,id',
            'character' => 'sometimes|string|max:255',
            'meaning' => 'sometimes|string|max:255',
            'kunyomi' => 'nullable|string|max:255',
            'onyomi' => 'nullable|string|max:255',
            'examples' => 'nullable|array',
        ]);

        $kanji->update($validated);
        return response()->json(['message' => 'Kanji yangilandi', 'data' => $kanji]);
    }

    public function destroy(Kanji $kanji)
    {
        $kanji->delete();
        return response()->json(['message' => 'Kanji o\'chirildi']);
    }
}