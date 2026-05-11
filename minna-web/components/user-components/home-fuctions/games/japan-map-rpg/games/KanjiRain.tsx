"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { unlockNextStage } from "@/components/user-components/home-fuctions/games/japan-map-rpg/data";
import Link from "next/link";

export default function KanjiRain({ stageId }: { stageId: number }) {
  const [score, setScore] = useState(0);
  const [victory, setVictory] = useState(false);
  
  const words = [
    { ja: "雨", uz: "Yomg'ir" },
    { ja: "空", uz: "Osmon" },
    { ja: "風", uz: "Shamol" },
    { ja: "花", uz: "Gul" }
  ];

  const [currentWord, setCurrentWord] = useState(words[0]);

  useEffect(() => {
    if (score >= 50) {
      setVictory(true);
      unlockNextStage(stageId);
    }
  }, [score, stageId]);

  const handleAnswer = (answer: string) => {
    if (answer === currentWord.uz) {
      setScore(s => s + 10);
      setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    }
  };

  if (victory) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-12 bg-slate-900 rounded-[3rem] border border-cyan-500">
        <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter text-cyan-400">Kumamoto Zabt Etildi!</h2>
        <Link href="/dashboard/games/map/kyushu" className="px-10 py-4 bg-cyan-600 rounded-full font-bold">Xaritaga Qaytish</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-between py-12 text-white overflow-hidden relative">
      {/* Tushayotgan Kanji */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.ja}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 300, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 4, ease: "linear" }}
          className="text-9xl font-black text-cyan-500 shadow-cyan-500/50"
          onAnimationComplete={() => {
             // Agar javob berilmasa, kanji tushib ketsa score kamayishi mumkin
          }}
        >
          {currentWord.ja}
        </motion.div>
      </AnimatePresence>

      {/* Pastki boshqaruv paneli */}
      <div className="w-full max-w-md px-6 z-10">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {words.map(w => (
            <button
              key={w.uz}
              onClick={() => handleAnswer(w.uz)}
              className="py-5 bg-slate-900 border border-slate-800 rounded-2xl font-bold hover:border-cyan-500 transition-all"
            >
              {w.uz}
            </button>
          ))}
        </div>
        
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${(score/50)*100}%` }} className="bg-cyan-500 h-full shadow-[0_0_15px_cyan]" />
        </div>
        <p className="text-center mt-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Score: {score} / 50</p>
      </div>
    </div>
  );
}