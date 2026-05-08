<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    /**
     * Savollar ro'yxati (variant rasmlari URL bilan).
     */
    public function index(Request $request)
    {
        $query = Question::query();

        if ($request->has('section_id')) {
            $query->where('section_id', $request->section_id);
        }

        $questions = $query->orderBy('mondai_number')
                          ->orderBy('question_number')
                          ->get();

        $questions->transform(function ($question) {
            $question->options = $this->formatOptionsWithUrls($question->options);
            return $question;
        });

        return response()->json($questions);
    }

    /**
     * Yangi savol yaratish.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'section_id'      => 'required|exists:sections,id',
            'mondai_number'   => 'required|numeric',
            'question_number' => 'required|numeric',
            'type'            => 'required|string',
            'question_text'   => 'required|string',
            'passage'         => 'nullable|string',
            'image_path'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'audio_path'      => 'nullable|file|mimes:mp3,wav|max:10240',
            'options'         => 'required|array|min:2|max:6',
            'options.*.text'  => 'nullable|string',
            'options.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'correct_answer'  => 'required|string',  // variant indeksi: "0","1",...
            'points'          => 'required|numeric',
        ]);

        // Savolning o‘z rasmi
        if ($request->hasFile('image_path')) {
            $data['image_path'] = $request->file('image_path')->store('questions', 'public');
        } else {
            unset($data['image_path']);
        }

        // Audio (ixtiyoriy)
        if ($request->hasFile('audio_path')) {
            $data['audio_path'] = $request->file('audio_path')->store('audio', 'public');
        } else {
            unset($data['audio_path']);
        }

        // Variant rasmlarini saqlash
        foreach ($data['options'] as $index => $option) {
            if (isset($option['image']) && $option['image'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $option['image']->store('options', 'public');
                $data['options'][$index]['image'] = $path;
            } else {
                $data['options'][$index]['image'] = $option['image'] ?? null;
            }
        }

        $question = Question::create($data);
        $question->options = $this->formatOptionsWithUrls($question->options);

        return response()->json([
            'message' => 'Savol muvaffaqiyatli qo\'shildi',
            'data'    => $question,
        ], 201);
    }

    /**
     * Bitta savolni ko‘rish.
     */
    public function show($id)
    {
        $question = Question::findOrFail($id);
        $question->options = $this->formatOptionsWithUrls($question->options);
        return response()->json($question);
    }

    /**
     * Savolni tahrirlash (rasm o‘chirish/qo‘shish).
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
            'image_path'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'audio_path'      => 'nullable|file|mimes:mp3,wav|max:10240',
            'remove_image'    => 'nullable|boolean',  // savol rasmini o‘chirish
            'options'         => 'sometimes|array|min:2|max:6',
            'options.*.text'  => 'nullable|string',
            'options.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'correct_answer'  => 'sometimes|string',
            'points'          => 'sometimes|numeric',
        ]);

        // --- Savolning o‘z rasmi bilan ishlash ---
        if ($request->hasFile('image_path')) {
            // Yangi rasm yuklandi – eski rasmni o‘chir
            if ($question->image_path) {
                Storage::disk('public')->delete($question->image_path);
            }
            $data['image_path'] = $request->file('image_path')->store('questions', 'public');
        } elseif ($request->boolean('remove_image')) {
            // Rasm o‘chirish so‘ralgan
            if ($question->image_path) {
                Storage::disk('public')->delete($question->image_path);
            }
            $data['image_path'] = null;
        } else {
            // O‘zgartirish yo‘q
            unset($data['image_path']);
        }

        // Audio xuddi shunday qo‘shilishi mumkin (kerak bo‘lsa)
        // ...

        // --- Variant rasmlari bilan ishlash ---
        if (isset($data['options'])) {
            $oldOptions = $question->options ?? [];

            foreach ($data['options'] as $index => $option) {
                if (isset($option['image']) && $option['image'] instanceof \Illuminate\Http\UploadedFile) {
                    // Yangi rasm – eski rasmni o‘chir
                    if (!empty($oldOptions[$index]['image'])) {
                        Storage::disk('public')->delete($oldOptions[$index]['image']);
                    }
                    $path = $option['image']->store('options', 'public');
                    $data['options'][$index]['image'] = $path;
                } else {
                    // Rasm yuklanmagan holat
                    if (array_key_exists('image', $option) && is_null($option['image'])) {
                        // Frontend null yuborgan – rasmni o‘chir
                        if (!empty($oldOptions[$index]['image'])) {
                            Storage::disk('public')->delete($oldOptions[$index]['image']);
                        }
                        $data['options'][$index]['image'] = null;
                    } elseif (!array_key_exists('image', $option)) {
                        // image kaliti umuman yo‘q – eski qiymat qoladi
                        $data['options'][$index]['image'] = $oldOptions[$index]['image'] ?? null;
                    } else {
                        // string yo‘l yuborilgan (kamdan-kam)
                        $data['options'][$index]['image'] = $option['image'];
                    }
                }
            }

            // Agar yangi options soni eski optionsdan kam bo‘lsa, ortiqcha variant rasmlarini o‘chir
            if (count($data['options']) < count($oldOptions)) {
                for ($i = count($data['options']); $i < count($oldOptions); $i++) {
                    if (!empty($oldOptions[$i]['image'])) {
                        Storage::disk('public')->delete($oldOptions[$i]['image']);
                    }
                }
            }
        }

        $question->update($data);
        $question->options = $this->formatOptionsWithUrls($question->options);

        return response()->json([
            'message' => 'Savol muvaffaqiyatli yangilandi',
            'data'    => $question,
        ]);
    }

    /**
     * Savolni o‘chirish (barcha fayllar bilan birga).
     */
    public function destroy($id)
    {
        $question = Question::findOrFail($id);

        // Variant rasmlarini o‘chir
        $options = $question->options ?? [];
        foreach ($options as $option) {
            if (!empty($option['image'])) {
                Storage::disk('public')->delete($option['image']);
            }
        }

        // Savolning o‘z rasmi
        if ($question->image_path) {
            Storage::disk('public')->delete($question->image_path);
        }

        // Audio fayl
        if ($question->audio_path) {
            Storage::disk('public')->delete($question->audio_path);
        }

        $question->delete();

        return response()->json(['message' => 'Savol muvaffaqiyatli o\'chirildi']);
    }

    /**
     * Variantlardagi 'image' yo‘lini to‘liq URL bilan to‘ldiradi.
     */
    private function formatOptionsWithUrls(array $options): array
    {
        foreach ($options as &$option) {
            $option['image_url'] = !empty($option['image'])
                ? asset('storage/' . $option['image'])
                : null;
        }
        return $options;
    }
}