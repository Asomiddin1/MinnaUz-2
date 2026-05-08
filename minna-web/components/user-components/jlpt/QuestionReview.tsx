"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Volume2,
  Play,
  Pause,
} from "lucide-react";

interface AnswerDetail {
  question_id: number;
  question_text: string;
  passage?: string | null;
  options: any[];
  type: string;
  audio_url?: string | null;
  image_url?: string | null;
  selected_option: string | null;
  correct_option: string;
  is_correct: boolean;
  points: number;
}

interface QuestionReviewProps {
  answers: AnswerDetail[];
}

export default function QuestionReview({ answers }: QuestionReviewProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeAudio, setActiveAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const wrongAnswers = answers.filter((a) => !a.is_correct);
  const displayAnswers = showAll ? answers : wrongAnswers;

  const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
      : "http://127.0.0.1:8000";
    let cleanPath = path.includes("storage/") ? path : `storage/${path}`;
    return `${baseUrl}/${cleanPath.replace(/^\//, "")}`;
  };

  const toggleAudio = (questionId: number, audioUrl: string) => {
    if (audioElement && activeAudio !== questionId) {
      audioElement.pause();
      audioElement.src = "";
      setActiveAudio(null);
      setIsPlaying(false);
    }
    if (activeAudio === questionId) {
      if (audioElement) {
        if (isPlaying) {
          audioElement.pause();
          setIsPlaying(false);
        } else {
          audioElement.play().catch(console.error);
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
      setAudioElement(audio);
      setActiveAudio(questionId);
      audio.play().catch(console.error);
    }
  };

  return (
    <div className="space-y-4 print:hidden">
      {/* Toggle tugma */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {showAll ? "Barcha savollar" : "Xatolar ustida ishlash"}
          {!showAll && (
            <Badge variant="secondary" className="text-xs">
              {wrongAnswers.length} ta xato
            </Badge>
          )}
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Faqat xatolarni ko'rish" : "Barcha savollarni ko'rish"}
        </Button>
      </div>

      {!showAll && wrongAnswers.length === 0 && (
        <div className="text-center py-8 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
          <p className="font-bold text-lg">
            Barcha savollarga to'g'ri javob bergansiz!
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {displayAnswers.map((q, idx) => (
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
            {/* Sarlavha */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono">
                  Savol {idx + 1}
                </Badge>
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {q.type}
                </Badge>
                <Badge
                  className={`text-xs ${
                    q.is_correct
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {q.is_correct ? `+${q.points}` : "0"} / {q.points} ball
                </Badge>
              </div>
              {q.is_correct ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 shrink-0" />
              )}
            </div>

            {/* Audio */}
            {q.audio_url && (
              <button
                onClick={() => toggleAudio(q.question_id, q.audio_url!)}
                className="mb-4 flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:shadow-md transition-all w-full"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                  {activeAudio === q.question_id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </div>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  {activeAudio === q.question_id && isPlaying
                    ? "To'xtatish"
                    : "Tinglash"}
                </span>
                <Volume2 className="w-5 h-5 text-blue-400 ml-auto" />
              </button>
            )}

            {/* Savol rasmi */}
            {q.image_url && (
              <div className="mb-4 max-w-md mx-auto">
                <img
                  src={getImageUrl(q.image_url) || ""}
                  alt="Savol rasmi"
                  className="rounded-xl border max-h-48 w-auto mx-auto"
                />
              </div>
            )}

            {/* Passage */}
            {q.passage && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border text-sm whitespace-pre-wrap">
                {q.passage}
              </div>
            )}

            {/* Savol matni */}
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-6">
              {q.question_text}
            </p>

            {/* Variantlar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt: any, oIdx: number) => {
                const optText =
                  typeof opt === "string" ? opt : opt.text || "";
                const optImage =
                  typeof opt === "object"
                    ? opt.image_url || getImageUrl(opt.image)
                    : null;

                const selectedValue = String(q.selected_option || "").trim();
                const optionValue = String(oIdx).trim();
                const correctValue = String(q.correct_option || "").trim();

                const isUserChoice = optionValue === selectedValue;
                const isCorrectChoice = optionValue === correctValue;

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
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCorrectChoice
                          ? "bg-emerald-500 text-white"
                          : isUserChoice
                          ? "bg-red-500 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      }`}
                    >
                      {oIdx + 1}
                    </div>
                    {optImage && (
                      <img
                        src={optImage}
                        alt=""
                        className="w-12 h-12 rounded object-cover shrink-0"
                      />
                    )}
                    <span className={textClass}>
                      {optText || "(rasm)"}
                    </span>
                    {isCorrectChoice && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                    )}
                    {isUserChoice && !isCorrectChoice && (
                      <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ogohlantirish */}
            {!q.selected_option && (
              <p className="mt-4 text-sm text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Siz bu savolga javob
                bermagansiz.
              </p>
            )}
            {!q.is_correct && (
              <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> To'g'ri javob:{" "}
                <span className="font-bold">
                  {typeof q.options[Number(q.correct_option)] === "string"
                    ? q.options[Number(q.correct_option)]
                    : q.options[Number(q.correct_option)]?.text ||
                      `Variant ${Number(q.correct_option) + 1}`}
                </span>
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}