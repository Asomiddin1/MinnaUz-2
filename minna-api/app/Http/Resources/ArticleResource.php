<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'level' => $this->level,
            'date' => Carbon::parse($this->published_at)->format('d/m/Y'),
            'views' => $this->views,
            'imageUrl' => $this->image_url,
            'audioUrl' => $this->audio_url, // <-- Audio ulandi
            
            'stats' => $this->stats->map(fn($stat) => [
                'level' => $stat->level,
                'percent' => $stat->percent,
                'color' => $stat->color,
            ]),
            
            'content' => $this->contents->map(fn($item) => [
                'word' => $item->word,
                'furigana' => $item->furigana ?? "",
                'translation' => $item->translation ?? "",
                'grammar' => $item->grammar ?? "",
                'level' => $item->level ?? "",
                'paragraphIndex' => $item->paragraph_index, // Frontend'da CSS da qator tashlash uchun kerak bo'ladi
                'sentenceIndex' => $item->sentence_index,
            ]),
            
            'vocabulary' => $this->vocabularies->map(fn($vocab) => [
                'id' => $vocab->id,
                'kanji' => $vocab->kanji,
                'furigana' => $vocab->furigana ?? "",
                'meaning' => $vocab->meaning,
                'type' => $vocab->type,
                'level' => $vocab->level,
            ]),

            // <-- Quizlar qo'shildi
            'quizzes' => $this->quizzes->map(fn($quiz) => [
                'id' => $quiz->id,
                'question' => $quiz->question,
                'explanation' => $quiz->explanation,
                'options' => $quiz->options->map(fn($option) => [
                    'id' => $option->id,
                    'text' => $option->option_text,
                    'isCorrect' => (bool) $option->is_correct,
                ])
            ]),
        ];
    }
}