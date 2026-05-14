<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Level;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function getGrammars($slug)
    {
        $level = Level::where('slug', $slug)->firstOrFail();
        return response()->json([
            'data' => $level->grammars
        ]);
    }

    public function getKanjis($slug)
    {
        $level = Level::where('slug', $slug)->firstOrFail();
        return response()->json([
            'data' => $level->kanjis
        ]);
    }

    public function getVocabularies($slug)
    {
        $level = Level::where('slug', $slug)->firstOrFail();
        return response()->json([
            'data' => $level->vocabularies
        ]);
    }
}