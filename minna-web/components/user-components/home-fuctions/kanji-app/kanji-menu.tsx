"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Home, Sparkles, Lock, ChevronRight, Crown } from "lucide-react";

interface KanjiMenuProps {
  onStart: () => void;
  onRestartScore: () => void;
  onQuit: () => void;
  totalLevels: number;
  currentScore: number;
  selectedLevel: "N5" | "N4";
  onLevelChange: (lvl: "N5" | "N4") => void;
  totalStages: number;
  selectedStage: number;
  onStageChange: (stageIndex: number) => void;
  maxUnlockedStage: number;
}

export default function KanjiMenu({ 
  onStart, onRestartScore, onQuit, totalLevels, currentScore, selectedLevel, onLevelChange,
  totalStages, selectedStage, onStageChange, maxUnlockedStage
}: KanjiMenuProps) {
  return (
    /* 
       ASOSIY O'ZGARISH (SHU YERDA): 
       1. "fixed" o'rniga "absolute" qo'yildi (Saytbarni yopib qo'ymasligi uchun o'zining div'i ichida qoladi).
       2. sm:inset-4 lg:inset-6 berildi (Katta ekranlarda saytbar yonida bo'sh joy tashlab chiroyli ramka bo'ladi).
       3. z-50 olib tashlandi.
    */
    <div className="absolute inset-0 sm:inset-4 lg:inset-6 flex flex-col items-center bg_kanji_imag text-slate-900 dark:text-white p-4 overflow-hidden pb-[80px] sm:pb-8 pt-8 sm:pt-12 rounded-none sm:rounded-[32px] lg:rounded-[48px] sm:shadow-2xl">
      
      {/* Premium Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md h-full flex flex-col items-center justify-between sm:justify-center gap-4 sm:gap-6 z-10 relative">
        
        {/* --- 1. HERO SECTION --- */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-400/10 dark:to-indigo-400/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full mb-2 sm:mb-4 border border-blue-500/20 shadow-sm backdrop-blur-md">
            <Crown className="w-3 h-3 fill-current" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Premium Course</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter italic mb-1 leading-none drop-shadow-sm">
            KANJI<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-indigo-600">PRO</span>
          </h1>
        </motion.div>

        {/* --- 2. LEVEL SWITCHER --- */}
        <div className="bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-xl p-1 rounded-[16px] w-full max-w-[200px] flex mx-auto shadow-inner border border-white/50 dark:border-white/5">
          {(["N5", "N4"] as const).map((lvl) => (
            <button key={lvl} onClick={() => onLevelChange(lvl)}
              className={`flex-1 h-8 sm:h-10 rounded-[12px] font-black text-base sm:text-lg transition-all duration-300
                ${selectedLevel === lvl 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* --- 3. STAGES GRID --- */}
        <div className="w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          
          <div className="flex justify-between items-end mb-3 px-1">
            <div>
              <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joriy daraja</div>
              <div className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">{totalLevels} ta Kanji</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-0.5">Umumiy Ball</div>
              <div className="text-lg sm:text-xl font-black text-amber-500 tabular-nums">{currentScore}</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 max-h-[140px] sm:max-h-[160px] overflow-y-auto pr-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {Array.from({ length: totalStages }).map((_, i) => {
              const isLocked = i > maxUnlockedStage;
              const isSelected = selectedStage === i;
              
              return (
                <button key={i} onClick={() => !isLocked && onStageChange(i)} disabled={isLocked}
                  className={`relative flex items-center justify-center h-10 sm:h-14 rounded-[14px] sm:rounded-[18px] font-black text-lg sm:text-xl transition-all duration-200
                    ${isLocked 
                      ? "bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 border border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed" 
                      : isSelected 
                        ? "bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-[0_3px_0_rgb(180,83,9)] translate-y-[-2px] border-none" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-[0_3px_0_rgb(226,232,240)] dark:shadow-[0_3px_0_rgb(15,23,42)] hover:translate-y-[-1px]"
                    }`}
                >
                  {isLocked ? <Lock className="w-4 h-4 sm:w-5 sm:h-5 opacity-40" /> : i + 1}
                  {isSelected && <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-200 fill-current animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- 4. ACTION BUTTONS --- */}
        <div className="w-full flex flex-col gap-3 px-1">
          <motion.button whileTap={{ y: 4 }} onClick={onStart} className="relative w-full h-16 sm:h-20 group">
            <div className="absolute inset-0 bg-blue-800 dark:bg-blue-900 rounded-[24px] sm:rounded-[30px] translate-y-1.5 sm:translate-y-2" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-[24px] sm:rounded-[30px] flex items-center justify-center gap-2 sm:gap-3 border-t-2 border-white/20 shadow-xl group-active:translate-y-1.5 sm:group-active:translate-y-2 group-active:border-t-0 transition-all duration-150">
              <Play className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-current drop-shadow-md" />
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white drop-shadow-md uppercase">
                {selectedStage + 1}-Bosqich
              </span>
              <ChevronRight className="absolute right-4 sm:right-6 w-5 h-5 sm:w-6 sm:h-6 text-white/50" />
            </div>
          </motion.button>

          <div className="flex items-center justify-center gap-1 mx-auto bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-1 rounded-full border border-white/60 dark:border-white/10 shadow-sm w-full max-w-[260px]">
             <button 
               onClick={onQuit} 
               className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full font-bold text-[9px] sm:text-[10px] tracking-widest text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm shadow-red-500/5 uppercase transition-all duration-200 active:scale-95"
             >
               <Home className="w-3 h-3" /> Chiqish
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}