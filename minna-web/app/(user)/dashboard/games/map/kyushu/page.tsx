"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Play, Check, ArrowLeft } from "lucide-react"; // Check ikonkasi qo'shildi
import { useRouter } from "next/navigation";
import { JAPAN_REGIONS } from "@/components/user-components/japan-map-rpg/data";

const KYUSHU_COORDS = [
  { id: 1, name: "Fukuoka", x: "55%", y: "20%" },
  { id: 2, name: "Saga", x: "42%", y: "25%" },
  { id: 3, name: "Nagasaki", x: "30%", y: "40%" },
  { id: 4, name: "Kumamoto", x: "50%", y: "45%" },
  { id: 5, name: "Oita", x: "75%", y: "35%" },
  { id: 6, name: "Miyazaki", x: "75%", y: "65%" },
  { id: 7, name: "Kagoshima", x: "55%", y: "80%" },
];

export default function KyushuPage() {
  const router = useRouter();
  const [unlockedStage, setUnlockedStage] = useState(1);
  const kyushu = JAPAN_REGIONS.find(r => r.id === "kyushu");

  useEffect(() => {
    const saved = localStorage.getItem("questProgress");
    if (saved) setUnlockedStage(JSON.parse(saved).stage || 1);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-120px)] bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
      <div className="w-full h-full max-w-5xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 relative flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-10 left-0 w-full z-20 text-center">
          <button onClick={() => router.push("/dashboard/games/map")} className="absolute left-10 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Kyushu Adventure</h2>
        </div>

        <div className="relative flex-1 w-full h-full flex items-center justify-center">
          {/* Yo'llar */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 55 20 L 42 25 L 30 40 L 50 45 L 75 35 L 75 65 L 55 80" fill="none" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2,2" />
          </svg>

          {KYUSHU_COORDS.map((pt) => {
            const isPassed = pt.id < unlockedStage; // O'tilgan bosqichlar
            const isCurrent = pt.id === unlockedStage; // Hozirgi bosqich
            const isLocked = pt.id > unlockedStage; // Yopiq bosqichlar
            
            const stage = kyushu?.stages.find(s => s.id === pt.id);

            return (
              <div key={pt.id} className="absolute z-20" style={{ left: pt.x, top: pt.y, transform: "translate(-50%, -50%)" }}>
                <div className="flex flex-col items-center group">
                  
                  {/* Bosqich nomi - Holatga qarab rangi o'zgaradi */}
                  <div className={`mb-3 px-3 py-1 rounded-xl text-[10px] font-black uppercase shadow-sm border transition-all ${
                    isPassed ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    isCurrent ? "bg-blue-600 text-white border-blue-600 animate-bounce" :
                    "bg-slate-50 text-slate-400 border-slate-100"
                  }`}>
                    {pt.name}
                  </div>

                  {/* Tugma - Dizayn har xil holat uchun */}
                  <button
                    onClick={() => !isLocked && stage && router.push(stage.route)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-[30px] border-2 flex items-center justify-center transition-all duration-500 ${
                      isPassed ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20 hover:scale-110" :
                      isCurrent ? "bg-white dark:bg-slate-800 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-110" :
                      "bg-slate-100 dark:bg-slate-900 border-slate-200 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {/* Markaziy ikonka */}
                    {isPassed ? (
                      <Check className="w-8 h-8 text-white stroke-[4px]" />
                    ) : isCurrent ? (
                      <div className="relative">
                        <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
                        <motion.div 
                          className="absolute -inset-4 border-4 border-blue-500 rounded-[35px]"
                          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      </div>
                    ) : (
                      <Lock className="w-6 h-6 text-slate-400" />
                    )}
                  </button>

                  {/* Progress indikatori (faqat o'tilganlar uchun kichik yulduzcha kabi) */}
                  {isPassed && (
                    <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-md border-2 border-white">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}