"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Grid, LogOut, Lock, X } from 'lucide-react';
import Link from 'next/link';

interface MainMenuProps {
  onStart: (levelIndex?: number) => void;
  highestLevel: number;
  totalLevels: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, highestLevel, totalLevels }) => {
  const [showLevels, setShowLevels] = useState(false);

  return (
    // 1. Ota quti (Wrapper): Kompyuterda nisbiy (relative), mobil telefonda esa to'liq ekran (fixed) qilib moslashtirildi.
    <div className="max-md:fixed max-md:inset-0 max-md:z-[999] md:relative w-full h-[100dvh] md:h-full min-h-[500px] overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-[#7dd3fc] to-[#f0fdf4] dark:from-slate-950 dark:to-slate-900 md:rounded-[35px] border border-transparent dark:border-white/10 select-none">
      
      {/* ORQA FONDAGI BEZAKLAR (Ixtiyoriy) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none md:rounded-[35px]">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-green-400/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white/40 dark:bg-slate-800/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[40px] shadow-2xl border border-white/50 dark:border-white/10 w-full max-w-sm text-center"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 mb-2 drop-shadow-sm uppercase tracking-tighter">
          So'z <br/> Bog'i
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 sm:mb-10 text-sm sm:text-base">
          Kanji so'zlarni toping
        </p>

        <div className="flex flex-col gap-3 sm:gap-4">
          {/* START TUGMASI (Oxirgi ochiq bosqichdan davom etadi) */}
          <button 
            onClick={() => onStart(highestLevel - 1)}
            className="group relative w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-3xl font-black text-xl sm:text-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-3"
          >
            <Play className="fill-white w-5 h-5 sm:w-6 sm:h-6" />
            <span>START</span>
          </button>

          {/* DARAJALAR (LEVELS) TUGMASI */}
          <button 
            onClick={() => setShowLevels(true)}
            className="w-full py-3.5 sm:py-4 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-3xl font-bold text-base sm:text-lg shadow-sm border border-white/50 dark:border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <Grid className="w-5 h-5" />
            <span>Levels</span>
          </button>

          {/* QUIT (CHIQISH) TUGMASI */}
          <Link href="/dashboard/games" className="w-full py-3.5 sm:py-4 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-3xl font-bold text-base sm:text-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
            <LogOut className="w-5 h-5" />
            <span>Quit</span>
          </Link>
        </div>
      </motion.div>

      {/* DARAJALAR (LEVELS) MODAL OYNASI */}
      <AnimatePresence>
        {showLevels && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            // 2. Modaldagi "fixed" o'rniga "absolute" ishlatildi. Endi u saydbarni yopib qo'ymaydi, faqat o'yinni o'zini qoplaydi.
            className="absolute inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md md:rounded-[35px]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 50 }}
              className="bg-[#0f172a] border border-white/10 p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] shadow-2xl w-full max-w-lg relative"
            >
              <button 
                onClick={() => setShowLevels(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded-full text-white/50 transition-all"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 sm:mb-6 uppercase tracking-wider text-center mt-2">Darajalar</h2>
              
              {/* BOSQICHLAR TO'RI (GRID) */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar pb-2">
                {[...Array(totalLevels)].map((_, i) => {
                  const levelNum = i + 1;
                  const isUnlocked = levelNum <= highestLevel;
                  
                  return (
                    <button 
                      key={i} 
                      disabled={!isUnlocked}
                      onClick={() => onStart(i)}
                      className={`relative aspect-square flex items-center justify-center rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl transition-all shadow-sm ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer' 
                          : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? levelNum : <Lock size={18} className="opacity-50 sm:w-5 sm:h-5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MainMenu;