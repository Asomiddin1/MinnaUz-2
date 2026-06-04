<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqController extends Controller
{
    /**
     * To'liq grammatika ma'lumotlarini olish - 10 ta misol bilan
     */
    public function fillGrammar(Request $request)
    {
        $request->validate([
            'grammarTitle' => 'required|string',
            'levelTitle' => 'required|string',
        ]);

        $grammarTitle = $request->grammarTitle;
        $levelTitle = $request->levelTitle;

        $kanjiLevel = $this->getKanjiLevel($levelTitle);

        $prompt = "
            Quyidagi yapon tili grammatikasi haqida to'liq ma'lumot kerak:
            Grammatika: {$grammarTitle}
            Level: {$levelTitle}

            **GRAMMATIKA FORMULASI:**
            Har bir grammatik qoida uchun quyidagi formulalarni keltiring:
            1. Ijobiy shakl (affirmative): [Formula]
            2. Bo'lishsiz shakl (negative): [Formula]
            3. O'tgan zamon (past): [Formula]
            4. Bog'lash shakli (te_form): [Formula]

            **MUHIM: Formula namunasi ko'rinishi:**
            Har bir formula qatori quyidagi tarzda bo'lishi SHART:
            - affirmative: \"V（辞書形）+ ことがある\"
            - negative: \"V（ない形）+ ことがある\"
            - past: \"V（た形）+ ことがある\"
            - te_form: \"V（て形）+ ことがある\"

            Ya'ni formula maydoni faqat formulaning o'zini (masalan: \"V（て形）+ てもいいですか\") o'z ichiga olsin.

            **formula.description ichida esa har bir formula uchun alohida qator bo'lsin:**
            Namuna (uz uchun):
            \"【Ijobiy shakl】V（辞書形）+ ことがある — fe'lning lug'at shakliga + koto ga aru qo'shiladi. Bu shakl ba'zan biror ish bo'lib turishini bildiradi.\\n【Bo'lishsiz shakl】V（ない形）+ ことがある — fe'lning nai shakliga + koto ga aru qo'shiladi.\\n【O'tgan zamon】V（た形）+ ことがある — fe'lning ta shakliga + koto ga aru qo'shiladi.\\n【Bog'lash shakli】V（て形）+ ことがある — fe'lning te shakliga + koto ga aru qo'shiladi.\"

            **KANJI CHEGARALANISHI:**
            Daraja: {$levelTitle} — faqat {$kanjiLevel['kanji_limit']} ta asosiy kanji ishlating.

            JSON formatda quyidagi ma'lumotlarni to'ldirib ber:
            {
                \"title\": {
                    \"jp\": \"{$grammarTitle}\",
                    \"uz\": \"o'zbekcha nomi\",
                    \"en\": \"inglizcha nomi\",
                    \"ru\": \"ruscha nomi\"
                },
                \"formula\": {
                    \"affirmative\": \"V（...形）+ {$grammarTitle} ko'rinishida ijobiy shakl formulasi\",
                    \"negative\": \"V（...形）+ {$grammarTitle} ko'rinishida bo'lishsiz shakl formulasi\",
                    \"past\": \"V（...形）+ {$grammarTitle} ko'rinishida o'tgan zamon formulasi\",
                    \"te_form\": \"V（...形）+ {$grammarTitle} ko'rinishida bog'lash shakli formulasi\",
                    \"description\": {
                        \"uz\": \"【Ijobiy shakl】<affirmative formula> — tushuntirish.\\n【Bo'lishsiz shakl】<negative formula> — tushuntirish.\\n【O'tgan zamon】<past formula> — tushuntirish.\\n【Bog'lash shakli】<te_form formula> — tushuntirish.\",
                        \"en\": \"【Affirmative】<affirmative formula> — explanation.\\n【Negative】<negative formula> — explanation.\\n【Past】<past formula> — explanation.\\n【Te-form】<te_form formula> — explanation.\",
                        \"ru\": \"【Утвердительная】<affirmative formula> — объяснение.\\n【Отрицательная】<negative formula> — объяснение.\\n【Прошедшее】<past formula> — объяснение.\\n【Форма て】<te_form formula> — объяснение.\"
                    }
                },
                \"meaning\": {
                    \"jp\": \"yaponcha ma'nosi (faqat darajaga mos kanjilar)\",
                    \"uz\": \"o'zbekcha ma'nosi va ishlatilishi\",
                    \"en\": \"inglizcha ma'nosi va ishlatilishi\",
                    \"ru\": \"ruscha ma'nosi va ishlatilishi\"
                },
                \"description\": {
                    \"jp\": \"yaponcha batafsil tavsifi (3-4 jumla, faqat {$kanjiLevel['kanji_limit']} darajadagi kanjilar)\",
                    \"uz\": \"o'zbekcha batafsil tavsifi (3-4 jumla)\",
                    \"en\": \"inglizcha batafsil tavsifi (3-4 jumla)\",
                    \"ru\": \"ruscha batafsil tavsifi (3-4 jumla)\"
                },
                \"examples\": {
                    \"jp\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"tarjimasi 3\"},
                        {\"jp\": \"yaponcha misol 4\", \"translation\": \"tarjimasi 4\"},
                        {\"jp\": \"yaponcha misol 5\", \"translation\": \"tarjimasi 5\"},
                        {\"jp\": \"yaponcha misol 6\", \"translation\": \"tarjimasi 6\"},
                        {\"jp\": \"yaponcha misol 7\", \"translation\": \"tarjimasi 7\"},
                        {\"jp\": \"yaponcha misol 8\", \"translation\": \"tarjimasi 8\"},
                        {\"jp\": \"yaponcha misol 9\", \"translation\": \"tarjimasi 9\"},
                        {\"jp\": \"yaponcha misol 10\", \"translation\": \"tarjimasi 10\"}
                    ],
                    \"uz\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"o'zbekcha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"o'zbekcha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"o'zbekcha tarjimasi 3\"},
                        {\"jp\": \"yaponcha misol 4\", \"translation\": \"o'zbekcha tarjimasi 4\"},
                        {\"jp\": \"yaponcha misol 5\", \"translation\": \"o'zbekcha tarjimasi 5\"},
                        {\"jp\": \"yaponcha misol 6\", \"translation\": \"o'zbekcha tarjimasi 6\"},
                        {\"jp\": \"yaponcha misol 7\", \"translation\": \"o'zbekcha tarjimasi 7\"},
                        {\"jp\": \"yaponcha misol 8\", \"translation\": \"o'zbekcha tarjimasi 8\"},
                        {\"jp\": \"yaponcha misol 9\", \"translation\": \"o'zbekcha tarjimasi 9\"},
                        {\"jp\": \"yaponcha misol 10\", \"translation\": \"o'zbekcha tarjimasi 10\"}
                    ],
                    \"en\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"inglizcha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"inglizcha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"inglizcha tarjimasi 3\"},
                        {\"jp\": \"yaponcha misol 4\", \"translation\": \"inglizcha tarjimasi 4\"},
                        {\"jp\": \"yaponcha misol 5\", \"translation\": \"inglizcha tarjimasi 5\"},
                        {\"jp\": \"yaponcha misol 6\", \"translation\": \"inglizcha tarjimasi 6\"},
                        {\"jp\": \"yaponcha misol 7\", \"translation\": \"inglizcha tarjimasi 7\"},
                        {\"jp\": \"yaponcha misol 8\", \"translation\": \"inglizcha tarjimasi 8\"},
                        {\"jp\": \"yaponcha misol 9\", \"translation\": \"inglizcha tarjimasi 9\"},
                        {\"jp\": \"yaponcha misol 10\", \"translation\": \"inglizcha tarjimasi 10\"}
                    ],
                    \"ru\": [
                        {\"jp\": \"yaponcha misol 1\", \"translation\": \"ruscha tarjimasi 1\"},
                        {\"jp\": \"yaponcha misol 2\", \"translation\": \"ruscha tarjimasi 2\"},
                        {\"jp\": \"yaponcha misol 3\", \"translation\": \"ruscha tarjimasi 3\"},
                        {\"jp\": \"yaponcha misol 4\", \"translation\": \"ruscha tarjimasi 4\"},
                        {\"jp\": \"yaponcha misol 5\", \"translation\": \"ruscha tarjimasi 5\"},
                        {\"jp\": \"yaponcha misol 6\", \"translation\": \"ruscha tarjimasi 6\"},
                        {\"jp\": \"yaponcha misol 7\", \"translation\": \"ruscha tarjimasi 7\"},
                        {\"jp\": \"yaponcha misol 8\", \"translation\": \"ruscha tarjimasi 8\"},
                        {\"jp\": \"yaponcha misol 9\", \"translation\": \"ruscha tarjimasi 9\"},
                        {\"jp\": \"yaponcha misol 10\", \"translation\": \"ruscha tarjimasi 10\"}
                    ]
                }
            }

            Muhim talablar:
            - formula.affirmative, negative, past, te_form maydonlarida FAQAT formula yozing (masalan: \"V（て形）+ てもいいですか\")
            - formula.description ichida har bir formula uchun【...】belgisi bilan alohida qator yozing va formulani ham takrorlang
            - Har bir til uchun 10 tadan realistik misol keltiring (JAMI 40 misol)
            - Yaponcha matnlarda faqat {$kanjiLevel['kanji_limit']} darajadagi kanjilarni ishlating
            - Faqat JSON qaytar, boshqa hech qanday matn qo'shma
        ";

        return $this->callGroqAPI($prompt);
    }

    /**
     * Faqat grammatika misollarini olish - 10 ta misol bilan
     */
    public function getExamples(Request $request)
    {
        $request->validate([
            'grammarTitle' => 'required|string',
            'levelTitle' => 'required|string',
        ]);

        $grammarTitle = $request->grammarTitle;
        $levelTitle = $request->levelTitle;

        $kanjiLevel = $this->getKanjiLevel($levelTitle);

        $prompt = "
            Quyidagi yapon tili grammatikasi uchun misollar kerak:
            Grammatika: {$grammarTitle}
            Level: {$levelTitle}

            **MUHIM: Formula ko'rinishi:**
            - affirmative, negative, past, te_form maydonlarida FAQAT formulaning o'zini yozing:
              Masalan: \"V（て形）+ てもいいですか\", \"V（ない形）+ てもいいですか\"
            - formula.description ichida esa har bir formula【...】belgisi bilan alohida qatorda, formulani ham ko'rsatib, tushuntirib bering.

            **KANJI CHEGARALANISHI: {$kanjiLevel['level_name']} — faqat {$kanjiLevel['kanji_limit']} ta kanji**

            JSON formatda quyidagi ma'lumotlarni qaytar:
            {
                \"formula\": {
                    \"affirmative\": \"V（...形）+ {$grammarTitle} ko'rinishida ijobiy shakl formulasi\",
                    \"negative\": \"V（...形）+ {$grammarTitle} ko'rinishida bo'lishsiz shakl formulasi\",
                    \"past\": \"V（...形）+ {$grammarTitle} ko'rinishida o'tgan zamon formulasi\",
                    \"te_form\": \"V（...形）+ {$grammarTitle} ko'rinishida bog'lash shakli formulasi\",
                    \"description\": {
                        \"uz\": \"【Ijobiy shakl】<formula> — tushuntirish.\\n【Bo'lishsiz shakl】<formula> — tushuntirish.\\n【O'tgan zamon】<formula> — tushuntirish.\\n【Bog'lash shakli】<formula> — tushuntirish.\",
                        \"en\": \"【Affirmative】<formula> — explanation.\\n【Negative】<formula> — explanation.\\n【Past】<formula> — explanation.\\n【Te-form】<formula> — explanation.\",
                        \"ru\": \"【Утвердительная】<formula> — объяснение.\\n【Отрицательная】<formula> — объяснение.\\n【Прошедшее】<formula> — объяснение.\\n【Форма て】<formula> — объяснение.\"
                    }
                },
                \"examples\": {
                    \"jp\": [
                        {\"jp\": \"misol 1 (faqat {$kanjiLevel['kanji_limit']} darajadagi kanjilar)\", \"translation\": \"tarjimasi 1\"},
                        {\"jp\": \"misol 2\", \"translation\": \"tarjimasi 2\"},
                        {\"jp\": \"misol 3\", \"translation\": \"tarjimasi 3\"},
                        {\"jp\": \"misol 4\", \"translation\": \"tarjimasi 4\"},
                        {\"jp\": \"misol 5\", \"translation\": \"tarjimasi 5\"},
                        {\"jp\": \"misol 6\", \"translation\": \"tarjimasi 6\"},
                        {\"jp\": \"misol 7\", \"translation\": \"tarjimasi 7\"},
                        {\"jp\": \"misol 8\", \"translation\": \"tarjimasi 8\"},
                        {\"jp\": \"misol 9\", \"translation\": \"tarjimasi 9\"},
                        {\"jp\": \"misol 10\", \"translation\": \"tarjimasi 10\"}
                    ],
                    \"uz\": [
                        {\"jp\": \"misol 1\", \"translation\": \"o'zbekcha 1\"},
                        {\"jp\": \"misol 2\", \"translation\": \"o'zbekcha 2\"},
                        {\"jp\": \"misol 3\", \"translation\": \"o'zbekcha 3\"},
                        {\"jp\": \"misol 4\", \"translation\": \"o'zbekcha 4\"},
                        {\"jp\": \"misol 5\", \"translation\": \"o'zbekcha 5\"},
                        {\"jp\": \"misol 6\", \"translation\": \"o'zbekcha 6\"},
                        {\"jp\": \"misol 7\", \"translation\": \"o'zbekcha 7\"},
                        {\"jp\": \"misol 8\", \"translation\": \"o'zbekcha 8\"},
                        {\"jp\": \"misol 9\", \"translation\": \"o'zbekcha 9\"},
                        {\"jp\": \"misol 10\", \"translation\": \"o'zbekcha 10\"}
                    ],
                    \"en\": [
                        {\"jp\": \"misol 1\", \"translation\": \"english 1\"},
                        {\"jp\": \"misol 2\", \"translation\": \"english 2\"},
                        {\"jp\": \"misol 3\", \"translation\": \"english 3\"},
                        {\"jp\": \"misol 4\", \"translation\": \"english 4\"},
                        {\"jp\": \"misol 5\", \"translation\": \"english 5\"},
                        {\"jp\": \"misol 6\", \"translation\": \"english 6\"},
                        {\"jp\": \"misol 7\", \"translation\": \"english 7\"},
                        {\"jp\": \"misol 8\", \"translation\": \"english 8\"},
                        {\"jp\": \"misol 9\", \"translation\": \"english 9\"},
                        {\"jp\": \"misol 10\", \"translation\": \"english 10\"}
                    ],
                    \"ru\": [
                        {\"jp\": \"misol 1\", \"translation\": \"ruscha 1\"},
                        {\"jp\": \"misol 2\", \"translation\": \"ruscha 2\"},
                        {\"jp\": \"misol 3\", \"translation\": \"ruscha 3\"},
                        {\"jp\": \"misol 4\", \"translation\": \"ruscha 4\"},
                        {\"jp\": \"misol 5\", \"translation\": \"ruscha 5\"},
                        {\"jp\": \"misol 6\", \"translation\": \"ruscha 6\"},
                        {\"jp\": \"misol 7\", \"translation\": \"ruscha 7\"},
                        {\"jp\": \"misol 8\", \"translation\": \"ruscha 8\"},
                        {\"jp\": \"misol 9\", \"translation\": \"ruscha 9\"},
                        {\"jp\": \"misol 10\", \"translation\": \"ruscha 10\"}
                    ]
                }
            }

            Muhim talablar:
            - formula.affirmative/negative/past/te_form — FAQAT formula yozing (masalan: \"V（て形）+ てもいいですか\")
            - formula.description — har bir formula uchun【...】belgisi bilan alohida qator, formulani ham ko'rsating
            - Har bir til uchun 10 tadan realistik misol
            - Yaponcha misollarda faqat {$kanjiLevel['kanji_limit']} darajadagi kanjilarni ishlating
            - Faqat JSON qaytar, boshqa matn qo'shma
        ";

        return $this->callGroqAPI($prompt);
    }

    /**
     * Misollarsiz grammatika ma'lumotlarini to'ldirish - formula bilan
     */
    public function fillGrammarInfo(Request $request)
    {
        $request->validate([
            'grammarTitle' => 'required|string',
            'levelTitle' => 'required|string',
        ]);

        $grammarTitle = $request->grammarTitle;
        $levelTitle = $request->levelTitle;

        $kanjiLevel = $this->getKanjiLevel($levelTitle);

        $prompt = "
            Quyidagi yapon tili grammatikasi haqida ma'lumot kerak (misollarsiz):
            Grammatika: {$grammarTitle}
            Level: {$levelTitle}

            **MUHIM: Formula ko'rinishi:**
            - affirmative, negative, past, te_form maydonlarida FAQAT formulaning o'zini yozing:
              Masalan: \"V（て形）+ てもいいですか\", \"V（ない形）+ てもいいですか\"
            - formula.description ichida esa har bir formula【...】belgisi bilan alohida qatorda,
              formulani ham ko'rsatib, batafsil tushuntirib bering.

            **KANJI CHEGARALANISHI: {$kanjiLevel['level_name']} — faqat {$kanjiLevel['kanji_limit']} ta asosiy kanji**

            JSON formatda quyidagi ma'lumotlarni to'ldirib ber:
            {
                \"title\": {
                    \"jp\": \"{$grammarTitle}\",
                    \"uz\": \"o'zbekcha nomi\",
                    \"en\": \"inglizcha nomi\",
                    \"ru\": \"ruscha nomi\"
                },
                \"formula\": {
                    \"affirmative\": \"V（...形）+ {$grammarTitle} ko'rinishida ijobiy shakl formulasi\",
                    \"negative\": \"V（...形）+ {$grammarTitle} ko'rinishida bo'lishsiz shakl formulasi\",
                    \"past\": \"V（...形）+ {$grammarTitle} ko'rinishida o'tgan zamon formulasi\",
                    \"te_form\": \"V（...形）+ {$grammarTitle} ko'rinishida bog'lash shakli formulasi\",
                    \"description\": {
                        \"uz\": \"【Ijobiy shakl】<formula> — tushuntirish.\\n【Bo'lishsiz shakl】<formula> — tushuntirish.\\n【O'tgan zamon】<formula> — tushuntirish.\\n【Bog'lash shakli】<formula> — tushuntirish.\",
                        \"en\": \"【Affirmative】<formula> — explanation.\\n【Negative】<formula> — explanation.\\n【Past】<formula> — explanation.\\n【Te-form】<formula> — explanation.\",
                        \"ru\": \"【Утвердительная】<formula> — объяснение.\\n【Отрицательная】<formula> — объяснение.\\n【Прошедшее】<formula> — объяснение.\\n【Форма て】<formula> — объяснение.\"
                    }
                },
                \"meaning\": {
                    \"jp\": \"yaponcha ma'nosi (faqat {$kanjiLevel['kanji_limit']} darajadagi kanjilar)\",
                    \"uz\": \"o'zbekcha ma'nosi va ishlatilishi\",
                    \"en\": \"inglizcha ma'nosi va ishlatilishi\",
                    \"ru\": \"ruscha ma'nosi va ishlatilishi\"
                },
                \"description\": {
                    \"jp\": \"yaponcha batafsil tavsifi (3-4 jumla, faqat {$kanjiLevel['kanji_limit']} darajadagi kanjilar)\",
                    \"uz\": \"o'zbekcha batafsil tavsifi (3-4 jumla)\",
                    \"en\": \"inglizcha batafsil tavsifi (3-4 jumla)\",
                    \"ru\": \"ruscha batafsil tavsifi (3-4 jumla)\"
                }
            }

            Muhim talablar:
            - formula.affirmative/negative/past/te_form — FAQAT formula yozing (masalan: \"V（て形）+ てもいいですか\")
            - formula.description — har bir formula uchun【...】belgisi bilan alohida qator, formulani ham ko'rsating
            - Yaponcha matnlarda faqat {$kanjiLevel['level_name']} darajasiga mos kanjilarni ishlating
            - Faqat JSON qaytar, boshqa matn qo'shma
        ";

        return $this->callGroqAPI($prompt);
    }

    /**
     * Yaponcha matnni Dokkai formati uchun so'zlar massiviga aylantiradi (AI orqali).
     */
    public function generateDokkaiContent(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
        ]);

        $rawText = $request->text;
        
        $prompt = "You are a professional Japanese language tutor. 
        Analyze the following Japanese text and break it down word by word, including particles, into a strict JSON array.
        
        Rules:
        1. Every single word and particle must be a separate object.
        2. Provide 'furigana' only for kanji. If the word is hiragana/katakana, leave 'furigana' empty.
        3. Provide 'translation' in Uzbek.
        4. Provide 'grammar' (e.g., Ot, Fe'l, Sifat, Yuklama, Qo'shimcha).
        5. Provide 'level' (N5, N4, N3, N2, N1) if applicable, otherwise empty string.
        6. Determine 'sentenceIndex' (which sentence it belongs to, starting from 1).
        7. Punctuation marks (。 , 、) should also be separate objects with grammar 'Tinish belgisi' and empty translation/level.
        
        Text to analyze: '{$rawText}'

        Respond ONLY with a valid JSON format exactly like this example, nothing else:
        {
          \"content\": [
            { \"word\": \"私\", \"furigana\": \"わたし\", \"translation\": \"Men\", \"grammar\": \"Olmosh\", \"level\": \"N5\", \"paragraphIndex\": 1, \"sentenceIndex\": 1 },
            { \"word\": \"は\", \"furigana\": \"\", \"translation\": \"(Ega yuklamasi)\", \"grammar\": \"Yuklama\", \"level\": \"\", \"paragraphIndex\": 1, \"sentenceIndex\": 1 },
            { \"word\": \"学生\", \"furigana\": \"がくせい\", \"translation\": \"Talaba\", \"grammar\": \"Ot\", \"level\": \"N5\", \"paragraphIndex\": 1, \"sentenceIndex\": 1 },
            { \"word\": \"です\", \"furigana\": \"\", \"translation\": \"man\", \"grammar\": \"Qo'shimcha\", \"level\": \"\", \"paragraphIndex\": 1, \"sentenceIndex\": 1 },
            { \"word\": \"。\", \"furigana\": \"\", \"translation\": \"\", \"grammar\": \"Tinish belgisi\", \"level\": \"\", \"paragraphIndex\": 1, \"sentenceIndex\": 1 }
          ]
        }";

        return $this->callGroqAPI($prompt);
    }

    /**
     * Darajaga qarab kanji chegarasini aniqlash
     */
    private function getKanjiLevel($level)
    {
        $levels = [
            'N5' => [
                'level_name' => 'Boshlang\'ich daraja (N5)',
                'kanji_limit' => 80,
                'description' => 'Eng asosiy kanjilar: 人, 日, 月, 火, 水, 木, 金, 土, 大, 小 etc.'
            ],
            'N4' => [
                'level_name' => 'O\'rta daraja (N4)',
                'kanji_limit' => 170,
                'description' => 'Asosiy kanjilar: 週, 曜, 語, 勉強, 飲, 食, 行, 来 etc.'
            ],
            'N3' => [
                'level_name' => 'Yuqori o\'rta daraja (N3)',
                'kanji_limit' => 370,
                'description' => 'Kengaytirilgan kanjilar: 問題, 説明, 練習, 質問 etc.'
            ],
            'N2' => [
                'level_name' => 'Yuqori daraja (N2)',
                'kanji_limit' => 1240,
                'description' => 'Murakkab kanjilar: 経験, 態度, 課題, 調査 etc.'
            ],
            'N1' => [
                'level_name' => 'Eng yuqori daraja (N1)',
                'kanji_limit' => 2136,
                'description' => 'Eng murakkab kanjilar: 醍醐味, 鬱, 顰蹙, 贅沢 etc.'
            ]
        ];

        return $levels[$level] ?? $levels['N5'];
    }

    /**
     * Groq API ga so'rov yuborish (umumiy metod)
     */
    private function callGroqAPI($prompt)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Sen yapon tili o\'qituvchisisiz va mutaxassissan. Har doim aniq, to\'liq va foydali ma\'lumot ber. Faqat valid JSON formatda javob qaytar.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'model' => 'llama-3.3-70b-versatile',
                'temperature' => 0.5,
                'max_tokens' => 4000,
                'response_format' => ['type' => 'json_object']
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? '{}';
                $result = json_decode($content, true);

                return response()->json($result);
            }

            Log::error('Groq API error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return response()->json([
                'error' => 'Groq API xatosi: ' . $response->status()
            ], 500);

        } catch (\Exception $e) {
            Log::error('Groq API exception', [
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