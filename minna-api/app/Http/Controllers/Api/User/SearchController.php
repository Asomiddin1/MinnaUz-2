<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Grammar;
use App\Models\Kanji;
use App\Models\Vocabulary;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json(['data' => []]);
        }

        $grammars = Grammar::where('title', 'LIKE', "%{$query}%")
            ->orWhere('meaning', 'LIKE', "%{$query}%")
            ->orWhere('examples', 'LIKE', "%{$query}%") // JSON ichidan ham qidiradi
            ->get();

        $kanjis = Kanji::where('character', 'LIKE', "%{$query}%")
            ->orWhere('meaning', 'LIKE', "%{$query}%")
            ->orWhere('examples', 'LIKE', "%{$query}%")
            ->get();

        $vocabularies = Vocabulary::where('word', 'LIKE', "%{$query}%")
            ->orWhere('meaning', 'LIKE', "%{$query}%")
            ->orWhere('reading', 'LIKE', "%{$query}%")
            ->orWhere('examples', 'LIKE', "%{$query}%")
            ->get();

        return response()->json([
            'data' => [
                'grammars' => $grammars,
                'kanjis' => $kanjis,
                'vocabularies' => $vocabularies
            ]
        ]);
    }
}