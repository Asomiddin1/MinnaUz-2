<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\ExamResult;
use App\Models\ExamResultAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Test::withCount('sections');

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        $tests = $query->get()->map(function ($test) use ($user) {
            return [
                'id' => $test->id,
                'title' => $test->title,
                'level' => $test->level,
                'time' => $test->time,
                'pass_score' => $test->pass_score,
                // Audio URL ni to'liq formatda qaytaramiz
                'audio_url' => $test->audio_url ? asset('storage/' . str_replace('storage/', '', $test->audio_url)) : null,
                'is_premium' => (bool)$test->is_premium,
                'locked' => $test->is_premium && !$user->is_premium,
                'sections_count' => $test->sections_count,
            ];
        });

        return response()->json($tests);
    }

    public function show($id)
    {
        $user = auth()->user();
        $test = Test::with(['sections.questions'])->findOrFail($id);

        if ($test->is_premium && !$user->is_premium) {
            return response()->json(['message' => 'Bu premium test, obuna bo‘ling!'], 403);
        }

        // Xavfsizlik: To'g'ri javoblarni yashiramiz
        $test->sections->each(function ($section) {
            $section->questions->each(function ($question) {
                $question->makeHidden('correct_answer');
            });
        });

        return response()->json(['data' => $test]);
    }

    public function submit(Request $request, $testId)
    {
        $user = auth()->user();
        $test = Test::with(['sections.questions'])->findOrFail($testId);

        if ($test->is_premium && !$user->is_premium) {
            return response()->json(['message' => 'Premium test uchun ruxsat yo‘q'], 403);
        }

        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_option' => 'nullable|string',
        ]);

        $userAnswers = collect($request->input('answers'));
        $questions = $test->sections->pluck('questions')->flatten()->keyBy('id');

        $total = count($questions);
        $correct = 0; $wrong = 0; $unanswered = 0; $totalPoints = 0;
        $insertData = [];

        foreach ($questions as $question) {
            $userAns = $userAnswers->firstWhere('question_id', $question->id);
            $selected = $userAns['selected_option'] ?? null;
            $isCorrect = ($selected !== null && $selected === $question->correct_answer);

            if ($selected === null) {
                $unanswered++;
            } elseif ($isCorrect) {
                $correct++;
                $totalPoints += $question->points;
            } else {
                $wrong++;
            }

            $insertData[] = [
                'question_id' => $question->id,
                'selected_option' => $selected,
                'correct_option' => $question->correct_answer,
                'is_correct' => $isCorrect,
                'points' => $isCorrect ? $question->points : 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $score = $total > 0 ? round(($correct / $total) * 100) : 0;
        // JLPT bo'yicha o'tish ballini pass_score dan olsak ham bo'ladi
        $passed = $score >= ($test->pass_score ?? 50);

        // Tranzaksiya ishlatish tavsiya etiladi
        $examResult = DB::transaction(function () use ($user, $test, $total, $correct, $wrong, $unanswered, $score, $passed, $request, $insertData) {
            $result = ExamResult::create([
                'user_id' => $user->id,
                'test_id' => $test->id,
                'total_questions' => $total,
                'correct_count' => $correct,
                'wrong_count' => $wrong,
                'unanswered_count' => $unanswered,
                'score' => $score,
                'passed' => $passed,
                'time_spent' => $request->input('time_spent', 0),
            ]);

            // Mass Insert - unumdorlik uchun
            foreach ($insertData as &$data) {
                $data['exam_result_id'] = $result->id;
            }
            ExamResultAnswer::insert($insertData);

            return $result;
        });

        return response()->json([
            'message' => 'Test topshirildi',
            'data' => $examResult
        ]);
    }

    // YANGA QO'SHILGAN FUNKSIYA: Bitta natijani to'liq ko'rsatish
    public function result($resultId)
    {
        $user = auth()->user();

        // 1. Natijani bazadan olamiz. Xavfsizlik uchun faqat shu userga tegishli ekanligini tekshiramiz.
        $examResult = ExamResult::with(['test', 'answers.question'])
            ->where('id', $resultId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // 2. Savollar va javoblarni Frontend (React) kutayotgan formatga o'tkazamiz
        $mappedAnswers = $examResult->answers->map(function ($ans) {
            $question = $ans->question;
            
            // Audio manzilini to'g'rilash (agar bor bo'lsa)
            $audioUrl = null;
            if ($question && $question->audio_url) {
                $audioUrl = asset('storage/' . str_replace('storage/', '', $question->audio_url));
            }

            return [
                'question_id' => $ans->question_id,
                'question_text' => $question ? $question->question_text : 'Savol topilmadi',
                'passage' => $question ? $question->passage : null,
                'options' => $question ? (is_string($question->options) ? json_decode($question->options, true) : $question->options) : [],
                'type' => $question ? $question->type : 'unknown',
                'audio_url' => $audioUrl,
                'selected_option' => $ans->selected_option,
                'correct_option' => $ans->correct_option,
                'is_correct' => (bool)$ans->is_correct,
                'points' => (int)$ans->points,
            ];
        });

        // 3. To'liq natijani Frontend'ga jo'natamiz
        return response()->json([
            'data' => [
                'id' => $examResult->id,
                'test_id' => $examResult->test_id,
                'test_title' => $examResult->test ? $examResult->test->title : 'Test',
                'level' => $examResult->test ? $examResult->test->level : '',
                'total_questions' => $examResult->total_questions,
                'correct_count' => $examResult->correct_count,
                'wrong_count' => $examResult->wrong_count,
                'unanswered_count' => $examResult->unanswered_count,
                'score_percentage' => $examResult->score,
                'passed' => (bool)$examResult->passed,
                'time_spent' => $examResult->time_spent,
                'answers' => $mappedAnswers,
            ]
        ]);
    }

    public function history()
    {
        $user = auth()->user();

        // 1. Eskilarini tozalash (agar 7 tadan oshsa)
        $allResults = ExamResult::where('user_id', $user->id)->latest()->get();
        
        if ($allResults->count() > 7) {
            $deleteIds = $allResults->slice(7)->pluck('id');
            ExamResult::whereIn('id', $deleteIds)->delete();
        }

        // 2. Qolgan 7 tasini qaytarish
        $results = ExamResult::with('test:id,title,level')
            ->where('user_id', $user->id)
            ->latest()
            ->take(7)
            ->get()
            ->map(function ($result) {
                return [
                    'id' => $result->id,
                    'test_id' => $result->test_id,
                    'test_title' => $result->test->title,
                    'level' => $result->test->level ?? '-',
                    'score' => $result->score,
                    'passed' => $result->passed,
                    'created_at' => $result->created_at->diffForHumans(), // O'qishga osonroq
                ];
            });

        return response()->json($results);
    }
}