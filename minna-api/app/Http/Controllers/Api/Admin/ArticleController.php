<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Http\Resources\ArticleResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    /**
     * Barcha maqolalar ro'yxati (Paginatsiya bilan)
     */
    public function index()
    {
        $articles = Article::latest()->paginate(15);
        return ArticleResource::collection($articles);
    }

    /**
     * Bitta maqolani to'liq ko'rish
     */
    public function show($id)
    {
        $article = Article::with(['stats', 'contents', 'vocabularies', 'quizzes.options'])->findOrFail($id);
        
        return new ArticleResource($article);
    }

    /**
     * Yangi maqola va uning barcha qismlarini bazaga saqlash
     */
    public function store(Request $request)
    {
        $this->validateRequest($request);

        DB::beginTransaction();
        try {
            // 1. Asosiy maqolani saqlash
            $article = Article::create([
                'title' => $request->title,
                'level' => $request->level,
                'views' => $request->views ?? 0,
                'image_url' => $request->imageUrl,
                'audio_url' => $request->audioUrl,
                'published_at' => $request->date ? \Carbon\Carbon::createFromFormat('d/m/Y', $request->date) : now(),
            ]);

            // 2. Bog'langan ma'lumotlarni saqlash
            $this->syncRelations($article, $request);

            DB::commit();
            
            // Yangi qo'shilgan maqolani qaytarish
            return new ArticleResource($article->load(['stats', 'contents', 'vocabularies', 'quizzes.options']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Ma\'lumotlarni saqlashda xatolik yuz berdi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Maqolani va uning qismlarini yangilash
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        $this->validateRequest($request);

        DB::beginTransaction();
        try {
            // 1. Asosiy maqolani yangilash
            $article->update([
                'title' => $request->title,
                'level' => $request->level,
                'views' => $request->views ?? $article->views,
                'image_url' => $request->imageUrl,
                'audio_url' => $request->audioUrl,
                'published_at' => $request->date ? \Carbon\Carbon::createFromFormat('d/m/Y', $request->date) : $article->published_at,
            ]);

            // 2. Eski bog'lanishlarni o'chirish (Tozalab, qayta yozish eng toza usul)
            $article->stats()->delete();
            $article->contents()->delete();
            $article->vocabularies()->delete();
            $article->quizzes()->delete(); // Options ham cascadeOnDelete orqali o'chib ketadi

            // 3. Yangi ma'lumotlarni saqlash
            $this->syncRelations($article, $request);

            DB::commit();
            
            return new ArticleResource($article->load(['stats', 'contents', 'vocabularies', 'quizzes.options']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Ma\'lumotlarni yangilashda xatolik yuz berdi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Maqolani o'chirish
     */
    public function destroy($id)
    {
        $article = Article::findOrFail($id);
        
        // Migratsiyada cascadeOnDelete() yozilgani uchun unga bog'liq hamma narsa avtomat o'chib ketadi
        $article->delete(); 

        return response()->json(['message' => 'Maqola muvaffaqiyatli o\'chirildi']);
    }

    /**
     * Yordamchi metod: Validatsiya qilish
     */
    private function validateRequest(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'level' => 'required|string',
            // Arrays (massivlar) tekshiruvi
            'stats' => 'array',
            'content' => 'required|array',
            'vocabulary' => 'array',
            'quizzes' => 'array',
        ]);
    }

    /**
     * Yordamchi metod: Bog'langan jadvallarga yozish
     */
    private function syncRelations(Article $article, Request $request)
    {
        // Statistika
        if ($request->has('stats')) {
            $statsData = array_map(function ($stat) {
                return [
                    'level' => $stat['level'],
                    'percent' => $stat['percent'],
                    'color' => $stat['color'],
                ];
            }, $request->stats);
            $article->stats()->createMany($statsData);
        }

        // Matn (Dokkai) tarkibi
        if ($request->has('content')) {
            $contentsData = array_map(function ($item, $index) {
                return [
                    'sort_order' => $index + 1, // Ketma-ketlikni saqlash
                    'word' => $item['word'],
                    'furigana' => $item['furigana'] ?? null,
                    'translation' => $item['translation'] ?? null,
                    'grammar' => $item['grammar'] ?? null,
                    'level' => $item['level'] ?? null,
                    'paragraph_index' => $item['paragraphIndex'] ?? 1,
                    'sentence_index' => $item['sentenceIndex'] ?? 1,
                ];
            }, $request->content, array_keys($request->content));
            
            $article->contents()->createMany($contentsData);
        }

        // Lug'at
        if ($request->has('vocabulary')) {
            $vocabData = array_map(function ($vocab) {
                return [
                    'kanji' => $vocab['kanji'],
                    'furigana' => $vocab['furigana'] ?? null,
                    'meaning' => $vocab['meaning'],
                    'type' => $vocab['type'] ?? 'Noun',
                    'level' => $vocab['level'] ?? 'N5',
                ];
            }, $request->vocabulary);
            $article->vocabularies()->createMany($vocabData);
        }

        // Testlar (Quizzes)
        if ($request->has('quizzes')) {
            foreach ($request->quizzes as $quizData) {
                $quiz = $article->quizzes()->create([
                    'question' => $quizData['question'],
                    'explanation' => $quizData['explanation'] ?? null,
                ]);

                if (isset($quizData['options']) && is_array($quizData['options'])) {
                    $optionsData = array_map(function ($option) {
                        return [
                            'option_text' => $option['text'],
                            'is_correct' => $option['isCorrect'] ?? false,
                        ];
                    }, $quizData['options']);
                    
                    $quiz->options()->createMany($optionsData);
                }
            }
        }
    }
}