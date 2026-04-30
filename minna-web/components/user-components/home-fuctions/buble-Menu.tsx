"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Grid, LogOut } from "lucide-react";
import Link from "next/link";

const FloatingClouds = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {[1, 2, 3, 4, 5].map((cloud, index) => (
      <motion.div key={cloud} className="absolute opacity-40 sm:opacity-60" style={{ top: `${index * 18}%`, left: "-30%" }} animate={{ x: ["0vw", "130vw"] }} transition={{ duration: 25 + Math.random() * 15, ease: "linear", repeat: Infinity, delay: Math.random() * 10 }}>
        <div className="w-16 h-8 sm:w-24 sm:h-12 bg-white/80 dark:bg-white/10 rounded-full relative shadow-sm">
          <div className="absolute w-10 h-10 sm:w-16 sm:h-16 bg-white/80 dark:bg-white/10 rounded-full -top-4 sm:-top-6 left-2"></div>
          <div className="absolute w-8 h-8 sm:w-12 sm:h-12 bg-white/80 dark:bg-white/10 rounded-full -top-3 sm:-top-4 left-8 sm:left-10"></div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default function GameMenu({
  setGameState,
  setShowLevelsModal,
  showLevelsModal,
  TOTAL_LEVELS,
  highestLevel,
  currentLevelId,
  changeLevel
}: any) {
  return (
    <div className="max-md:fixed max-md:inset-0 max-md:z-[999] relative w-full h-[100dvh] md:h-[calc(100vh-80px)] md:min-h-[650px] flex flex-col items-center justify-center px-4 overflow-hidden md:rounded-[40px] bg-gradient-to-b from-[#1a3a6e] via-[#3a6fc4] to-[#7aa8d8] dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 border border-transparent dark:border-white/10 select-none">
      <FloatingClouds />
      
     {/* --- ORQA FONDAGI BEZAK SHARLAR --- */}
      
      {/* 1-SHAR (Yashil - It) */}
      <motion.div animate={{ y: [0, -14, 0], rotate: [-3, 2, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-50 scale-75 md:scale-100 top-[8%] left-[5%] origin-top flex flex-col items-center hidden sm:flex will-change-transform">
        <div style={{ width: '72px', height: '86px', background: 'radial-gradient(circle at 35% 32%, #7ee87a, #2db82a 60%, #1a7a18)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -6px -8px 16px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[34px] font-black text-white drop-shadow-md">犬</span></div>
        <div className="w-[2px] h-[55px] bg-white/40 mt-[1px]"></div>
      </motion.div>

      {/* 2-SHAR (Qizil - Qush) */}
      <motion.div animate={{ y: [0, -15, 0], rotate: [1, -3, 1] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="absolute z-50 scale-75 md:scale-100 top-[15%] left-[20%] origin-top flex flex-col items-center hidden sm:flex will-change-transform">
        <div style={{ width: '68px', height: '80px', background: 'radial-gradient(circle at 35% 30%, #ff8a90, #ff4e63 55%, #cc0022)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[30px] font-black text-white drop-shadow-md">鳥</span></div>
        <div className="w-[2px] h-[50px] bg-white/40 mt-[1px]"></div>
      </motion.div>

      {/* 3-SHAR (Ko'k - Mushuk) */}
      <motion.div animate={{ y: [0, -18, 0], rotate: [2, -2, 2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute z-50 scale-75 md:scale-100 top-[2%] left-[38%] origin-top flex flex-col items-center hidden sm:flex will-change-transform">
        <div style={{ width: '82px', height: '98px', background: 'radial-gradient(circle at 35% 30%, #7bbfee, #3a8fd4 55%, #1a5fa0)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -8px -10px 20px rgba(0,0,0,0.25), inset 4px 4px 10px rgba(255,255,255,0.3), 0 6px 18px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[38px] font-black text-white drop-shadow-md">猫</span></div>
        <div className="w-[2px] h-[65px] bg-white/40 mt-[1px]"></div>
      </motion.div>

      {/* 4-SHAR (Sariq - Baliq) */}
      <motion.div animate={{ y: [0, -16, 0], rotate: [-2, 3, -2] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute z-50 scale-75 md:scale-100 top-[10%] left-[55%] origin-top flex flex-col items-center hidden sm:flex will-change-transform">
        <div style={{ width: '76px', height: '90px', background: 'radial-gradient(circle at 35% 30%, #fde047, #eab308 55%, #a16207)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -8px -10px 18px rgba(0,0,0,0.25), inset 4px 4px 10px rgba(255,255,255,0.4), 0 5px 15px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[36px] font-black text-white drop-shadow-md">魚</span></div>
        <div className="w-[2px] h-[60px] bg-white/40 mt-[1px]"></div>
      </motion.div>

      {/* 5-SHAR (Siyohrang - Gul) */}
      <motion.div animate={{ y: [0, -13, 0], rotate: [3, -1, 3] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="absolute z-50 scale-75 md:scale-100 top-[4%] left-[72%] origin-top flex flex-col items-center hidden sm:flex will-change-transform">
        <div style={{ width: '70px', height: '84px', background: 'radial-gradient(circle at 35% 30%, #d8b4fe, #a855f7 55%, #6b21a8)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -6px -8px 15px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[32px] font-black text-white drop-shadow-md">花</span></div>
        <div className="w-[2px] h-[52px] bg-white/40 mt-[1px]"></div>
      </motion.div>

      {/* 6-SHAR (Zarg'aldoq - Mashina) */}
      <motion.div animate={{ y: [0, -17, 0], rotate: [-1, 4, -1] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }} className="absolute z-50 scale-75 md:scale-100 top-[18%] left-[88%] origin-top flex flex-col items-center hidden sm:flex will-change-transform">
        <div style={{ width: '66px', height: '78px', background: 'radial-gradient(circle at 35% 30%, #fdba74, #f97316 55%, #c2410c)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -5px -7px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 10px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[28px] font-black text-white drop-shadow-md">車</span></div>
        <div className="w-[2px] h-[45px] bg-white/40 mt-[1px]"></div>
      </motion.div>

      {/* ASOSIY OYNA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[340px] md:max-w-[750px] bg-[#3f67aa0d] dark:bg-black/30 backdrop-blur-[24px] border border-[#6b8ad71f] dark:border-white/10 rounded-[24px] md:rounded-[32px] p-6 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-center gap-8 md:gap-12 lg:gap-16">
        
        {/* CHAP TARAFI - LOGO/SARLAVHA */}
        <div className="w-full md:w-[45%] flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-4xl md:text-[56px] font-black text-white leading-tight tracking-tight uppercase drop-shadow-lg mb-2">
            KANJI <br className="hidden md:block" /> POP
          </h2>
          <p className="text-xs md:text-sm font-bold text-blue-200/80 dark:text-white/60 uppercase tracking-[0.2em] mb-4">
            Yapon Tilini O'rganamiz
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
             <span className="text-white/80 text-xs font-medium uppercase tracking-wider">Joriy Daraja:</span>
             <span className="text-yellow-400 font-black text-sm">{currentLevelId}</span>
          </div>
        </div>

        <div className="hidden md:block w-px h-[200px] bg-white/10 self-center"></div>
        <div className="block md:hidden h-px w-full bg-white/10"></div>

        {/* O'NG TARAFI - TUGMALAR */}
        <div className="w-full md:w-[50%] flex flex-col gap-4">
          
          {/* START TUGMASI */}
          <button
            onClick={() => setGameState('playing')}
            className="group w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/50 active:scale-95"
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl sm:text-3xl font-black text-white uppercase tracking-[0.1em]">
              START
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
            {/* LEVELS TUGMASI */}
            <button 
              onClick={() => setShowLevelsModal(true)}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 sm:py-4 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl sm:rounded-2xl text-white/90 hover:text-white transition-all active:scale-95"
            >
              <Grid className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Levels</span>
            </button>
            
            {/* QUIT TUGMASI */}
            <Link 
              href="/dashboard/games"
              className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 sm:py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl sm:rounded-2xl text-red-200 hover:text-red-100 transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Quit</span>
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* DARAJALAR MODALI */}
      <AnimatePresence>
        {showLevelsModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl md:rounded-[40px]">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-slate-900 border border-white/20 p-6 sm:p-8 rounded-[30px] shadow-2xl w-[90%] max-w-[500px] flex flex-col items-center">
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-wider">Darajalar</h2>
                <div className="grid grid-cols-4 gap-3 w-full mb-6 max-h-[40vh] overflow-y-auto pr-2">
                   {[...Array(TOTAL_LEVELS)].map((_, i) => {
                      const levelNum = i + 1;
                      const isUnlocked = levelNum <= highestLevel;
                      const isCurrent = levelNum === currentLevelId;
                      
                      return (
                        <button 
                          key={i} 
                          disabled={!isUnlocked}
                          onClick={() => changeLevel(levelNum)}
                          className={`flex items-center justify-center h-12 rounded-xl font-bold text-lg transition-all ${
                            isCurrent ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                            : isUnlocked ? 'bg-white/10 text-white hover:bg-white/20' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          {isUnlocked ? levelNum : '🔒'}
                        </button>
                      )
                   })}
                </div>
                <button onClick={() => setShowLevelsModal(false)} className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-full font-black text-lg uppercase transition-all shadow-lg shadow-red-500/30">Orqaga</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}