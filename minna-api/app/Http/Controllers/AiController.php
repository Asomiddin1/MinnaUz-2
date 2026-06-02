<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\ChatMessage;

class AiController extends Controller
{
    public function chat(Request $request)
{
    try {
        $userMessage = $request->input('message');
        $user = $request->user();
        $language = $request->input('lang', 'uz-UZ');
        $level = $request->input('level', 'N5');
        $topic = $request->input('topic', 'Erkin suhbat');

        if ($user) {
            ChatMessage::create([
                'user_id' => $user->id,
                'role' => 'user',
                'message' => $userMessage
            ]);
        }

        $systemPrompt = ($language === 'ja-JP')
            ? "Sen 'Kitsune-sensei' ismli tajribali va nazokatli yapon tili o'qituvchisisan.
               Sening qoidalaring:
               1. O'quvchining JLPT darajasi: {$level}.
               2. Faqat {$level} darajasiga mos yaponcha so'zlardan foydalan.
               3. Mavzu: '{$topic}'.
               4. MUHIM: O'quvchining ismini aytma va uni takrorlama. 
               5. Javoblaringni qisqa ,aniq , tushunarli va ravshan ber."
            : "Sen 'Kitsune-sensei' ismli tajribali yapon tili o'qituvchisisan. O'zbek tilida gapirasan.";

        $history = [];
        if ($user) {
            $pastMessages = ChatMessage::where('user_id', $user->id)
                ->latest('id')
                ->take(10)
                ->get()
                ->reverse()
                ->values();

            foreach ($pastMessages as $msg) {
                $history[] = [
                    'role' => $msg->role === 'ai' ? 'assistant' : 'user',
                    'content' => $msg->message
                ];
            }
        }

        $groqApiKey = env('GROQ_API_KEY');
        $response = Http::withoutVerifying()
            ->withToken($groqApiKey)
            ->post("https://api.groq.com/openai/v1/chat/completions", [
                "model" => "llama-3.3-70b-versatile",
                "messages" => array_merge(
                    [["role" => "system", "content" => $systemPrompt]],
                    $history
                )
            ]);

        if ($response->successful()) {
    $reply = $response->json()['choices'][0]['message']['content'];

    if ($user) {
        ChatMessage::create([
            'user_id' => $user->id,
            'role' => 'ai',
            'message' => $reply
        ]);
    }

    $audioBase64 = null;
    $cleanText = preg_replace('/[*#_()]/', '', $reply);
    $langCode = ($language === 'ja-JP') ? 'ja' : 'tr';
    
    // Yechim: Matnni 150 ta belgidan iborat qismlarga bo'lamiz
    $chunkSize = 150;
    $textLength = mb_strlen($cleanText);
    $combinedAudio = '';

    for ($i = 0; $i < $textLength; $i += $chunkSize) {
        $chunk = mb_substr($cleanText, $i, $chunkSize);
        
        $tts = Http::withoutVerifying()->get(
            "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q="
            . urlencode($chunk)
            . "&tl=" . $langCode
        );
        
        if ($tts->successful()) {
            // Har bir qismning audiosini bitta o'zgaruvchiga ulab ketamiz
            $combinedAudio .= $tts->body(); 
        }
    }

    // Agar audio muvaffaqiyatli yig'ilgan bo'lsa, uni Base64 ga o'giramiz
    if (!empty($combinedAudio)) {
        $audioBase64 = base64_encode($combinedAudio);
    }

    return response()->json(['reply' => $reply, 'audio' => $audioBase64]);
}

        return response()->json(['reply' => "Groq API xatosi."], 500);

    } catch (\Exception $e) {
        return response()->json(['reply' => "Xatolik yuz berdi."], 500);
    }
}
    // Oldingi xabarda yozganingiz tarixni tozalash funksiyasi ham shu klassda turishi kerak:
public function clearHistory(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Foydalanuvchi topilmadi'], 401);
        }

        try {
            // ChatMessage modelini import qilganingizga ishonch hosil qiling (use App\Models\ChatMessage;)
            \App\Models\ChatMessage::where('user_id', $user->id)->delete();
            return response()->json(['status' => 'ok', 'message' => 'Tarix tozalandi']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'DB xatosi: ' . $e->getMessage()], 500);
        }
    }
}