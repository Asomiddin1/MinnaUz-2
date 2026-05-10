"use client";

import { Card } from "@/components/ui/card";

interface CertificateProps {
  userName: string;
  testTitle: string;
  level: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  earnedPoints: number;
  totalPoints: number;
  date: string;
  certificateId: string;
  isPassed?: boolean;
  // Bo'limlar bo'yicha ballar:
  vocabEarned?: number;
  vocabTotal?: number;
  grammarReadingEarned?: number;
  grammarReadingTotal?: number;
  listeningEarned?: number;
  listeningTotal?: number;
}

export default function Certificate({
  userName = "Foydalanuvchi",
  level,
  earnedPoints,
  totalPoints = 180,
  date,
  isPassed = false,
  vocabEarned = 0,
  vocabTotal = 60,
  grammarReadingEarned = 0,
  grammarReadingTotal = 60,
  listeningEarned = 0,
  listeningTotal = 60,
}: CertificateProps) {
  return (
    <Card className="relative p-6 md:p-8 rounded-[2rem] bg-white border-2 border-slate-100 shadow-xl overflow-hidden max-w-md mx-auto font-sans text-slate-800 print:shadow-none print:border-none print:p-0">
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Yuqori qism */}
        <div className="text-center w-full mb-6">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-black">
            日本語能力試験 合否 結果通知書
          </h2>
          <p className="text-[11px] md:text-xs font-semibold text-slate-700 mt-1">
            Japanese-Language Proficiency Test
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mt-4">
            Test Result
          </h1>
        </div>

        {/* Shaxsiy ma'lumotlar */}
        <div className="w-full space-y-3 text-sm md:text-base font-medium border-b border-slate-200 pb-4">
          <div className="flex flex-col">
            <span className="text-slate-600 text-xs">受験日 Test Date:</span>
            <span className="font-bold">{date}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-slate-600 text-xs">受験レベル Level:</span>
            <span className="font-bold text-lg">{level}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-slate-600 text-xs">氏名 Name:</span>
            <span className="font-bold">{userName}</span>
          </div>
        </div>

        {/* Ballar jadvali */}
        <div className="w-full mt-6 border border-slate-400 rounded-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 divide-x divide-slate-400 border-b border-slate-400 bg-slate-50 text-center">
            <div className="py-2 px-1 flex flex-col items-center justify-center min-h-[60px]">
              <span className="text-[10px] md:text-xs font-semibold leading-tight">文字・語彙</span>
              <span className="text-[8px] md:text-[9px] leading-tight text-slate-600 mt-1">Vocabulary</span>
            </div>
            <div className="py-2 px-1 flex flex-col items-center justify-center min-h-[60px]">
              <span className="text-[10px] md:text-xs font-semibold leading-tight">文法・読解</span>
              <span className="text-[8px] md:text-[9px] leading-tight text-slate-600 mt-1">Grammar /<br/>Reading</span>
            </div>
            <div className="py-2 px-1 flex flex-col items-center justify-center min-h-[60px]">
              <span className="text-[10px] md:text-xs font-semibold leading-tight">聴解</span>
              <span className="text-[8px] md:text-[9px] leading-tight text-slate-600 mt-1">Listening</span>
            </div>
            <div className="py-2 px-1 flex flex-col items-center justify-center min-h-[60px]">
              <span className="text-[10px] md:text-xs font-semibold leading-tight">総合得点</span>
              <span className="text-[8px] md:text-[9px] leading-tight text-slate-600 mt-1">Total</span>
            </div>
          </div>
          
          {/* Natijalar */}
          <div className="grid grid-cols-4 divide-x divide-slate-400 text-center bg-white">
            <div className="py-3 text-sm md:text-base font-bold">
              {vocabEarned}/{vocabTotal}
            </div>
            <div className="py-3 text-sm md:text-base font-bold">
              {grammarReadingEarned}/{grammarReadingTotal}
            </div>
            <div className="py-3 text-sm md:text-base font-bold">
              {listeningEarned}/{listeningTotal}
            </div>
            <div className="py-3 text-sm md:text-base font-bold bg-slate-50">
              {earnedPoints}/{totalPoints}
            </div>
          </div>
        </div>

        {/* Ko'rsatkich */}
        <div className="text-xl md:text-2xl text-slate-600 my-4 font-light">
          ↓
        </div>

        {/* Status (Passed / Failed) */}
        <div className={`w-full border py-3 text-center text-xl md:text-2xl font-bold bg-white
          ${isPassed 
            ? "text-green-800 border-slate-400" 
            : "text-[#c23b3b] border-[#e1b4b4]"
          }`}
        >
          {isPassed ? "合格 Passed" : "不合格 Failed"}
        </div>

        {/* Footer qismi */}
        <div className="w-full flex justify-between items-end mt-8 relative">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-medium text-slate-500 mb-1">
              Issued by
            </span>
            <span className="text-xl md:text-2xl font-bold text-[#5c3bb5] tracking-tight">
              MinnaUz
            </span>
          </div>
          
          {/* Muhr shakli */}
          <div className=" flex items-center justify-center text-center">
            <span className="text-[#c23b3b] text-[10px] md:text-xs font-bold leading-tight">
              minna.uz
            </span>
          </div>
          
        </div>

      </div>
    </Card>
  );
}