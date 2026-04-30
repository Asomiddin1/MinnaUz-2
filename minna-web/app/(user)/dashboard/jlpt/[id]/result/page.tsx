"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  AlertTriangle,
  RotateCcw,
  Home,
  Volume2,
  Pause,
  Play,
} from "lucide-react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // 🎧 Audio holati
  const [activeAudio, setActiveAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [testRes, qRes] = await Promise.all([
          adminAPI.getTestById(Number(testId)),
          adminAPI.getQuestionsByTestId(Number(testId)),
        ]);

        setTest(testRes.data.data || testRes.data);
        setQuestions(qRes.data.data || qRes.data || []);

        const savedAnswers = localStorage.getItem(`jlpt_result_${testId}`);
        if (savedAnswers) {
          setUserAnswers(JSON.parse(savedAnswers));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();

    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = "";
      }
    };
  }, [testId, audioRef]); // Dependency qismi to'ldirildi

  const toggleAudio = (questionId: number, audioUrl: string) => {
    if (audioRef && activeAudio !== questionId) {
      audioRef.pause();
      audioRef.src = "";
      setActiveAudio(null);
      setIsPlaying(false);
    }

    if (activeAudio === questionId) {
      if (audioRef) {
        if (isPlaying) {
          audioRef.pause();
          setIsPlaying(false);
        } else {
          audioRef.play().catch(console.error);
          setIsPlaying(true);
        }
      }
    } else {
      const audio = new Audio(audioUrl);
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setActiveAudio(null);
      });
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));

      setAudioRef(audio);
      setActiveAudio(questionId);
      audio.play().catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Natijalar hisoblanmoqda...</p>
      </div>
    );
  }

  // ==========================================
  // 📊 NATIJALARNI HISOBLASH (MUKAMMAL VERSIYA)
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const resultsList = questions.map((q) => {
    const rawUserAnswer = userAnswers[q.id];
    // Qiymatlarni xavfsiz matnga (string) aylantiramiz va bo'sh joylarini (trim) kesamiz
    const userAnsStr = rawUserAnswer !== undefined && rawUserAnswer !== null ? String(rawUserAnswer).trim() : "";
    const correctAnsStr = q.answer !== undefined && q.answer !== null ? String(q.answer).trim() : "";

    // Barcha variantlarni tozalab (trim) olamiz, xatoliklar chiqmasligi uchun
    const safeOptions = (q.options || []).map((opt: any) => String(opt).trim());

    let isCorrect = false;
    let normalizedUserAnswer = userAnsStr;
    let correctAnswer = correctAnsStr;

    // ✅ 1. Bazadagi "To'g'ri javob" ni to'g'rilash:
    // Agar admin variant raqamini kiritgan bo'lsa (masalan 1, 2, 3, 4) va matn bilan ustma-ust tushmasa
    if (/^[1-4]$/.test(correctAnsStr) && !safeOptions.includes(correctAnsStr)) {
      correctAnswer = safeOptions[parseInt(correctAnsStr, 10) - 1] || correctAnsStr;
    } 
    // Agar dasturchi / admin 0, 1, 2, 3 (indeks) kiritgan bo'lsa
    else if (/^[0-3]$/.test(correctAnsStr) && !safeOptions.includes(correctAnsStr)) {
      correctAnswer = safeOptions[parseInt(correctAnsStr, 10)] || correctAnsStr;
    }

    // ✅ 2. Foydalanuvchi javobini tekshirish (faqat raqam saqlanib qolgan holatlar uchun)
    if (/^[0-3]$/.test(userAnsStr) && !safeOptions.includes(userAnsStr)) {
      normalizedUserAnswer = safeOptions[parseInt(userAnsStr, 10)] || userAnsStr;
    }

    // ✅ 3. Yakuniy tekshiruv (Matnlarni hammasini kichik harfga o'girib, bo'sh joylarsiz solishtiramiz)
    if (normalizedUserAnswer && correctAnswer && normalizedUserAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      isCorrect = true;
    }

    // ✅ 4. Sanash
    if (!normalizedUserAnswer) unansweredCount++;
    else if (isCorrect) correctCount++;
    else wrongCount++;

    return {
      ...q,
      userAnswer: normalizedUserAnswer,
      isCorrect,
      correctAnswer,
    };
  });

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = scorePercentage >= 50;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/dashboard/jlpt")} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Testlar ro'yxatiga qaytish
          </Button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">{test?.title} - Natijalar</h1>
        </div>

        {/* SCORE CARD */}
        <Card className="p-8 rounded-3xl border-none shadow-lg overflow-hidden relative bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-center md:text-left">
              <Badge className={`mb-4 ${isPassed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} border-none px-3 py-1 text-sm`}>
                {isPassed ? "Tabriklaymiz, testdan o'tdingiz!" : "Afsuski, yetarli ball to'play olmadingiz"}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-2">{scorePercentage}%</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Umumiy to'plagan balingiz</p>
            </div>

            <div className="flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl min-w-[100px]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{correctCount}</span>
                <span className="text-xs font-medium text-emerald-600/70 uppercase">To'g'ri</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl min-w-[100px]">
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-2xl font-bold text-red-700 dark:text-red-400">{wrongCount}</span>
                <span className="text-xs font-medium text-red-600/70 uppercase">Noto'g'ri</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl min-w-[100px]">
                <AlertTriangle className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">{unansweredCount}</span>
                <span className="text-xs font-medium text-slate-500 uppercase">Bo'sh</span>
              </div>
            </div>
          </div>
          <Trophy className={`absolute -right-10 -bottom-10 w-64 h-64 opacity-5 ${isPassed ? "text-emerald-500" : "text-slate-400"}`} />
        </Card>

        {/* SAVOLLAR TAHLILI */}
        <div className="space-y-4 mt-10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white px-2">Xatolar ustida ishlash (Review)</h3>

          <div className="grid gap-4">
            {resultsList.map((q, idx) => (
              <Card key={q.id} className={`p-5 rounded-2xl border-l-4 ${q.isCorrect ? "border-l-emerald-500" : !q.userAnswer ? "border-l-slate-400" : "border-l-red-500"} dark:bg-slate-900`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">Savol {idx + 1}</Badge>
                    <Badge variant="secondary" className="capitalize text-[10px]">{q.type}</Badge>
                  </div>
                  {q.isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                </div>

                {/* AUDIO PLAYER */}
                {(q.type === "listening" || q.type === "choukai") && (q.audio_url || q.audio) && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <button onClick={() => toggleAudio(q.id, q.audio_url || q.audio)} className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-blue-200 dark:border-blue-700">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {activeAudio === q.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">{activeAudio === q.id && isPlaying ? "⏸️ To'xtatish" : "▶️ Tinglash"}</p>
                        <p className="text-xs text-blue-500/70">Audio tinglab, savolga javob bering</p>
                      </div>
                      <Volume2 className="w-5 h-5 text-blue-400 ml-auto" />
                    </button>
                  </div>
                )}

                <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-6">{q.question}</p>

                {/* VARIANTLAR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt: string, oIdx: number) => {
                    // Xatoliklarni yo'q qilish uchun stringlarni tozalab tekshiramiz
                    const safeOpt = String(opt).trim().toLowerCase();
                    const safeUserAns = String(q.userAnswer || "").trim().toLowerCase();
                    const safeCorrectAns = String(q.correctAnswer || "").trim().toLowerCase();

                    const isUserChoice = safeOpt === safeUserAns;
                    const isCorrectChoice = safeOpt === safeCorrectAns;

                    let bgClass = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700";
                    let textClass = "text-slate-600 dark:text-slate-400";

                    if (isCorrectChoice) {
                      bgClass = "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800";
                      textClass = "text-emerald-700 dark:text-emerald-400 font-bold";
                    } else if (isUserChoice && !q.isCorrect) {
                      bgClass = "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800";
                      textClass = "text-red-700 dark:text-red-400 font-bold strike-through";
                    }

                    return (
                      <div key={oIdx} className={`p-3 rounded-xl border flex items-center gap-3 ${bgClass}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectChoice ? "bg-emerald-500 text-white" : isUserChoice ? "bg-red-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                          {oIdx + 1}
                        </div>
                        <span className={textClass}>{opt}</span>
                        {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                        {isUserChoice && !isCorrectChoice && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                      </div>
                    );
                  })}
                </div>

                {/* ❗ BO'SH QOLGAN */}
                {!q.userAnswer && (
                  <p className="mt-4 text-sm text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Siz bu savolga javob bermagansiz.
                  </p>
                )}

                {/* ✅ TO'G'RI JAVOB MATNI */}
                {!q.isCorrect && (
                  <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> To‘g‘ri javob: <span className="font-bold">{q.correctAnswer}</span>
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-center gap-4 py-8">
          <Button variant="outline" size="lg" onClick={() => router.push(`/dashboard/jlpt/${testId}`)} className="rounded-full px-8">
            <RotateCcw className="w-4 h-4 mr-2" /> Qaytadan ishlash
          </Button>
          <Button size="lg" onClick={() => router.push("/dashboard/jlpt")} className="rounded-full px-8 bg-slate-800 text-white hover:bg-slate-900">
            <Home className="w-4 h-4 mr-2" /> Bosh sahifaga
          </Button>
        </div>
      </div>
    </div>
  );
}