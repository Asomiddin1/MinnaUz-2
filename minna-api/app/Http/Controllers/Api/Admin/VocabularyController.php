<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vocabulary;
use Illuminate\Http\Request;

class VocabularyController extends Controller
{
    public function index()
    {
        return response()->json(Vocabulary::with('level')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'level_id' => 'required|exists:levels,id',
            'word' => 'required|string|max:255',
            'reading' => 'nullable|string|max:255',
            'meaning' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'examples' => 'nullable|array',
        ]);

        $vocabulary = Vocabulary::create($validated);
        return response()->json(['message' => 'Lug\'at muvaffaqiyatli qo\'shildi', 'data' => $vocabulary], 201);
    }

    public function show(Vocabulary $vocabulary)
    {
        return response()->json($vocabulary->load('level'));
    }

    public function update(Request $request, Vocabulary $vocabulary)
    {
        $validated = $request->validate([
            'level_id' => 'sometimes|exists:levels,id',
            'word' => 'sometimes|string|max:255',
            'reading' => 'nullable|string|max:255',
            'meaning' => 'sometimes|string|max:255',
            'type' => 'nullable|string|max:100',
            'examples' => 'nullable|array',
        ]);

        $vocabulary->update($validated);
        return response()->json(['message' => 'Lug\'at yangilandi', 'data' => $vocabulary]);
    }

    public function destroy(Vocabulary $vocabulary)
    {
        $vocabulary->delete();
        return response()->json(['message' => 'Lug\'at o\'chirildi']);
    }
}