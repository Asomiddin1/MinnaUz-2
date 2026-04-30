<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Question;

class JlptController extends Controller
{
    /**
     * 📥 1. Moji / Bunpou / Dokkai savollarni olish
     */
    public function getQuestions(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'level' => 'required|string',
        ]);

        $questions = Question::where('type', $request->type)
            ->where('level', $request->level)
            ->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'type' => $q->type,
                    'level' => $q->level,
                    'question' => $q->question,
                    'options' => $q->options,
                    'text' => $q->text,
                ];
            });

        return response()->json([
            'status' => true,
            'count' => $questions->count(),
            'data' => $questions
        ]);
    }

    /**
     * 🎧 2. Listening (Choukai - 1 ta 30–40 min audio + timecoded questions)
     */
    public function getListening(Request $request)
    {
        $request->validate([
            'level' => 'required|string',
        ]);

        $questions = Question::where('type', 'choukai')
            ->where('level', $request->level)
            ->orderBy('time', 'asc')
            ->get();

        if ($questions->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No listening data found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'audio_url' => $questions->first()->audio_url,
            'duration' => 40, // optional (frontend uchun hint)
            'data' => $questions->map(function ($q) {
                return [
                    'id' => $q->id,
                    'time' => $q->time, // ⏱ important for sync
                    'question' => $q->question,
                    'options' => $q->options,
                ];
            })
        ]);
    }

    /**
     * 📤 3. Test submit (score calculation)
     */
    public function submit(Request $request)
    {
        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer',
            'answers.*.answer' => 'required|string',
        ]);

        $answers = $request->answers;

        $correct = 0;
        $total = count($answers);

        foreach ($answers as $ans) {
            $question = Question::find($ans['question_id']);

            if ($question && $question->answer === $ans['answer']) {
                $correct++;
            }
        }

        $wrong = $total - $correct;

        $score = $total > 0
            ? round(($correct / $total) * 100, 2)
            : 0;

        return response()->json([
            'status' => true,
            'result' => [
                'score' => $score,
                'correct' => $correct,
                'wrong' => $wrong,
                'total' => $total
            ]
        ]);
    }
}