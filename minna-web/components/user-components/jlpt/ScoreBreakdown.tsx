"use client";

import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Award,
} from "lucide-react";

interface ScoreBreakdownProps {
  earnedPoints: number;
  totalPoints: number;
  maxPoints?: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  passed: boolean;
  passingScore?: number;
}

export default function ScoreBreakdown({
  earnedPoints,
  totalPoints,
  maxPoints = 180,
  correctCount,
  wrongCount,
  unansweredCount,
  totalQuestions,
  passed,
  passingScore = 90,
}: ScoreBreakdownProps) {
  const scaledScore =
    totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * maxPoints)
      : 0;

  const lostPoints = maxPoints - scaledScore;

  const scorePercentage =
    totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * 100)
      : 0;

  const scoreColor =
    scaledScore >= passingScore
      ? "text-emerald-600 dark:text-emerald-400"
      : scaledScore >= passingScore - 20
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-500" /> Ball taqsimoti (JLPT {maxPoints} ball)
      </h3>

      <div className="space-y-6">
        {/* Asosiy ball */}
        <div className="text-center py-4">
          <p
            className={`text-5xl md:text-6xl font-extrabold ${scoreColor} mb-2`}
          >
            {scaledScore}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            / {maxPoints} ball
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ({scorePercentage}% to'g'ri javob)
          </p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">To'plangan ball</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {scaledScore} / {maxPoints}
            </span>
          </div>
          <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                scaledScore >= passingScore
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : scaledScore >= passingScore - 20
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-red-500 to-red-400"
              }`}
              style={{
                width: `${Math.min(
                  (scaledScore / maxPoints) * 100,
                  100
                )}%`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-500 dark:bg-slate-400"
              style={{ left: `${(passingScore / maxPoints) * 100}%` }}
              title={`O'tish bali: ${passingScore}`}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-400">0</span>
            <span className="text-amber-500 font-bold">
              O'tish: {passingScore}
            </span>
            <span className="text-slate-400">{maxPoints}</span>
          </div>
        </div>

        {/* Natija xabari */}
        <div
          className={`p-4 rounded-xl text-center ${
            passed
              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <p
            className={`text-lg font-bold ${
              passed
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {passed
              ? "✅ Tabriklaymiz! Siz testdan o'tdingiz!"
              : `❌ Afsuski, ${passingScore} balldan kam to'pladingiz`}
          </p>
        </div>

        {/* Statistikalar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                To'g'ri javoblar
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {correctCount}{" "}
              <span className="text-sm font-normal">/ {totalQuestions}</span>
            </p>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                Noto'g'ri javoblar
              </span>
            </div>
            <p className="text-xl font-bold text-red-700 dark:text-red-400 mt-1">
              {wrongCount} <span className="text-sm font-normal">ta</span>
            </p>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                Javob berilmagan
              </span>
            </div>
            <p className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1">
              {unansweredCount}{" "}
              <span className="text-sm font-normal">ta</span>
            </p>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                Yo'qotilgan ball
              </span>
            </div>
            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
              {lostPoints}{" "}
              <span className="text-sm font-normal">/ {maxPoints}</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}