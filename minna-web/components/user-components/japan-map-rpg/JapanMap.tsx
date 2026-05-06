"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Play, Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const MAIN_ISLANDS_COORDS = [
  { id: "kyushu", name: "Kyushu", x: "18.5%", y: "69.5%", japanese: "九州" },
  { id: "shikoku", name: "Shikoku", x: "30.5%", y: "65.5%", japanese: "四国" },
  { id: "honshu", name: "Honshu", x: "50.5%", y: "63.5%", japanese: "本州" },
  { id: "hokkaido", name: "Hokkaido", x: "78.5%", y: "20.5%", japanese: "北海道" },
];

export default function JapanMainMap() {
  const router = useRouter();
  const [unlockedRegions, setUnlockedRegions] = useState<string[]>(["kyushu"]);
  const [currentRegionId, setCurrentRegionId] = useState("kyushu");

  useEffect(() => {
    const saved = localStorage.getItem("questProgress");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.regions) {
        setUnlockedRegions(data.regions);
        setCurrentRegionId(data.regions[data.regions.length - 1]);
      }
    }
  }, []);

  return (
    /**
     * DIQQAT: 
     * 1. 'h-full' va 'w-full' - ota element (Dashboard Layout) bergan joyni egallaydi.
     * 2. 'min-h-0' - flexbox ichida siqilishga imkon beradi (scroll chiqmasligi uchun).
     * 3. 'relative' - ichidagi 'absolute' elementlar uchun ramka bo'ladi.
     */
    <div className="relative w-full h-full min-h-0 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center p-4 md:p-8">
      
      <div 
        className="bg_xarita relative w-full aspect-[16/10] max-h-full max-w-[1200px] shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        style={{ backgroundSize: '100% 100%' }}
      >
        
        {/* HEADER */}
        <div className="absolute top-[5%] left-0 w-full z-10 text-center pointer-events-none px-4">
          <h1 className="text-[4vw] md:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter drop-shadow-sm">
            KANJIO<span className="text-blue-600">QUEST</span>
          </h1>
        </div>

        {/* HOME TUGMASI */}
        <button
          onClick={() => router.push("/dashboard/games")}
          className="absolute top-[5%] left-[3%] z-50 flex items-center gap-2 px-[2%] py-[1%] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95 text-[1.5vw] md:text-sm"
        >
          <ArrowLeft className="w-[1.2vw] h-[1.2vw] md:w-4 md:h-4 text-slate-600 dark:text-slate-300" />
          <span className="font-bold text-slate-700 dark:text-slate-200">Home</span>
        </button>

        {/* YO'L CHIZIG'I */}
        <svg 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 18.5 69.5 L 30.5 65.5 L 50.5 63.5 L 78.5 20.5"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
            strokeDasharray="1,1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>

        {/* HUDUDLAR */}
        {MAIN_ISLANDS_COORDS.map((island) => {
          const isUnlocked = unlockedRegions.includes(island.id);
          const isCurrent = island.id === currentRegionId;
          const isPassed = isUnlocked && !isCurrent;

          return (
            <div 
              key={island.id} 
              className="absolute z-40"
              style={{ 
                left: island.x, 
                top: island.y, 
                transform: "translate(-50%, -50%)" 
              }}
            >
              <div className="flex flex-col items-center group">
                <div className={`mb-[10%] px-[15%] py-[5%] rounded-lg text-[1.2vw] md:text-[10px] font-black uppercase border whitespace-nowrap shadow-sm transition-all pointer-events-none ${
                  isCurrent 
                    ? "bg-blue-600 text-white border-blue-500 scale-110 shadow-blue-500/30" 
                    : "bg-white/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}>
                  {island.name}
                </div>

                <button
                  onClick={() => {
                    if (isUnlocked) {
                      router.push(`/dashboard/games/map/${island.id}`);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`relative w-[6vw] h-[6vw] max-w-[80px] max-h-[80px] min-w-[40px] min-h-[40px] rounded-full border-[0.3vw] md:border-4 flex items-center justify-center transition-all duration-300 active:scale-90 ${
                    isUnlocked 
                      ? "cursor-pointer hover:shadow-2xl shadow-lg" 
                      : "cursor-not-allowed opacity-70 grayscale"
                  } ${
                    isCurrent 
                      ? "bg-white dark:bg-slate-800 border-blue-500 scale-110" 
                      : isPassed 
                        ? "bg-emerald-500 border-emerald-300" 
                        : "bg-slate-200/50 dark:bg-slate-900/50 border-white/40 backdrop-blur-sm"
                  }`}
                >
                  {isCurrent ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <Play className="w-[50%] h-[50%] text-blue-600 fill-blue-600 ml-[5%]" />
                      <motion.div 
                        className="absolute -inset-[20%] border-[0.3vw] md:border-4 border-blue-500 rounded-full" 
                        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }} 
                      />
                    </div>
                  ) : isPassed ? (
                    <Check className="w-[50%] h-[50%] text-white stroke-[4px]" />
                  ) : (
                    <Lock className="w-[40%] h-[40%] text-slate-400/60" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}