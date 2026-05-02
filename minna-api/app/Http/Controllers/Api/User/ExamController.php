<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\ExamResult;
use App\Models\ExamResultAnswer;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    // Test ro'yxati (premium tekshiruvi bilan)
    // index metodini level filtrlash va locked maydoni bilan yangilang
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
            'is_premium' => $test->is_premium,
            'locked' => $test->is_premium && !$user->is_premium,
            'sections_count' => $test->sections_count, // bo‘limlar soni
        ];
    });

    return response()->json($tests);
}

    // Test ma'lumotlari (bo'lim va savollar bilan)
    public function show($id)
    {
        $user = auth()->user();
        $test = Test::with(['sections.questions'])->findOrFail($id);

        if ($test->is_premium && !$user->is_premium) {
            return response()->json(['message' => 'Bu premium test, obuna bo‘ling!'], 403);
        }

        // Savollarda correct_answer ni yashirish (xavfsizlik)
        $test->sections->each(function ($section) {
            $section->questions->each(function ($question) {
                $question->makeHidden('correct_answer');
            });
        });

        return response()->json($test);
    }

    // Test javoblarini qabul qilish va natijani saqlash
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

        $answers = $request->input('answers');
        $questions = $test->sections->pluck('questions')->flatten()->keyBy('id');

        $total = count($questions);
        $correct = 0;
        $wrong = 0;
        $unanswered = 0;
        $points = 0;

        $resultAnswers = [];

        foreach ($questions as $question) {
            $selected = null;
            $userAnswer = collect($answers)->firstWhere('question_id', $question->id);
            if ($userAnswer && isset($userAnswer['selected_option'])) {
                $selected = $userAnswer['selected_option'];
            }

            $isCorrect = $selected === $question->correct_answer;

            if ($selected === null) {
                $unanswered++;
            } elseif ($isCorrect) {
                $correct++;
                $points += $question->points;
            } else {
                $wrong++;
            }

            $resultAnswers[] = [
                'question_id' => $question->id,
                'selected_option' => $selected,
                'correct_option' => $question->correct_answer,
                'is_correct' => $isCorrect,
                'points' => $isCorrect ? $question->points : 0,
            ];
        }

        $score = $total > 0 ? round(($correct / $total) * 100) : 0;
        $passed = $score >= 50; // oddiy shart

        $examResult = ExamResult::create([
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

        foreach ($resultAnswers as $ans) {
            $ans['exam_result_id'] = $examResult->id;
            ExamResultAnswer::create($ans);
        }

        return response()->json([
            'message' => 'Test topshirildi',
            'data' => [
                'id' => $examResult->id,
                'score' => $score,
                'passed' => $passed,
                'correct_count' => $correct,
                'wrong_count' => $wrong,
                'unanswered_count' => $unanswered,
                'total_questions' => $total,
            ]
        ]);
    }

    // Natijani ko'rish
    public function result($resultId)
    {
        $user = auth()->user();
        $examResult = ExamResult::with(['test', 'answers.question'])->where('user_id', $user->id)->findOrFail($resultId);

        $detailedAnswers = $examResult->answers->map(function ($answer) {
            $question = $answer->question;
            return [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'passage' => $question->passage,
                'options' => $question->options,
                'type' => $question->type,
                'audio_url' => $question->audio_path ? asset('storage/' . $question->audio_path) : null,
                'selected_option' => $answer->selected_option,
                'correct_option' => $answer->correct_option,
                'is_correct' => $answer->is_correct,
                'points' => $answer->points,
            ];
        });

        return response()->json([
            'data' => [
                'id' => $examResult->id,
                'test_id' => $examResult->test_id,
                'test_title' => $examResult->test->title,
                'level' => $examResult->test->level,
                'total_questions' => $examResult->total_questions,
                'correct_count' => $examResult->correct_count,
                'wrong_count' => $examResult->wrong_count,
                'unanswered_count' => $examResult->unanswered_count,
                'score_percentage' => $examResult->score,
                'passed' => $examResult->passed,
                'time_spent' => $examResult->time_spent,
                'answers' => $detailedAnswers,
            ]
        ]);
    }

   public function history()
{
    $user = auth()->user();

    // Barcha natijalarni yangi birinchi olib kelamiz
    $allResults = ExamResult::where('user_id', $user->id)
        ->latest()
        ->get();

    // Agar 7 tadan ko'p bo'lsa, ortib qolganlarini o'chiramiz
    if ($allResults->count() > 7) {
        $keepIds = $allResults->take(7)->pluck('id');
        ExamResult::where('user_id', $user->id)
            ->whereNotIn('id', $keepIds)
            ->delete();
    }

    // Endi faqat qolgan (eng ko'pi 7 ta) natijani qaytaramiz
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
                'level' => $result->test->level,
                'score' => $result->score,
                'passed' => $result->passed,
                'created_at' => $result->created_at->toDateTimeString(),
            ];
        });

    return response()->json($results);
}
}