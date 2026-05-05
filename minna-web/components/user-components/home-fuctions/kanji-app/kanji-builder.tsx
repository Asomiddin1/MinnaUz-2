"use client";

import KanjiMenu from "./kanji-menu";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_LEVELS } from "./kanji-levels";
import { Pause, Trophy, Play, Home, RotateCcw } from "lucide-react";

const KANJIS_PER_STAGE = 10;

export default function KanjiHunterPro() {
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [selectedLevel, setSelectedLevel] = useState<"N5" | "N4">("N5");
  const [selectedStage, setSelectedStage] = useState(0);
  
  const [unlockedStages, setUnlockedStages] = useState<{ N5: number, N4: number }>({ N5: 0, N4: 0 });

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "success" | "error">("playing");
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const savedProgress = localStorage.getItem("kanjiProProgress");
    if (savedProgress) {
      setUnlockedStages(JSON.parse(savedProgress));
    }
  }, []);

  const currentKanjiList = ALL_LEVELS[selectedLevel];
  const totalStages = Math.ceil(currentKanjiList.length / KANJIS_PER_STAGE);

  const stageKanjis = useMemo(() => {
    const start = selectedStage * KANJIS_PER_STAGE;
    const end = start + KANJIS_PER_STAGE;
    return currentKanjiList.slice(start, end);
  }, [currentKanjiList, selectedStage]);

  const level = stageKanjis[currentLevelIdx];

  useEffect(() => {
    if (currentLevelIdx >= stageKanjis.length) {
      setCurrentLevelIdx(0);
    }
  }, [stageKanjis.length, currentLevelIdx]);

  const shuffledOptions = useMemo(() => {
    if (!level) return [];
    return [...level.options].sort(() => Math.random() - 0.5);
  }, [currentLevelIdx, level]);

  const handleSelect = (kanji: string) => {
    if (gameState !== "playing" || isPaused) return;
    setSelectedKanji(kanji);

    if (kanji === level?.targetKanji) {
      setGameState("success");
      setScore(prev => prev + 5);
      
      setTimeout(() => {
        if (currentLevelIdx < stageKanjis.length - 1) {
          setCurrentLevelIdx(prev => prev + 1);
          setGameState("playing");
          setSelectedKanji(null);
        } else {
          const nextStage = selectedStage + 1;
          
          if (nextStage > unlockedStages[selectedLevel] && nextStage < totalStages) {
            const newProgress = { ...unlockedStages, [selectedLevel]: nextStage };
            setUnlockedStages(newProgress);
            localStorage.setItem("kanjiProProgress", JSON.stringify(newProgress));
          }

          setIsStarted(false);
          setCurrentLevelIdx(0);
          setGameState("playing");
          setSelectedKanji(null);
          
          if (nextStage < totalStages) {
            setSelectedStage(nextStage);
          }
        }
      }, 1500);
    } else {
      setGameState("error");
      setTimeout(() => {
        setGameState("playing");
        setSelectedKanji(null);
      }, 800);
    }
  };

  const startFreshGame = () => {
    setCurrentLevelIdx(0);
    setScore(0);
    setGameState("playing");
    setSelectedKanji(null);
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <KanjiMenu 
        selectedLevel={selectedLevel}
        onLevelChange={(lvl) => {
          setSelectedLevel(lvl);
          setSelectedStage(unlockedStages[lvl as keyof typeof unlockedStages]);
          setCurrentLevelIdx(0); 
          setGameState("playing");
        }}
        totalStages={totalStages}
        selectedStage={selectedStage}
        onStageChange={(stageIdx) => {
          setSelectedStage(stageIdx);
          setCurrentLevelIdx(0);
          setGameState("playing");
        }}
        maxUnlockedStage={unlockedStages[selectedLevel]}
        onStart={() => {
           if (gameState !== "playing") setGameState("playing");
           setSelectedKanji(null);
           setIsStarted(true);
        }} 
        onRestartScore={() => setScore(0)}
        onQuit={() => window.location.href = "/dashboard/games"}
        totalLevels={currentKanjiList.length} 
        currentScore={score}
      />
    );
  }

  if (!level) return null;

  return (
    /* 
       Yechim: Menyudagi mukammal ishlagan "sm:inset-4 lg:inset-6" va 
       "rounded-none sm:rounded-[32px] lg:rounded-[48px]" klasslarini bu yerga aniq qilib qo'ydik.
       Bu har 4 ta tomondan bir xil joy tashlab, rasmdagidek ajoyib yumaloq qiladi.
    */
    <div className="bg_kanji_oyin absolute inset-0 sm:inset-4 lg:inset-6 flex flex-col items-center text-slate-900 dark:text-white p-4 pt-20 sm:pt-10 pb-[86px] sm:pb-10 overflow-hidden select-none rounded-none sm:rounded-[32px] lg:rounded-[48px] shadow-none sm:shadow-2xl">
      
      {/* 1. HEADER */}
      <div className="w-full max-w-md h-12 flex items-center justify-between flex-none z-20 relative">
        <button onClick={() => setIsPaused(true)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 active:scale-90 transition-transform">
          <Pause className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
        <div className="flex-1 px-4 flex flex-col gap-1">
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-blue-500" animate={{ width: `${((currentLevelIdx + 1) / stageKanjis.length) * 100}%` }} />
          </div>
          <span className="text-[9px] font-black text-center text-slate-500 uppercase tracking-widest">{selectedLevel} | Bosqich {selectedStage + 1}</span>
        </div>
        <div className="bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-2 backdrop-blur-md">
          <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span className="font-black text-sm text-amber-600 dark:text-amber-500 tabular-nums">{score}</span>
        </div>
      </div>

      {/* 2. SAVOL (MEANING) */}
      <div className="w-full max-w-md h-24 flex items-center justify-center text-center flex-none z-10 px-2 overflow-hidden relative">
        <motion.h2 key={currentLevelIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`font-black italic tracking-tighter leading-none break-words uppercase ${level.meaning.length > 20 ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'}`}>
          {level.meaning}
        </motion.h2>
      </div>

      {/* 3. MARKAZIY KARTA */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-0 z-10">
        <div className="relative w-full max-w-[180px] sm:max-w-[260px] aspect-square flex items-center justify-center bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-[50px] border-[4px] border-white dark:border-slate-800 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {gameState === "success" ? (
              <motion.div key="success" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center">
                 <div className="text-7xl sm:text-9xl font-black text-blue-600 dark:text-blue-400 drop-shadow-2xl">{level.targetKanji}</div>
                 <div className="text-blue-500 font-black tracking-widest uppercase text-[10px] mt-1">{level.reading}</div>
              </motion.div>
            ) : (
              <div className="text-7xl sm:text-9xl text-slate-300 dark:text-slate-800 font-black italic">?</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. JAVOBLAR */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3 sm:gap-4 flex-none z-10 px-2 pt-4 relative">
        {shuffledOptions.map((option, idx) => (
          <motion.button key={`${currentLevelIdx}-${idx}`} whileTap={{ y: 5 }} onClick={() => handleSelect(option)} className="relative h-16 sm:h-24 transition-all">
            <div className={`absolute inset-0 rounded-[24px] translate-y-1.5 ${selectedKanji === option && gameState === "success" ? "bg-green-700" : selectedKanji === option && gameState === "error" ? "bg-red-700" : "bg-slate-300 dark:bg-slate-800"}`} />
            <div className={`absolute inset-0 rounded-[24px] flex items-center justify-center text-4xl sm:text-6xl font-black border-t border-white/20 ${selectedKanji === option && gameState === "success" ? "bg-green-500 text-white" : selectedKanji === option && gameState === "error" ? "bg-red-500 text-white animate-shake" : "bg-white/90 dark:bg-slate-700 dark:text-slate-900 dark:text-white shadow-sm backdrop-blur-sm"}`}>
              {option}
            </div>
          </motion.button>
        ))}
      </div>

      {/* PAUSE MENU */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white/20 dark:bg-black/40 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/30 flex flex-col items-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500/50 via-white/50 to-pink-500/50"></div>

              <h2 className="text-4xl font-black italic mb-8 text-white uppercase tracking-tighter mt-4 drop-shadow-md">
                Pauza
              </h2>

              <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={() => setIsPaused(false)} 
                  className="h-14 bg-white/90 text-blue-600 rounded-[20px] font-black text-lg shadow-lg active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  <Play className="w-6 h-6 fill-current" /> DAVOM ETISH
                </button>

                <button 
                  onClick={() => { setIsPaused(false); startFreshGame(); }} 
                  className="h-14 bg-amber-500/80 text-white border border-white/20 rounded-[20px] font-black text-lg shadow-lg active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                >
                  <RotateCcw className="w-6 h-6" /> QAYTA BOSHLASH
                </button>

                <button 
                  onClick={() => { setIsPaused(false); setIsStarted(false); }} 
                  className="h-14 bg-black/20 text-white border border-white/10 rounded-[20px] font-black text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <Home className="w-6 h-6" /> MENYUGA QAYTISH
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        html, body { overflow: hidden !important; height: 100% !important; position: fixed; width: 100%; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.15s ease-in-out 2; }
      `}</style>
    </div>
  );
}