<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GroqController extends Controller
{
    /**
     * To'liq grammatika ma'lumotlarini olish
     */
    public function fillGrammar(Request $request)
    {
        $request->validate([
            'grammarTitle' => 'required|string',
            'levelTitle' => 'required|string',
        ]);

        $grammarTitle = $request->grammarTitle;
        $levelTitle = $request->levelTitle;

        $prompt = "
            Quyidagi yapon tili grammatikasi haqida to'liq ma'lumot kerak:
            Grammatika: {$grammarTitle}
            Level: {$levelTitle}

            JSON formatda quyidagi ma'lumotlarni to'ldirib ber:
            {
                \"title\": {
                    \"jp\": \"{$grammarTitle}\",
                    \"uz\": \"o'zbekcha nomi (grammatik qoida nomi)\",
                    \"en\": \"inglizcha nomi\",
                    \"ru\": \"ruscha nomi\"
                },
                \"meaning\": {
                    \"jp\": \"yaponcha ma'nosi va ishlatilishi\",
                    \"uz\": \"o'zbekcha ma'nosi va ishlatilishi\",
                    \"en\": \"inglizcha ma'nosi va ishlatilishi\",
                    \"ru\": \"ruscha ma'nosi va ishlatilishi\"
                },
                \"description\": {
                    \"jp\": \"yaponcha batafsil tavsifi (3-4 jumla, qachon va qanday ishlatilishi haqida)\",
                    \"uz\": \"o'zbekcha batafsil tavsifi (3-4 jumla, qachon va qanday ishlatilishi haqida)\",
                    \"en\": \"inglizcha batafsil tavsifi (3-4 jumla, qachon va qanday ishlatilishi haqida)\",
                    \"ru\": \"ruscha batafsil tavsifi (3-4 jumla, qachon va qanday ishlatilishi haqida)\"
                },
                \"examples\": {
                    \"jp\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"yaponcha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"yaponcha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"yaponcha tarjimasi 3\"}
                    ],
                    \"uz\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"o'zbekcha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"o'zbekcha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"o'zbekcha tarjimasi 3\"}
                    ],
                    \"en\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"inglizcha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"inglizcha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"inglizcha tarjimasi 3\"}
                    ],
                    \"ru\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"ruscha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"ruscha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"ruscha tarjimasi 3\"}
                    ]
                }
            }

            Muhim talablar:
            - Har bir til uchun 3 tadan realistik va foydali misol keltiring
            - Misollar o'sha grammatik qoidaga mos bo'lishi kerak
            - Tarjimalar aniq va to'g'ri bo'lishi kerak
            - Tavsiflar tushunarli va o'quvchilar uchun foydali bo'lishi kerak
            - Faqat JSON qaytar, boshqa hech qanday matn qo'shma
        ";

        return $this->callGroqAPI($prompt);
    }

    /**
     * Faqat grammatika misollarini olish
     */
    public function getExamples(Request $request)
    {
        $request->validate([
            'grammarTitle' => 'required|string',
            'levelTitle' => 'required|string',
        ]);

        $grammarTitle = $request->grammarTitle;
        $levelTitle = $request->levelTitle;

        $prompt = "
            Quyidagi yapon tili grammatikasi uchun misollar kerak:
            Grammatika: {$grammarTitle}
            Level: {$levelTitle}

            JSON formatda faqat misollarni qaytar:
            {
                \"examples\": {
                    \"jp\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"tarjimasi 3\"}
                    ],
                    \"uz\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"o'zbekcha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"o'zbekcha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"o'zbekcha tarjimasi 3\"}
                    ],
                    \"en\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"inglizcha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"inglizcha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"inglizcha tarjimasi 3\"}
                    ],
                    \"ru\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"ruscha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"ruscha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"ruscha tarjimasi 3\"}
                    ]
                }
            }

            Har bir til uchun 3 tadan realistik va foydali misol keltir.
            Faqat JSON qaytar, boshqa matn qo'shma.
        ";

        return $this->callGroqAPI($prompt);
    }

    /**
     * Misollarsiz grammatika ma'lumotlarini to'ldirish
     */
    public function fillGrammarInfo(Request $request)
    {
        $request->validate([
            'grammarTitle' => 'required|string',
            'levelTitle' => 'required|string',
        ]);

        $grammarTitle = $request->grammarTitle;
        $levelTitle = $request->levelTitle;

        $prompt = "
            Quyidagi yapon tili grammatikasi haqida ma'lumot kerak (misollarsiz):
            Grammatika: {$grammarTitle}
            Level: {$levelTitle}

            JSON formatda quyidagi ma'lumotlarni to'ldirib ber:
            {
                \"title\": {
                    \"jp\": \"{$grammarTitle}\",
                    \"uz\": \"o'zbekcha nomi\",
                    \"en\": \"inglizcha nomi\",
                    \"ru\": \"ruscha nomi\"
                },
                \"meaning\": {
                    \"jp\": \"yaponcha ma'nosi va ishlatilishi\",
                    \"uz\": \"o'zbekcha ma'nosi va ishlatilishi\",
                    \"en\": \"inglizcha ma'nosi va ishlatilishi\",
                    \"ru\": \"ruscha ma'nosi va ishlatilishi\"
                },
                \"description\": {
                    \"jp\": \"yaponcha batafsil tavsifi (3-4 jumla)\",
                    \"uz\": \"o'zbekcha batafsil tavsifi (3-4 jumla)\",
                    \"en\": \"inglizcha batafsil tavsifi (3-4 jumla)\",
                    \"ru\": \"ruscha batafsil tavsifi (3-4 jumla)\"
                }
            }

            Faqat JSON qaytar, boshqa matn qo'shma.
        ";

        return $this->callGroqAPI($prompt);
    }

    /**
     * Groq API ga so'rov yuborish (umumiy metod)
     */
    private function callGroqAPI($prompt)
    {
        try {
            // ✅ TO'G'RILANGAN MODEL NOMI
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Sen yapon tili o\'qituvchisisiz va grammatika bo\'yicha mutaxassissan. Har doim aniq, to\'liq va foydali ma\'lumot ber. JSON formatda javob qaytar.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                // ✅ YANGI MODEL: llama-3.3-70b-versatile yoki gemma2-9b-it
                'model' => 'llama-3.3-70b-versatile',  // yoki 'gemma2-9b-it'
                'temperature' => 0.7,
                'max_tokens' => 2000,
                'response_format' => ['type' => 'json_object']
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? '{}';
                $result = json_decode($content, true);

                return response()->json($result);
            }

            // Xatolik logini yozish
            \Log::error('Groq API error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return response()->json([
                'error' => 'Groq API xatosi: ' . $response->status()
            ], 500);

        } catch (\Exception $e) {
            \Log::error('Groq API exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'error' => 'Server xatosi: ' . $e->getMessage()
            ], 500);
        }
    }
}