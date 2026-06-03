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

            // DIQQAT: Takrorlashni oldini olish uchun Dinamik Qoida!
            $isFirstMessage = (count($history) <= 1); // Agar tarix bo'sh bo'lsa yoki endi boshlangan bo'lsa
            
            $flowRule = $isFirstMessage 
                ? "SUHBAT BOSHLANISHI: Bu birinchi xabar. O'zingni 'Kitsune-sensei' deb qisqacha, samimiy tanishtir. Foydalanuvchi bilan do'stona ko'rishib, u haqida (masalan ismini) so'ra. Suhbatni sekin-asta '{$topic}' mavzusiga burib yubor."
                : "QAT'IY SHART: O'zingni qayta-qayta tanishtirma! 'Men Kitsune-senseiman' degan gapni UMUMAN ISHLATMA. To'g'ridan-to'g'ri foydalanuvchining gapiga javob ber va '{$topic}' mavzusida suhbatni davom ettir.";

            $topicRule = ($topic === 'Erkin') 
                ? "Foydalanuvchi 'Erkin mavzu' ni tanlagan. Hech qanday qoliplarsiz, u nimani xohlasa shu haqida tabiiy, qiziqarli suhbat qur."
                : "Suhbatni aynan '{$topic}' mavzusiga yo'naltir va foydalanuvchini shu haqda gapirishga unda.";

            // System Prompt
            $systemPrompt = ($language === 'ja-JP') 
                ? "Sen 'Kitsune-sensei' ismli yapon tili o'qituvchisisan. Sen faqat Yapon tilida gapirasan. 
                   
                   {$flowRule}
                   {$topicRule}
                   
                   DARAJA QOIDASI ({$level}): {$levelInstructions}
                   
                   BOSHQA QOIDALAR:
                   1. Qat'iy ravishda {$level} darajasi chegarasida javob ber.
                   2. DIQQAT: Faqat va faqat Kanji, Hiragana va Katakana yozuvlaridan foydalan!
                   3. MUXIM: Qavs ichida Romaji (lotin harflari), o'qilishi yoki tarjimasini ASLO YOZMA! Faqat sof yaponcha matn bo'lsin."
                
                : "Sen 'Kitsune-sensei' ismli yapon tili o'qituvchisisan. Sen o'zbek tilida gapirasan.
                   
                   {$flowRule}
                   {$topicRule}
                   
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

            if (!$hasCurrentMessage && !empty($userMessage)) {
                $messagesArray[] = ["role" => "user", "content" => $userMessage];
            }

            $groqApiKey = env('GROQ_API_KEY'); 
            
            // Groq API
            $response = Http::withoutVerifying()
                ->withToken($groqApiKey)
                ->post("https://api.groq.com/openai/v1/chat/completions", [
                    "model" => "llama-3.3-70b-versatile",
                    "messages" => $messagesArray,
                    "temperature" => 0.5,
                ]);

            if ($response->successful()) {
                $reply = $response->json()['choices'][0]['message']['content'];
                
                ChatMessage::create([
                    'user_id' => $user->id, 
                    'role' => 'ai', 
                    'message' => $reply
                ]);

                // Matndagi ortiqcha belgilarni (jumladan yaponcha qavslarni ham) tozalash (audio uchun)
                $cleanText = preg_replace('/[*#_()（）]/u', '', $reply);
                $audioBase64 = null;

                // Google Translate zaxirasi
                if (!$audioBase64) {
                    $langCode = ($language === 'ja-JP') ? 'ja' : 'tr';
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