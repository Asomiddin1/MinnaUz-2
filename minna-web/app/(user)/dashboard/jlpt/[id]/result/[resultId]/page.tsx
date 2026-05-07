"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userAPI } from "@/lib/api/user";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

// ---------- TYPELAR ----------
interface AnswerDetail {
  question_id: number;
  question_text: string;
  passage?: string | null;
  options: string[];
  type: string;
  audio_url?: string | null;
  selected_option: string | null;
  correct_option: string;
  is_correct: boolean;
  points: number;
}

interface TestResultData {
  id: number;
  test_id: number;
  test_title: string;
  level: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  score_percentage: number;
  passed: boolean;
  time_spent: number;
  answers: AnswerDetail[];
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  // ⚠️ To‘g‘ri nomlar: [id] → params.id, [resultId] → params.resultId
  const testId = params.id as string;
  const resultId = params.resultId as string;

  const [result, setResult] = useState<TestResultData | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio holati
  const [activeAudio, setActiveAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!testId || !resultId) {
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getTestResult(Number(resultId));
        const data = res.data?.data || res.data;
        if (!data) throw new Error("Natija topilmadi");
        setResult(data);
      } catch (err: any) {
        console.error("Natija yuklashda xatolik:", err);
        toast.error(err?.response?.data?.message || "Natija yuklanmadi");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();

    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = "";
      }
    };
  }, [testId, resultId]);

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
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Natijalar hisoblanmoqda...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <p className="text-slate-600 font-medium">Natija topilmadi</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/jlpt")}>
          Testlarga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/jlpt")}
            className="text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Testlar ro'yxatiga qaytish
          </Button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {result.test_title} - Natijalar
          </h1>
        </div>

        {/* Score Card */}
        <Card className="p-8 rounded-3xl border-none shadow-lg relative bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-center md:text-left">
              <Badge
                className={`mb-4 ${
                  result.passed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                } border-none px-3 py-1 text-sm`}
              >
                {result.passed
                  ? "Tabriklaymiz, testdan o'tdingiz!"
                  : "Afsuski, yetarli ball to'play olmadingiz"}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-2">
                {result.score_percentage}%
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Umumiy to'plagan balingiz
              </p>
            </div>

            <div className="flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl min-w-[100px]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {result.correct_count}
                </span>
                <span className="text-xs font-medium uppercase">To'g'ri</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl min-w-[100px]">
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {result.wrong_count}
                </span>
                <span className="text-xs font-medium uppercase">Noto'g'ri</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl min-w-[100px]">
                <AlertTriangle className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                  {result.unanswered_count}
                </span>
                <span className="text-xs font-medium uppercase">Bo'sh</span>
              </div>
            </div>
          </div>
          <Trophy
            className={`absolute -right-10 -bottom-10 w-64 h-64 opacity-5 ${
              result.passed ? "text-emerald-500" : "text-slate-400"
            }`}
          />
        </Card>

        {/* Savollar tahlili */}
        <div className="space-y-4 mt-10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white px-2">
            Xatolar ustida ishlash (Review)
          </h3>

          <div className="grid gap-4">
            {result.answers.map((q, idx) => (
              <Card
                key={q.question_id}
                className={`p-5 rounded-2xl border-l-4 ${
                  q.is_correct
                    ? "border-l-emerald-500"
                    : !q.selected_option
                    ? "border-l-slate-400"
                    : "border-l-red-500"
                } dark:bg-slate-900`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      Savol {idx + 1}
                    </Badge>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {q.type}
                    </Badge>
                  </div>
                  {q.is_correct ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                {/* Audio tinglash tugmasi */}
                {q.audio_url && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <button
                      onClick={() => toggleAudio(q.question_id, q.audio_url!)}
                      className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-blue-200 dark:border-blue-700"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {activeAudio === q.question_id && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                          {activeAudio === q.question_id && isPlaying
                            ? "⏸️ To'xtatish"
                            : "▶️ Tinglash"}
                        </p>
                        <p className="text-xs text-blue-500/70">
                          Audio tinglab, savolga javob bering
                        </p>
                      </div>
                      <Volume2 className="w-5 h-5 text-blue-400 ml-auto" />
                    </button>
                  </div>
                )}

                {/* Passage */}
                {q.passage && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border text-sm whitespace-pre-wrap">
                    {q.passage}
                  </div>
                )}

                <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-6">
                  {q.question_text}
                </p>

                {/* Variantlar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => {
                    const safeOpt = String(opt).trim().toLowerCase();
                    const safeSelected = (q.selected_option || "").trim().toLowerCase();
                    const safeCorrect = q.correct_option.trim().toLowerCase();

                    const isUserChoice = safeOpt === safeSelected;
                    const isCorrectChoice = safeOpt === safeCorrect;

                    let bgClass =
                      "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700";
                    let textClass = "text-slate-600 dark:text-slate-400";

                    if (isCorrectChoice) {
                      bgClass =
                        "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800";
                      textClass =
                        "text-emerald-700 dark:text-emerald-400 font-bold";
                    } else if (isUserChoice && !q.is_correct) {
                      bgClass =
                        "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800";
                      textClass =
                        "text-red-700 dark:text-red-400 font-bold line-through";
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border flex items-center gap-3 ${bgClass}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCorrectChoice
                              ? "bg-emerald-500 text-white"
                              : isUserChoice
                              ? "bg-red-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                          }`}
                        >
                          {oIdx + 1}
                        </div>
                        <span className={textClass}>{opt}</span>
                        {isCorrectChoice && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                        )}
                        {isUserChoice && !isCorrectChoice && (
                          <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {!q.selected_option && (
                  <p className="mt-4 text-sm text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Siz bu savolga javob
                    bermagansiz.
                  </p>
                )}

                {!q.is_correct && (
                  <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> To‘g‘ri javob:{" "}
                    <span className="font-bold">{q.correct_option}</span>
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Pastki tugmalar */}
        <div className="flex justify-center gap-4 py-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/dashboard/jlpt/${testId}`)}
            className="rounded-full px-8"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Qaytadan ishlash
          </Button>
          <Button
            size="lg"
            onClick={() => router.push("/dashboard/jlpt")}
            className="rounded-full px-8 bg-slate-800 text-white hover:bg-slate-900"
          >
            <Home className="w-4 h-4 mr-2" /> Bosh sahifaga
          </Button>
        </div>
      </div>
    </div>
  );
}