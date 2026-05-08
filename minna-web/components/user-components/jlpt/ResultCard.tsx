"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Target } from "lucide-react";

interface ScoreBreakdownProps {
  totalPoints: number;
  earnedPoints: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  passingScore: number;
}

export default function ScoreBreakdown({
  totalPoints,
  earnedPoints,
  correctCount,
  wrongCount,
  unansweredCount,
  totalQuestions,
}: ScoreBreakdownProps) {
  const maxPossiblePoints = totalPoints;
  const lostPoints = totalPoints - earnedPoints;

  return (
    <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-500" /> Ball taqsimoti
      </h3>
      
      <div className="space-y-4">
        {/* Ball progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">To'plangan ball</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {earnedPoints} / {maxPossiblePoints}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(earnedPoints / maxPossiblePoints) * 100}%` }}
            />
          </div>
        </div>

        {/* Statistikalar */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                To'g'ri javoblar
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {correctCount} <span className="text-sm font-normal">ta</span>
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
              {unansweredCount} <span className="text-sm font-normal">ta</span>
            </p>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                Yo'qotilgan ball
              </span>
            </div>
            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
              {lostPoints} <span className="text-sm font-normal">ball</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}