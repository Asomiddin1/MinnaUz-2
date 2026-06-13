<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ChatMessage;

class AiController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $userMessage = $request->input('message');
            $user = $request->user(); 
            
            // Foydalanuvchi tizimga kirmagan bo'lsa, xatolik qaytarish
            if (!$user) {
                return response()->json(['reply' => "Foydalanuvchi avtorizatsiyadan o'tmagan."], 401);
            }

            $language = $request->input('lang', 'uz-UZ');
            
            // Frontenddan kelayotgan parametrlar
            $topic = $request->input('topic', 'Erkin');
            $level = $request->input('level', 'N5');
            // $history = $request->input('history', []);
            // Yaxshiroq:
            $history = is_array($request->input('history')) ? $request->input('history') : [];

            // Darajaga qarab qoidalar
            $levelInstructions = "";
            switch($level) {
                case 'N5':
                    $levelInstructions = "Juda oddiy boshlang'ich so'zlar, qisqa gaplar va 'Desu / Masu' shaklidan foydalan. Qiyin Kanji ishlatma.";
                    break;
                case 'N4':
                    $levelInstructions = "Boshlang'ich-o'rta daraja. Kundalik hayotiy so'zlar, 'te-form', 'ta-form' kabi oddiy grammatikadan foydalan.";
                    break;
                case 'N3':
                    $levelInstructions = "O'rta daraja. Turli xil fe'l shakllari, kundalik o'rta daraja so'z va Kanjilar ishlating. Tabiiy yapon tiliga yaqin gapir.";
                    break;
                case 'N2':
                    $levelInstructions = "Yuqori daraja. Murakkab grammatika, boy va ilmiy/ish so'z boyligi, Keigo va murakkab Kanjilardan erkin foydalan.";
                    break;
                default:
                    $levelInstructions = "Talabaning darajasiga mos tushunarli tilda javob ber.";
            }

            // Xabarni bazaga saqlash
            ChatMessage::create([
                'user_id' => $user->id, 
                'role' => 'user', 
                'message' => $userMessage
            ]);

           // MAVZU QOIDASI
            $topicRule = "";
            switch($topic) {
                case 'Tanishtiruv':
                    $topicRule = "Mavzu: Tanishtiruv. Foydalanuvchi bilan yaqindan tanishishga harakat qil. Ismini oldin aytgan bo'lsa qayta so'rama, lekin uning yoshi, qayerdanligi, kasbi, hobbilari va qiziqishlari haqida so'rab, suhbatni chuqurlashtir.";
                    break;
                case 'Oila':
                    $topicRule = "Mavzu: Oila. Suhbatni faqat oila haqida olib bor. Oila a'zolari nechta, ota-onasi, aka-ukalari bormi, ularning kasbi nima kabi savollar ber.";
                    break;
                case 'Ish':
                    $topicRule = "Mavzu: Ish va O'qish. Foydalanuvchining ishi yoki o'qishi, kasbi, ish joyidagi holati yoki kelajakdagi maqsadlari haqida gaplash.";
                    break;
                case 'Ko\'cha':
                    $topicRule = "Mavzu: Ko'cha. Ko'chada manzil so'rash, transportlar (avtobus, metro) va yo'nalishlarni tushuntirish bilan bog'liq vaziyatli suhbat qur.";
                    break;
                default: // Erkin
                    $topicRule = "Foydalanuvchi 'Erkin mavzu' ni tanlagan. Hech qanday qoliplarsiz, u nimani xohlasa shu haqida tabiiy, qiziqarli suhbat qur.";
            }
                
            // ASOSIY SYSTEM PROMPT (Qoidalar to'plami) - Sintaksis xatosi to'g'rilandi
            // ASOSIY SYSTEM PROMPT
            $systemPrompt = "Sen 'Kitsune-sensei' ismli yapon tili o'qituvchisisan. Sen o'zbek tilida gapirasan.
                   
SUHBAT VA XOTIRA QOIDALARI:
1. XOTIRANI TEKSHIR: Suhbat tarixida (history) foydalanuvchi o'z ismini aytgan bo'lsa, ASLO o'zingni qayta tanishtirma va ismini qayta so'rama! To'g'ridan-to'g'ri mavzuga o't: {$topicRule}
2. TANISHUV: Agar foydalanuvchi ismini hali umuman aytmagan bo'lsagina, o'zingни tanishtir va ismini so'ra.
3. MULOQOT: Yapon tilini o'rgatuvchi mehribon o'qituvchi kabi muloqot qil.

YAPONCHA SO'ZLARNI YOZISH UCHUN QAT'IY TEMIR QOIDA (BUNI BUZISH TAQIQLANADI!):
1. Yaponcha so'zlarni FAKAT VA FAKAT asl yapon alifbosida (Hiragana, Katakana yoki Kanji) yozishing SHART! 
2. Hech qanday qavslar, Romaji (lotin harflari) yoki o'zbekcha tarjimalarni ishlata ko'rma! Yaponcha so'zlar faqat toza yaponcha yozuvda bo'lsin.
3. TO'G'RI MISOL: こんにちは！お元気ですか？
4. XATO MISOL: こんにちは (Konnichiwa - Salom) -> Bu mutlaqo xato, chunki qavslar, romaji va tarjima aralashtirilgan! Faqat yaponchasini qoldir.

DARAJA QOIDASI:
1. {$level} darajasi tushunchalari asosida javob ber. {$levelInstructions}";
            // Xabarlar ro'yxatini yig'ish
            $messagesArray = [
                ["role" => "system", "content" => $systemPrompt]
            ];

            // Frontenddan kelgan tarixni qo'shish
            // Frontenddan kelgan tarixni qo'shish
            $hasCurrentMessage = false;
            if (is_array($history) && count($history) > 0) {
                foreach ($history as $msg) {
                    $msgText = $msg['content'] ?? $msg['text'] ?? null;
                    if (isset($msg['role']) && $msgText) {
                        $role = ($msg['role'] === 'ai' || $msg['role'] === 'assistant') ? 'assistant' : 'user';
                        $messagesArray[] = ["role" => $role, "content" => $msgText];
                        if ($msgText === $userMessage) {
                            $hasCurrentMessage = true;
                        }
                    }
                }
            }

            // Agar history'da xabar bo'lmasa, qo'lda qo'shamiz
            if (!$hasCurrentMessage && !empty($userMessage)) {
                $messagesArray[] = ["role" => "user", "content" => $userMessage];
            }

            $groqApiKey = env('GROQ_API_KEY'); 
            
            if (!$groqApiKey) {
                 Log::error("Groq API kaliti topilmadi.");
                 return response()->json(['reply' => "Server sozlamalarida xatolik."], 500);
            }
            
            // Groq API ga yuborish
            $response = Http::withoutVerifying()
                ->withToken($groqApiKey)
                ->post("https://api.groq.com/openai/v1/chat/completions", [
                    "model" => "llama-3.3-70b-versatile",
                    "messages" => $messagesArray,
                    "temperature" => 0.6,
                ]);

            if ($response->successful()) {
                $reply = $response->json()['choices'][0]['message']['content'];
                
                // Bazaga saqlash
                ChatMessage::create([
                    'user_id' => $user->id, 
                    'role' => 'assistant', // Odatda 'ai' o'rniga standard 'assistant' ishlatiladi 
                    'message' => $reply
                ]);

                // Matndagi ortiqcha belgilarni (jumladan yaponcha qavslarni ham) tozalash (audio uchun)
                $cleanText = preg_replace('/[*#_()（）]/u', '', $reply);
                $audioBase64 = null;

                // Google Translate TTS
                $langCode = ($language === 'ja-JP') ? 'ja' : 'uz';
                $textToSpeech = urlencode(mb_substr($cleanText, 0, 180));
                $tts = Http::withoutVerifying()->get("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q={$textToSpeech}&tl={$langCode}");
                
                if ($tts->successful()) {
                    $audioBase64 = base64_encode($tts->body());
                }

                return response()->json(['reply' => $reply, 'audio' => $audioBase64]);
            }
            
            Log::error("Groq API xatosi: " . $response->body());
            return response()->json(['reply' => "AI xizmati xatolik qaytardi. Iltimos qayta urinib ko'ring."], 500);
            
        } catch (\Exception $e) {
            Log::error("AiController Xatosi: " . $e->getMessage() . " Line: " . $e->getLine());
            return response()->json(['reply' => "Server xatosi yuz berdi."], 500);
        }
    }
}