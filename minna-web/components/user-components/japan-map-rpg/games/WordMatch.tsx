"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { unlockNextStage } from "@/components/user-components/japan-map-rpg/data";
import Link from "next/link";
import { Trophy } from "lucide-react";

export default function WordMatch({ stageId }: { stageId: number }) {
  const [pairs, setPairs] = useState([
    { ja: "人", uz: "Odam", matched: false },
    { ja: "木", uz: "Daraxt", matched: false },
    { ja: "水", uz: "Suv", matched: false },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [victory, setVictory] = useState(false);

  const handleMatch = (item: string) => {
    if (!selected) {
      setSelected(item);
    } else {
      // Tekshirish mantiqi
      const isMatch = pairs.some(p => (p.ja === selected && p.uz === item) || (p.uz === selected && p.ja === item));
      if (isMatch) {
        setPairs(prev => prev.map(p => (p.ja === selected || p.uz === selected) ? { ...p, matched: true } : p));
      }
      setSelected(null);
    }
  };

  useEffect(() => {
    if (pairs.every(p => p.matched)) {
      setVictory(true);
      unlockNextStage(stageId);
    }
  }, [pairs, stageId]);

  if (victory) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center bg-slate-900 p-12 rounded-[3rem] border border-blue-500">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-6">Word Match Tugadi!</h2>
        <Link href="/dashboard/games/map/kyushu" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Xaritaga Qaytish</Link>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-8">
      <h2 className="text-xl font-bold mb-12 text-blue-500">SO'ZLARNI BIRLASHTIRING</h2>
      <div className="grid grid-cols-2 gap-8 max-w-md w-full">
        <div className="space-y-4">
          {pairs.map(p => (
            <button 
              key={p.ja} 
              disabled={p.matched}
              onClick={() => handleMatch(p.ja)}
              className={`w-full p-6 rounded-2xl border-2 transition-all ${p.matched ? "opacity-0" : selected === p.ja ? "border-blue-500 bg-blue-500/20" : "border-slate-800 bg-slate-900"}`}
            >
              {p.ja}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {[...pairs].sort(() => Math.random() - 0.5).map(p => (
            <button 
              key={p.uz} 
              disabled={p.matched}
              onClick={() => handleMatch(p.uz)}
              className={`w-full p-6 rounded-2xl border-2 transition-all ${p.matched ? "opacity-0" : selected === p.uz ? "border-blue-500 bg-blue-500/20" : "border-slate-800 bg-slate-900"}`}
            >
              {p.uz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}