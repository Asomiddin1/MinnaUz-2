"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { unlockNextStage } from "@/components/user-components/japan-map-rpg/data";
import { useRouter } from "next/navigation";
import { ShieldAlert, Sword, Heart, ArrowLeft, Trophy, Timer, XCircle, RefreshCcw } from "lucide-react";

const KANJI_SET = [
  { ja: "私", uz: "Men", options: ["Sen", "U", "Men", "Biz"] },
  { ja: "人", uz: "Odam", options: ["Odam", "Suv", "Yer", "Osmon"] },
  { ja: "山", uz: "Tog'", options: ["Daryo", "Tog'", "Daraxt", "Tosh"] },
  { ja: "口", uz: "Og'iz", options: ["Ko'z", "Qo'l", "Og'iz", "Oyoq"] },
  { ja: "木", uz: "Daraxt", options: ["Daraxt", "Olov", "Oltin", "Suv"] },
  { ja: "火", uz: "Olov", options: ["Suv", "Olov", "Yer", "Yel"] },
  { ja: "水", uz: "Suv", options: ["Suv", "Olov", "Daraxt", "Tosh"] },
  { ja: "金", uz: "Oltin", options: ["Kumush", "Oltin", "Mis", "Temir"] },
];

const TIME_LIMIT = 30;

export default function BossBattle({ stageId }: { stageId: number }) {
  const router = useRouter();
  const [bossHP, setBossHP] = useState(100);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameState, setGameState] = useState<"playing" | "victory" | "gameover">("playing");
  const [isShaking, setIsShaking] = useState(false);

  const currentKanji = KANJI_SET[questionIndex];

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("gameover");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const attackBoss = (answer: string) => {
    if (gameState !== "playing") return;

    if (answer === currentKanji.uz) {
      const damage = 100 / KANJI_SET.length;
      setBossHP((prev) => Math.max(0, prev - damage));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (questionIndex < KANJI_SET.length - 1) {
        setQuestionIndex((prev) => prev + 1);
      } else if (bossHP - damage <= 0) {
        setGameState("victory");
        unlockNextStage(stageId);
      }
    } else {
      setTimeLeft((prev) => Math.max(0, prev - 3)); 
    }
  };

  return (
    /**
     * ASOSIY TUZATISH:
     * absolute inset-0 ishlatildi, bu saydbardan keyingi bo'shliqqa 100% moslashadi.
     * h-full va w-full scrolning oldini oladi.
     */
    <div className="absolute inset-0 w-full h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-between py-10 px-6 overflow-hidden select-none z-[40]">
      
      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(220,38,38,0.15),transparent)] pointer-events-none" />

      {/* TOP BAR */}
      <div className="w-full max-w-4xl flex justify-between items-center z-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors font-bold uppercase text-[10px] tracking-widest bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Chekinish
        </button>

        <div className={`flex items-center gap-3 px-5 py-2 rounded-xl border ${timeLeft < 10 ? "bg-red-600/20 border-red-500 animate-pulse" : "bg-slate-900/80 border-slate-800"}`}>
          <Timer className={`w-5 h-5 ${timeLeft < 10 ? "text-red-500" : "text-blue-500"}`} />
          <span className={`text-xl font-black tabular-nums ${timeLeft < 10 ? "text-red-500" : "text-white"}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>
      </div>

      {/* BOSS SECTION */}
      <motion.div 
        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
        className="w-full max-w-xl text-center z-20"
      >
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-2" />
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-red-500">
          <span>Kagoshima Guardian</span>
          <span className="text-white">{Math.ceil(bossHP)}% HP</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
          <motion.div 
            animate={{ width: `${bossHP}%` }} 
            className="h-full bg-gradient-to-r from-red-800 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
          />
        </div>
      </motion.div>

      {/* CENTER: KANJI DISPLAY */}
      <div className="flex-1 flex flex-col items-center justify-center z-20 w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentKanji.ja}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-[10rem] md:text-[14rem] font-black text-white leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {currentKanji.ja}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM: OPTIONS */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-6 z-20">
         {currentKanji.options.map((ans) => (
           <motion.button 
             whileTap={{ scale: 0.95 }}
             key={ans} 
             onClick={() => attackBoss(ans)} 
             className="py-5 bg-slate-900/60 border border-slate-800 text-white font-black rounded-2xl hover:border-red-600 hover:bg-slate-800/80 transition-all text-lg"
           >
             {ans}
           </motion.button>
         ))}
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {gameState !== "playing" && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center max-w-sm">
              {gameState === "victory" ? (
                <>
                  <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                  <h2 className="text-4xl font-black text-white mb-8">ZABT ETILDI!</h2>
                  <button onClick={() => router.push("/dashboard/games/map")} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase shadow-lg shadow-blue-900/20">Xaritaga Qaytish</button>
                </>
              ) : (
                <>
                  <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
                  <h2 className="text-4xl font-black text-white mb-8 uppercase">Mag'lubiyat</h2>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600 text-white font-black rounded-xl uppercase flex items-center justify-center gap-2"><RefreshCcw size={18} /> Qayta urinish</button>
                    <button onClick={() => router.back()} className="w-full py-4 bg-slate-800 text-white font-black rounded-xl uppercase">Chekinish</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}