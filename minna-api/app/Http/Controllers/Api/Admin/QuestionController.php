<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Savollar ro'yxatini olish (Zarur bo'lsa)
     */
    public function index(Request $request)
    {
        $query = Question::query();

        if ($request->has('section_id')) {
            $query->where('section_id', $request->section_id);
        }

        return response()->json($query->orderBy('mondai_number')->orderBy('question_number')->get());
    }

    /**
     * Yangi savol yaratish (Store)
     */
    public function store(Request $request)
    {
        // Frontend yuborgan FormData/JSON ma'lumotlarini tekshirish
        $data = $request->validate([
            'section_id'      => 'required|exists:sections,id',
            'mondai_number'   => 'required|numeric',
            'question_number' => 'required|numeric',
            'type'            => 'required|string',
            'question_text'   => 'required|string',
            'passage'         => 'nullable|string',
            'options'         => 'required|array|size:4', // 4 ta variant bo'lishi shart
            'correct_answer'  => 'required|string',
            'points'          => 'required|numeric',
        ]);

        // Modelga ma'lumotlarni yozish
        $question = Question::create($data);

        return response()->json([
            'message' => 'Savol muvaffaqiyatli qo\'shildi',
            'data' => $question
        ], 201);
    }

    /**
     * Bitta savol ma'lumotlarini olish
     */
    public function show($id)
    {
        $question = Question::findOrFail($id);
        return response()->json($question);
    }

    /**
     * Savolni tahrirlash (Update)
     */
    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);

        $data = $request->validate([
            'mondai_number'   => 'sometimes|numeric',
            'question_number' => 'sometimes|numeric',
            'type'            => 'sometimes|string',
            'question_text'   => 'sometimes|string',
            'passage'         => 'nullable|string',
            'options'         => 'sometimes|array|size:4',
            'correct_answer'  => 'sometimes|string',
            'points'          => 'sometimes|numeric',
        ]);

        $question->update($data);

        return response()->json([
            'message' => 'Savol muvaffaqiyatli yangilandi',
            'data' => $question
        ]);
    }

    /**
     * Savolni o'chirish (Destroy)
     */
    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        $question->delete();

        return response()->json([
            'message' => 'Savol muvaffaqiyatli o\'chirildi'
        ]);
    }
}