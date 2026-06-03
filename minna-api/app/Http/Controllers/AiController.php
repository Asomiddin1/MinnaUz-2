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

            // ASOSIY SYSTEM PROMPT (Qoidalar to'plami)
            $systemPrompt = ($language === 'ja-JP') 
                ? "Sen 'Kitsune-sensei' ismli yapon tili o'qituvchisisan. Sen faqat Yapon tilida gapirasan. 
                   
                   SUHBAT BOSQICHLARI VA QOIDALAR:
                   1. TANISHUV: Agar foydalanuvchi hali o'z ismini aytib tanishmagan bo'lsa, o'zingni qisqacha tanishtir va uning ismini so'ra. (Agar u qayta-qayta faqat salom bersa, tabiiy alik ol va yana ismini so'ra).
                   2. MAVZUGA O'TISH: DIQQAT! Foydalanuvchi o'zini tanishtirmaguncha '{$topic}' mavzusiga ASLO o'tma! U ismini aytgandan keyingina (ismiga -san qo'shib) '{$topic}' mavzusida suhbatni boshla.
                   3. TAKRORLAMASLIK: Suhbat davomida o'zingni qayta-qayta 'Men Kitsune-senseiman' deb tanishtirma. Bir marta tanishish yetarli. Oldingi gaplarni mantiqan tushunib, to'g'ri javob ber.
                   4. {$topicRule}
                   
                   DARAJA QOIDASI ({$level}): {$levelInstructions}
                   
                   BOSHQA QOIDALAR:
                   - Qat'iy ravishda {$level} darajasi chegarasida javob ber.
                   - MUXIM: Faqat va faqat Kanji, Hiragana va Katakana yozuvlaridan foydalan!
                   - MUXIM: Qavs ichida Romaji (lotin harflari), o'qilishi yoki tarjimasini ASLO YOZMA! Faqat sof yaponcha matn bo'lsin."
                
                : "Sen 'Kitsune-sensei' ismli yapon tili o'qituvchisisan. Sen o'zbek tilida gapirasan.
                   
                   SUHBAT BOSQICHLARI:
                   1. Foydalanuvchi o'z ismini aytmaguncha, mavzuga o'tma, avval tanish.
                   2. U o'zini tanishtirgachgina, {$topicRule}
                   3. O'zingni qayta-qayta tanishtirib yotma.
                   
                   QOIDALAR:
                   1. {$level} darajasi tushunchalari asosida javob ber.
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
            
            // Groq API ga yuborish
            $response = Http::withoutVerifying()
                ->withToken($groqApiKey)
                ->post("https://api.groq.com/openai/v1/chat/completions", [
                    "model" => "llama-3.3-70b-versatile",
                    "messages" => $messagesArray,
                    "temperature" => 0.6, // Mantiqni yaxshi ushlab turishi uchun biroz ko'tarildi
                ]);

            if ($response->successful()) {
                $reply = $response->json()['choices'][0]['message']['content'];
                
                // Bazaga saqlash
                ChatMessage::create([
                    'user_id' => $user->id, 
                    'role' => 'ai', 
                    'message' => $reply
                ]);

                // Matndagi ortiqcha belgilarni (jumladan yaponcha qavslarni ham) tozalash (audio uchun)
                $cleanText = preg_replace('/[*#_()（）]/u', '', $reply);
                $audioBase64 = null;

                // Google Translate TTS
                if (!$audioBase64) {
                    $langCode = ($language === 'ja-JP') ? 'ja' : 'uz';
                    $textToSpeech = urlencode(mb_substr($cleanText, 0, 180));
                    $tts = Http::withoutVerifying()->get("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q={$textToSpeech}&tl={$langCode}");
                    
                    if ($tts->successful()) {
                        $audioBase64 = base64_encode($tts->body());
                    }
                }

                return response()->json(['reply' => $reply, 'audio' => $audioBase64]);
            }
            
            return response()->json(['reply' => "Xatolik yuz berdi. Iltimos qayta urinib ko'ring."], 500);
        } catch (\Exception $e) {
            Log::error("AiController Xatosi: " . $e->getMessage());
            return response()->json(['reply' => "Server xatosi yuz berdi."], 500);
        }
    }
}