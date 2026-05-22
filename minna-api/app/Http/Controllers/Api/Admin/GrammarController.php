<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grammar;
use Illuminate\Http\Request;

class GrammarController extends Controller
{
    // =========================
    // INDEX
    // =========================
    public function index()
    {
        return response()->json([
            'data' => Grammar::with('level')->get()
        ]);
    }

    // =========================
    // STORE (CREATE)
    // =========================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'level_id' => 'required|exists:levels,id',
            'title' => 'required|array',
            'title.jp' => 'required|string|max:255', // Yaponcha majburiy
            'title.uz' => 'nullable|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ru' => 'nullable|string|max:255',
            
            'meaning' => 'nullable|array',
            'meaning.jp' => 'nullable|string|max:255',
            'meaning.uz' => 'nullable|string|max:255',
            'meaning.en' => 'nullable|string|max:255',
            'meaning.ru' => 'nullable|string|max:255',
            
            'description' => 'nullable|array',
            'description.jp' => 'nullable|string',
            'description.uz' => 'nullable|string',
            'description.en' => 'nullable|string',
            'description.ru' => 'nullable|string',
            
            'examples' => 'nullable|array',
            'examples.jp' => 'nullable|array',
            'examples.uz' => 'nullable|array',
            'examples.en' => 'nullable|array',
            'examples.ru' => 'nullable|array',
        ]);

        $grammar = Grammar::create([
            'level_id' => $validated['level_id'],
            'title' => $validated['title'],
            'meaning' => $validated['meaning'] ?? [],
            'description' => $validated['description'] ?? [],
            'examples' => $validated['examples'] ?? [],
        ]);

        return response()->json([
            'message' => 'Grammar created',
            'data' => $grammar->load('level'),
        ], 201);
    }

    // =========================
    // SHOW
    // =========================
    public function show(Grammar $grammar)
    {
        return response()->json([
            'data' => $grammar->load('level')
        ]);
    }

    // =========================
    // UPDATE (To'liq yangilash)
    // =========================
    public function update(Request $request, Grammar $grammar)
    {
        $validated = $request->validate([
            'level_id' => 'required|exists:levels,id',
            
            'title' => 'required|array',
            'title.jp' => 'required|string|max:255',
            'title.uz' => 'nullable|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ru' => 'nullable|string|max:255',
            
            'meaning' => 'nullable|array',
            'meaning.jp' => 'nullable|string|max:255',
            'meaning.uz' => 'nullable|string|max:255',
            'meaning.en' => 'nullable|string|max:255',
            'meaning.ru' => 'nullable|string|max:255',
            
            'description' => 'nullable|array',
            'description.jp' => 'nullable|string',
            'description.uz' => 'nullable|string',
            'description.en' => 'nullable|string',
            'description.ru' => 'nullable|string',
            
            'examples' => 'nullable|array',
            'examples.jp' => 'nullable|array',
            'examples.uz' => 'nullable|array',
            'examples.en' => 'nullable|array',
            'examples.ru' => 'nullable|array',
        ]);

        $grammar->update([
            'level_id' => $validated['level_id'],
            'title' => $validated['title'],
            'meaning' => $validated['meaning'] ?? [],
            'description' => $validated['description'] ?? [],
            'examples' => $validated['examples'] ?? [],
        ]);

        return response()->json([
            'message' => 'Grammar updated',
            'data' => $grammar->fresh()->load('level'),
        ]);
    }

    // =========================
    // DELETE
    // =========================
    public function destroy(Grammar $grammar)
    {
        $grammar->delete();
        
        return response()->json([
            'message' => 'Grammar deleted'
        ]);
    }

    // =========================
    // BULK DELETE
    // =========================
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:grammars,id'
        ]);

        Grammar::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => count($validated['ids']) . ' grammars deleted'
        ]);
    }
}