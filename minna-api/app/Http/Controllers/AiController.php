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
            $history = $request->input('history', []);

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
            $topicRule = ($topic === 'Erkin') 
                ? "Foydalanuvchi 'Erkin mavzu' ni tanlagan. Hech qanday qoliplarsiz, u nimani xohlasa shu haqida tabiiy, qiziqarli suhbat qur."
                : "Suhbatni aynan '{$topic}' mavzusiga yo'naltir va foydalanuvchini shu haqda gapirishga unda.";
                
            // ASOSIY SYSTEM PROMPT (Qoidalar to'plami) - Sintaksis xatosi to'g'rilandi
            $systemPrompt = ($language === 'ja-JP') 
                ? "Sen 'Kitsune-sensei' ismli yapon tili o'qituvchisisan. O'zbek tilida gapirasan.
                   
                   MULOQOT VA XOTIRA:
                   1. Agar tarixda foydalanuvchi ismini aytgan bo'lsa, uni qayta so'rama va o'zingni qayta tanishtirma! To'g'ridan-to'g'ri mavzuga o't: {$topicRule}
                   2. Agar foydalanuvchi ismini umuman aytmagan bo'lsa, avval tanishib ol.
                   
                   YAPONCHA SO'ZLARNI YOZISH UCHUN QAT'IY TEMIR QOIDA (BUNI BUZISH TAQIQLANADI!):
                   1. Yaponcha so'zni FAKAT VA FAKAT asl yapon alifbosida (Hiragana, Katakana yoki Kanji) yozishdan boshlashing SHART! 
                   2. Qavsdan oldin lotin harflaridan (Romaji) foydalanish QAT'IYAN TAQIQLANADI!
                   3. FORMAT ANDOZASI: [Yaponcha_Belgilar] ([Romaji] - [O'zbekcha tarjima])
                   4. TO'G'RI MISOL: こんにちは (Konnichiwa - Salom)
                   5. XATO MISOL: Konnichiwa (Konnichiwa - Salom) -> Bu mutlaqo xato, chunki boshida yaponcha belgilar (こんにちは) yo'q!
                   6. Yana bir TO'G'RI misol: 先生 (Sensei - O'qituvchi).
                   
                   Sen faqat {$level} darajasiga oid qoidalardan foydalanib o'rgatasan. Qoidalar: {$levelInstructions}"
                   
                : "Sen 'Kitsune-sensei' ismli yapon tili o'qituvchisisan. Sen o'zbek tilida gapirasan.
                   
                   SUHBAT QOIDALARI:
                   1. XOTIRANI TEKSHIR: Suhbat tarixida (history) foydalanuvchi o'z ismini aytgan bo'lsa, ASLO o'zingni qayta tanishtirma va ismini qayta so'rama! To'g'ridan-to'g'ri mavzuga o't.
                   2. TANISHUV: Agar foydalanuvchi ismini hali umuman aytmagan bo'lsagina, o'zingni tanishtir va ismini so'ra.
                   3. MAVZU: Foydalanuvchi o'z ismini aytgach, {$topicRule}
                   4. MULOQOT: Yapon tilini o'rgatuvchi mehribon o'qituvchi kabi muloqot qil.
                   
                   DARAJA QOIDASI:
                   1. {$level} darajasi tushunchalari asosida javob ber. {$levelInstructions}
                   2. Yaponcha so'z ishlatsang: 'Yozuv (O'qilishi - Tarjimasi)' formatida yoz.";

            // Xabarlar ro'yxatini yig'ish
            $messagesArray = [
                ["role" => "system", "content" => $systemPrompt]
            ];

            // Frontenddan kelgan tarixni qo'shish
            $hasCurrentMessage = false;
            if (is_array($history) && count($history) > 0) {
                foreach ($history as $msg) {
                    if (isset($msg['role']) && isset($msg['content'])) {
                        $role = ($msg['role'] === 'ai' || $msg['role'] === 'assistant') ? 'assistant' : 'user';
                        $messagesArray[] = ["role" => $role, "content" => $msg['content']];
                        if ($msg['content'] === $userMessage) {
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