"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Play, Trophy, Map as MapIcon } from "lucide-react";
import Link from "next/link";
// ✅ Data fayliga to'g'ri yo'l (Alias ishlatish tavsiya etiladi)
import { unlockNextStage } from "@/components/user-components/japan-map-rpg/data";

export default function KanjiDash({ stageId }: { stageId: number }) {
  const [score, setScore] = useState(0);
  const [victory, setVictory] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  // 1. Kanji ma'lumotlar bazasi (Hozircha Kyushu 1-bosqich uchun)
  const kanjiList = useMemo(() => [
    { ja: "日", uz: "Kun" },
    { ja: "月", uz: "Oy" },
    { ja: "火", uz: "Olov" },
    { ja: "水", uz: "Suv" },
    { ja: "木", uz: "Daraxt" },
    { ja: "金", uz: "Oltin" },
    { ja: "土", uz: "Tuproq" },
    { ja: "山", uz: "Tog'" },
    { ja: "川", uz: "Daryo" },
    { ja: "田", uz: "Guruch dalasi" }
  ], []);

  const [currentKanji, setCurrentKanji] = useState(kanjiList[0]);
  const [options, setOptions] = useState<string[]>([]);

  // 2. Variantlarni tasodifiy generatsiya qilish
  const generateOptions = (correctAnswer: string) => {
    const wrongAnswers = kanjiList
      .filter(k => k.uz !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(k => k.uz);
    
    const allOptions = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  useEffect(() => {
    generateOptions(currentKanji.uz);
  }, [currentKanji]);

  // 3. Javobni tekshirish mantiqi
  const handleAnswer = (answer: string) => {
    if (answer === currentKanji.uz) {
      setScore(prev => prev + 10);
      const nextIndex = Math.floor(Math.random() * kanjiList.length);
      setCurrentKanji(kanjiList[nextIndex]);
      setIsWrong(false);
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500); // Xato bo'lsa effekt beradi
    }
  };

  // 4. G'alaba sharti (50 ball)
  useEffect(() => {
    if (score >= 50) {
      setVictory(true);
      unlockNextStage(stageId); // Data.ts ichidagi progressni ochish mantiqi
    }
  }, [score, stageId]);

  // 5. G'alaba ekrani (VICTORY SCREEN)
  if (victory) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center bg-slate-900 border-2 border-emerald-500/50 p-12 rounded-[3rem] shadow-[0_0_80px_rgba(16,185,129,0.2)] max-w-sm w-full"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Zabt etildi!</h2>
          <p className="text-slate-400 mb-8 font-medium">Kyushu bosqichi muvaffaqiyatli yakunlandi.</p>
          
          {/* ✅ MUHIM: Aynan Kyushu xaritasiga qaytish */}
          <Link 
            href="/dashboard/games/map/kyushu" 
            className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            <MapIcon className="w-5 h-5" />
            XARITAGA QAYTISH
          </Link>
        </motion.div>
      </div>
    );
  }

  // 6. O'yin interfeysi
  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Fonda yorug'lik effekti */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="z-10 w-full max-w-md px-8 text-center">
        {/* Header (Info) */}
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Region</span>
            <h3 className="text-xl font-bold tracking-tighter">KYUSHU</h3>
          </div>
          <div className="text-right">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Stage</span>
            <h3 className="text-xl font-bold text-white/40">{stageId}</h3>
          </div>
        </div>

        {/* Kanji ko'rsatish */}
        <motion.div 
          key={currentKanji.ja}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-[120px] font-black mb-16 leading-none transition-colors ${isWrong ? 'text-red-500' : 'text-white'}`}
        >
          {currentKanji.ja}
        </motion.div>
        
        {/* Variantlar tugmalari */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => (
            <motion.button 
              key={option}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option)}
              className="py-6 bg-slate-900/40 border border-slate-800 rounded-3xl font-bold text-lg hover:border-blue-500/50 hover:bg-blue-600/5 transition-all"
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-20">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4 text-slate-500">
            <span>Progress bar</span>
            <span className="text-blue-400">{score} / 50</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <motion.div 
              animate={{ width: `${(score/50)*100}%` }} 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}