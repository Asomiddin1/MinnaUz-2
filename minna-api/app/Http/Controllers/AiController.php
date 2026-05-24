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

            ChatMessage::create(['user_id' => $user->id, 'role' => 'user', 'message' => $userMessage]);

            // Tilga qarab aniq buyruq beramiz
            // Tilga qarab aniq va mukammal buyruq
$systemPrompt = ($language === 'ja-JP') 
    ? "Sen 'Kitsune-sensei' ismli tajribali va nazokatli yapon tili o'qituvchisisan. Sen faqat Yapon tilida gapirasan. Yapon tili, grammatika, madaniyat yoki umumiy savollar bo'yicha aniq, boy va tushunarli javob ber. O'zbekcha so'zlarni ishlatma. Javoblaringda Kanji, Hiragana va Katakana yozuvlaridan to'g'ri foydalan."
    : "Sen 'Kitsune-sensei' ismli tajribali, dono va nazokatli yapon tili o'qituvchisisan. Sen o'zbek tilida gapirasan.
       Qoidalaring:
       1. Har qanday savolga aniq, qisqa va sifatli javob ber.
       2. Yaponcha so'z yoki ibora ishlatsang, majburiy formatdan foydalan: 'Yozuv (O'qilishi - Tarjimasi)'.
          Masalan: 'こんにちは (Konnichiwa - Salom)'. 
          Yozuvsiz (Kanji/Kana) javob berma.
       3. Agar foydalanuvchi yapon tiliga aloqador bo'lmagan savol bersa, o'z nazakatingni saqlagan holda javob ber.
       4. Har doim o'quvchini rag'batlantiruvchi ohangda javob ber.";
            
            $groqApiKey = env('GROQ_API_KEY'); 
            
            // Kontekstni tozalash uchun faqat sistem prompt va hozirgi xabarni yuboramiz
            $response = Http::withoutVerifying()
                ->withToken($groqApiKey)
                ->post("https://api.groq.com/openai/v1/chat/completions", [
                    "model" => "llama-3.3-70b-versatile",
                    "messages" => [
                        ["role" => "system", "content" => $systemPrompt],
                        ["role" => "user", "content" => $userMessage]
                    ]
                ]);

            if ($response->successful()) {
                $reply = $response->json()['choices'][0]['message']['content'];
                ChatMessage::create(['user_id' => $user->id, 'role' => 'ai', 'message' => $reply]);

                $audioBase64 = null;
                $cleanText = preg_replace('/[*#_()]/', '', $reply);

                // ElevenLabs bloklanganligi uchun ushbu qism kommentga olindi (xatolarni to'xtatish uchun)
                /*
                $elevenLabsKey = env('ELEVENLABS_API_KEY');
                if (!empty($elevenLabsKey)) {
                    $voiceId = 'sB7vwSCyX0tQmU24cW2C';
                    $tts = Http::withHeaders([
                        'xi-api-key' => $elevenLabsKey, 
                        'Content-Type' => 'application/json'
                    ])->post("https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}", [
                        'text' => $cleanText,
                        'model_id' => 'eleven_multilingual_v2',
                        'voice_settings' => ['stability' => 0.5, 'similarity_boost' => 0.75]
                    ]);

                    if ($tts->successful()) {
                        $audioBase64 = base64_encode($tts->body());
                    }
                }
                */

                // Zaxira: Google Translate (har doim ishlaydi)
                if (!$audioBase64) {
                    $langCode = ($language === 'ja-JP') ? 'ja' : 'tr';
                    $tts = Http::withoutVerifying()->get("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=" . urlencode(mb_substr($cleanText, 0, 180)) . "&tl=" . $langCode);
                    if ($tts->successful()) $audioBase64 = base64_encode($tts->body());
                }

                return response()->json(['reply' => $reply, 'audio' => $audioBase64]);
            }
            return response()->json(['reply' => "Xatolik."], 500);
        } catch (\Exception $e) {
            return response()->json(['reply' => "Server xatosi: " . $e->getMessage()], 500);
        }
    }
}