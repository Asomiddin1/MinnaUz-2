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

            // 1. Avval YANGI xabarni DB ga saqlash
            if ($user) {
                ChatMessage::create([
                    'user_id' => $user->id,
                    'role' => 'user',
                    'message' => $userMessage
                ]);
            }

            $systemPrompt = ($language === 'ja-JP')
                ? "Sen 'Kitsune-sensei' ismli tajribali va nazokatli yapon tili o'qituvchisisan. Sen faqat Yapon tilida gapirasan.
                   Sening qoidalaring:
                   1. O'quvchining JLPT darajasi: {$level}.
                   2. Sen faqatgina {$level} darajasiga mos grammatika va so'zlardan foydalanishing shart.
                   3. Hozirgi suhbat mavzusi: '{$topic}'. Iloji boricha suhbatni shu mavzuga burib, savollar ber.
                   4. Javoblaringni qisqa, lo'nda va ravshan ber."
                : "Sen 'Kitsune-sensei' ismli tajribali yapon tili o'qituvchisisan. O'zbek tilida gapirasan.";

            // 2. DB dan OXIRGI 10 ta xabarni olish (To'g'rilangan qism)
            $history = [];
            if ($user) {
                $pastMessages = ChatMessage::where('user_id', $user->id)
                    ->latest('id') // Oxirgi qo'shilganlaridan boshlab oladi
                    ->take(10)     // Oxirgi 10 tasini kesib oladi
                    ->get()
                    ->reverse()    // Xronologik tartibga (tepadan pastga) qaytaradi
                    ->values();    // Indekslarni to'g'rilaydi

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
                    // 3. system + tarix (o'z ichiga joriy xabarni ham oladi)
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
                $tts = Http::withoutVerifying()->get(
                    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q="
                    . urlencode(mb_substr($cleanText, 0, 180))
                    . "&tl=" . $langCode
                );
                
                if ($tts->successful()) {
                    $audioBase64 = base64_encode($tts->body());
                }

                return response()->json(['reply' => $reply, 'audio' => $audioBase64]);
            }

            return response()->json(['reply' => "Groq API xatosi: " . $response->body()], 500);

        } catch (\Exception $e) {
            return response()->json(['reply' => "Server xatosi: " . $e->getMessage()], 500);
        }
    }

    // Oldingi xabarda yozganingiz tarixni tozalash funksiyasi ham shu klassda turishi kerak:
    public function clearHistory(Request $request)
    {
        $user = $request->user();
        if ($user) {
            ChatMessage::where('user_id', $user->id)->delete();
        }
        return response()->json(['status' => 'ok']);
    }
}