<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Question;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    // 📋 1. Hamma savollar (yoki filtrlangan)
    public function index(Request $request)
    {
        $query = Question::latest();

        // Agar test_id yuborilsa, faqat o'sha testga tegishli savollarni qaytaradi
        if ($request->has('test_id')) {
            $query->where('test_id', $request->test_id);
        }

        return response()->json([
            'status' => true,
            'data' => $query->get()
        ]);
    }

    // ➕ 2. Yangi savol qo‘shish
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'test_id'   => 'required|exists:tests,id', // Test mavjudligini tekshirish
            'type'      => 'required|string',
            'question'  => 'required|string',
            'options'   => 'required|array', // Massiv bo'lishi shart
            'answer'    => 'required|string',
            'level'     => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $question = Question::create([
            'test_id'   => $request->test_id,
            'type'      => $request->type,
            'level'     => $request->level,
            'question'  => $request->question,
            'options'   => $request->options, // Modelda $casts ichida 'array' bo'lishi kerak
            'answer'    => $request->answer,
            'text'      => $request->text,
            'audio_url' => $request->audio_url,
            'time'      => $request->time,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Savol muvaffaqiyatli qo\'shildi',
            'data' => $question
        ], 201);
    }

    // 👁 3. Bitta savolni ko'rish
    public function show($id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json(['status' => false, 'message' => 'Topilmadi'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $question
        ]);
    }

    // ✏️ 4. Savolni tahrirlash (Update)
    public function update(Request $request, $id)
{
    $question = Question::find($id);
    if (!$question) return response()->json(['status' => false, 'message' => 'Topilmadi'], 404);

    // Faqat yuborilgan maydonlarni tekshirish (sometimes)
    $validator = Validator::make($request->all(), [
        'test_id'   => 'sometimes|required|exists:tests,id',
        'type'      => 'sometimes|required|string',
        'question'  => 'sometimes|required|string',
        'options'   => 'sometimes|required|array',
        'answer'    => 'sometimes|required|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }

    $question->update($request->all());

    return response()->json(['status' => true, 'data' => $question]);
}

    // ❌ 5. Savolni o'chirish
    public function destroy($id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json(['status' => false, 'message' => 'Savol topilmadi'], 404);
        }

        $question->delete();

        return response()->json([
            'status' => true,
            'message' => 'Savol muvaffaqiyatli o\'chirildi'
        ]);
    }
}