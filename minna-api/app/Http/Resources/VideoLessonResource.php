<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoLessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Next.js dan kelgan tillarni olamiz (?lang=uz,ja)
        $langParam = $request->query('lang');
        
        // Spatie paketi orqali barcha tarjimalarni array ko'rinishida olamiz
        $allTranscripts = $this->getTranslations('transcript');

        if ($langParam) {
            $requestedLanguages = explode(',', $langParam);
            // Faqat so'ralgan tillarni qoldiramiz
            $transcript = array_intersect_key($allTranscripts, array_flip($requestedLanguages));
        } else {
            // Agar ?lang berilmasa, hamma tillar ketadi
            $transcript = $allTranscripts;
        }

        return [
            'id'          => $this->id,
            'category'    => $this->category,
            'title'       => $this->title,
            'thumbnail'   => $this->thumbnail,
            'description' => $this->description,
            'youtube_id'  => $this->youtube_id,
            'views'       => $this->views,
            'transcript'  => $transcript, // Dinamik tillar
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}