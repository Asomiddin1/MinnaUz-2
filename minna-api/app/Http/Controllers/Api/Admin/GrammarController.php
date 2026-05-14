<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grammar;
use Illuminate\Http\Request;

class GrammarController extends Controller
{
    public function index()
    {
        return response()->json(Grammar::with('level')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'level_id' => 'required|exists:levels,id',
            'title' => 'required|string|max:255',
            'meaning' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'examples' => 'nullable|array',
        ]);

        $grammar = Grammar::create($validated);
        return response()->json(['message' => 'Grammatika muvaffaqiyatli qo\'shildi', 'data' => $grammar], 201);
    }

    public function show(Grammar $grammar)
    {
        return response()->json($grammar->load('level'));
    }

    public function update(Request $request, Grammar $grammar)
    {
        $validated = $request->validate([
            'level_id' => 'sometimes|exists:levels,id',
            'title' => 'sometimes|string|max:255',
            'meaning' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'examples' => 'nullable|array',
        ]);

        $grammar->update($validated);
        return response()->json(['message' => 'Grammatika yangilandi', 'data' => $grammar]);
    }

    public function destroy(Grammar $grammar)
    {
        $grammar->delete();
        return response()->json(['message' => 'Grammatika o\'chirildi']);
    }
}