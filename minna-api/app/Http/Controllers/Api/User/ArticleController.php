<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Http\Resources\ArticleResource;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * 1. Barcha maqolalarni qidiruv va filtr bilan olish (Frontenddagi ro'yxat uchun)
     */
    public function index(Request $request)
    {
        $query = Article::query();

        // Agar qidiruv (search) kelsa, sarlavha bo'yicha izlaymiz
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Agar daraja (level) kelsa va u "Barchasi" bo'lmasa, filtrlaymiz
        if ($request->filled('level') && $request->level !== 'Barchasi') {
            $query->where('level', $request->level);
        }

        // Eng yangilari birinchi chiqadi (paginatsiya 10 ta dan)
        $articles = $query->latest('published_at')->paginate(10);
        
        return ArticleResource::collection($articles);
    }

    /**
     * 2. Bitta maqolani ochib o'qish va ko'rishlar sonini oshirish
     */
    public function show($id)
    {
        // Maqola va unga tegishli barcha so'zlar/testlarni yuklaymiz
        $article = Article::with(['stats', 'contents', 'vocabularies', 'quizzes.options'])->findOrFail($id);
        
        // FOYDALANUVCHI KIRGANI UCHUN KO'RISHLAR SONINI 1 TAGA OSHIRAMIZ
        $article->increment('views');

        return new ArticleResource($article);
    }

    /**
     * 3. (Kelajak uchun) Testni ishlagach, natijani qabul qilib saqlash
     */
    public function submitQuiz(Request $request, $id)
    {
        $request->validate([
            'answers' => 'required|array', // User belgilagan javoblar ID lari
        ]);

        // Bu yerda userning javoblari bazadagi to'g'ri javoblar bilan tekshirilib, 
        // necha foiz to'g'ri topgani hisoblanadi va uning statistikasiga saqlanadi.
        
        return response()->json(['message' => 'Natija muvaffaqiyatli saqlandi!']);
    }
}