"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RotateCcw, Trophy, Star, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { LEVELS } from './levels';

const WordGardenGame = () => {
  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel = LEVELS[levelIdx];
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineCoords, setLineCoords] = useState<{x1: number, y1: number, x2: number, y2: number}[]>([]);
  
  // --- TANGA VA YORDAM TIZIMI ---
  const [coins, setCoins] = useState(0); 
  const [revealedHints, setRevealedHints] = useState<{wordIdx: number, charIdx: number}[]>([]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';

    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.touchAction = 'auto';
    };
  }, []);

  const updateLines = () => {
    if (selectedIndices.length < 2) {
      setLineCoords([]);
      return;
    }
    const newLines = [];
    const parentRect = containerRef.current?.getBoundingClientRect();
    if (!parentRect) return;

    for (let i = 0; i < selectedIndices.length - 1; i++) {
      const startEl = document.getElementById(`letter-${selectedIndices[i]}`);
      const endEl = document.getElementById(`letter-${selectedIndices[i+1]}`);
      if (startEl && endEl) {
        const r1 = startEl.getBoundingClientRect();
        const r2 = endEl.getBoundingClientRect();
        newLines.push({
          x1: r1.left + r1.width / 2 - parentRect.left,
          y1: r1.top + r1.height / 2 - parentRect.top,
          x2: r2.left + r2.width / 2 - parentRect.left,
          y2: r2.top + r2.height / 2 - parentRect.top,
        });
      }
    }
    setLineCoords(newLines);
  };

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [selectedIndices]);

  const currentString = selectedIndices.map(i => currentLevel.letters[i]).join("");

  const handleInput = (index: number) => {
    if (!selectedIndices.includes(index)) {
      setSelectedIndices(prev => [...prev, index]);
    }
  };

  const checkWord = () => {
    if (currentLevel.targetWords.includes(currentString) && !foundWords.includes(currentString)) {
      setFoundWords(prev => [...prev, currentString]);
      setCoins(prev => prev + 10); // So'z topganda +10 tanga

      if (foundWords.length + 1 === currentLevel.targetWords.length) {
        setCoins(prev => prev + 30); // Bosqich yutilganda +30 tanga
        setTimeout(() => setIsLevelComplete(true), 500);
      }
    }
    setSelectedIndices([]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.id.startsWith('letter-')) {
      const index = parseInt(element.id.split('-')[1]);
      handleInput(index);
    }
  };

  // 💡 YORDAM (HINT) FUNKSIYASI
  const handleHint = () => {
    if (coins < 30) return; // Tangasi yetmasa ishlamaydi

    const unrevealed: { wIdx: number, cIdx: number, char: string }[] = [];

    // Topilmagan so'zlar ichidan hali ochilmagan harflarni qidiramiz
    currentLevel.targetWords.forEach((word, wIdx) => {
      if (!foundWords.includes(word)) {
        word.split("").forEach((char, cIdx) => {
          const alreadyHinted = revealedHints.some(h => h.wordIdx === wIdx && h.charIdx === cIdx);
          if (!alreadyHinted) {
            unrevealed.push({ wIdx, cIdx, char });
          }
        });
      }
    });

    // Agar ochilmagan harflar qolgan bo'lsa, tasodifiy bittasini ochamiz
    if (unrevealed.length > 0) {
      const randomHint = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedHints(prev => [...prev, { wordIdx: randomHint.wIdx, charIdx: randomHint.cIdx }]);
      setCoins(prev => prev - 30); // 30 tanga yechib olamiz
    }
  };

  // 🔄 BOSQICHNI QAYTA BOSHLASH (Tangalarni saqlab qoladi)
  const resetLevel = () => {
    setFoundWords([]);
    setRevealedHints([]);
    setSelectedIndices([]);
    setLineCoords([]);
  };

  return (
    <div className="max-md:fixed max-md:inset-0 max-md:z-[999] md:relative w-full h-[100dvh] md:h-full md:max-h-[calc(100vh-120px)] overflow-hidden flex flex-col font-sans bg-[#e0f2fe] dark:bg-[#020617] md:rounded-[35px] shadow-2xl select-none touch-none scrollbar-hide border-none outline-none">
      
      {/* 🌳 BACKGROUND ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-100 dark:opacity-0 bg-gradient-to-b from-[#7dd3fc] to-[#f0fdf4] transition-all duration-1000">
          <div className="absolute top-[10%] left-[5%] w-64 h-20 bg-white/40 blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 w-full h-1/2 bg-[radial-gradient(circle_at_bottom,_#4ade8033_0%,_transparent_70%)] rounded-t-[100px]" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-3 h-3 bg-pink-300/50 rounded-full animate-petal" style={{ left: `${i * 18}%`, animationDelay: `${i * 2}s` }} />
          ))}
        </div>
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[#02040a] transition-all duration-1000">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full animate-twinkle" style={{ width: '1.5px', height: '1.5px', top: Math.random()*100+'%', left: Math.random()*100+'%', animationDelay: Math.random()*5+'s' }} />
          ))}
        </div>
      </div>

      {/* --- ASOSIY CONTENT --- */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-5xl mx-auto overflow-hidden">
        
        {/* --- HUD --- */}
        <div className="flex items-center justify-between p-3 sm:p-6 pt-6 sm:pt-6 h-[12%] min-h-[75px] bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-b-3xl border-b border-white/20">
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard/games" className="p-2 sm:p-3 bg-white/50 dark:bg-white/10 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm">
              <ChevronLeft size={20} />
            </Link>
            <button onClick={resetLevel} className="p-2 sm:p-3 bg-white/50 dark:bg-white/10 rounded-xl hover:bg-blue-500 hover:text-white text-slate-700 dark:text-slate-300 transition-all shadow-sm active:rotate-180 duration-500">
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="text-center flex-1">
            <h2 className="text-lg sm:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">LEVEL {currentLevel.id}</h2>
            <div className="flex justify-center gap-1 mt-1">
              {currentLevel.targetWords.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i < foundWords.length ? 'bg-emerald-500 w-5 sm:w-6 shadow-md' : 'bg-slate-300 dark:bg-slate-800 w-2 sm:w-3'}`} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 💡 CHIROQCHA (HINT) TUGMASI */}
            <button 
              onClick={handleHint}
              disabled={coins < 30}
              className={`p-2 sm:p-3 rounded-xl transition-all shadow-sm 
                ${coins >= 30 
                  ? 'bg-white/50 dark:bg-white/10 hover:bg-yellow-400 hover:text-white text-yellow-600 dark:text-yellow-400 active:scale-90 cursor-pointer' 
                  : 'bg-white/20 dark:bg-white/5 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed'}`}
            >
              <Lightbulb size={20} />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-b-2 border-orange-700 shadow-lg">
              <Star className="text-white fill-white animate-bounce" size={16} />
              <motion.span 
                key={coins}
                initial={{ scale: 1.5, color: "#fcd34d" }}
                animate={{ scale: 1, color: "#fff" }}
                className="font-black text-white text-sm sm:text-base min-w-[30px] sm:min-w-[40px] text-center"
              >
                {coins}
              </motion.span>
            </div>
          </div>
        </div>

        {/* PLAY AREA */}
        <div className="flex-1 flex flex-col items-center justify-evenly py-4 sm:py-6 max-md:pb-16 overflow-hidden px-4">
          
          {/* WORD GRID */}
          <div className="flex flex-wrap justify-center gap-3 w-full max-h-[30%] overflow-hidden">
            {currentLevel.targetWords.map((word, wIdx) => {
              const isFound = foundWords.includes(word);

              return (
                <div key={wIdx} className="flex gap-1.5 bg-white/10 dark:bg-black/30 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
                  {word.split("").map((char, cIdx) => {
                    const isHinted = revealedHints.some(h => h.wordIdx === wIdx && h.charIdx === cIdx);
                    const isVisible = isFound || isHinted;

                    return (
                      <motion.div
                        key={cIdx}
                        animate={{ 
                          scale: isFound ? [1, 1.1, 1] : 1, 
                          backgroundColor: isFound ? "#10b981" : (isHinted ? "rgba(250, 204, 21, 0.2)" : "rgba(255,255,255,0.05)"),
                        }}
                        className={`w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center text-2xl font-black rounded-xl border-2 transition-all duration-500
                          ${isFound ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : (isHinted ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]' : 'border-white/10')}`}
                      >
                        {/* Harf so'z topilganda yoki Yordam (Hint) orqali ochilganda ko'rinadi */}
                        <span className={isVisible ? (isHinted && !isFound ? "text-yellow-400" : "text-white") : "text-transparent"}>
                          {char}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* SELECTION PREVIEW */}
          <div className="h-16 flex items-center justify-center">
            <AnimatePresence>
              {currentString && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 10 }} 
                  animate={{ scale: 1.1, opacity: 1, y: 0 }} 
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="px-12 py-3 bg-white/20 dark:bg-blue-600/30 backdrop-blur-xl text-slate-900 dark:text-white text-3xl font-black rounded-3xl shadow-2xl border border-white/30"
                >
                  {currentString}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* HARF AYLANASI */}
          <div 
            className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-square flex items-center justify-center touch-none select-none" 
            ref={containerRef}
            onTouchMove={handleTouchMove}
            onTouchEnd={checkWord}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {lineCoords.map((line, i) => (
                <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
              ))}
            </svg>

            <div className="relative w-56 h-56 sm:w-72 sm:h-72 bg-white/40 dark:bg-slate-900/40 rounded-full shadow-2xl border-4 border-white/60 backdrop-blur-2xl flex items-center justify-center">
              {currentLevel.letters.map((letter, index) => {
                const angle = (index * (360 / currentLevel.letters.length) - 90) * (Math.PI / 180);
                const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 90 : 105;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div
                    id={`letter-${index}`} key={index}
                    onPointerDown={() => handleInput(index)}
                    onPointerEnter={(e) => e.buttons === 1 && handleInput(index)}
                    onPointerUp={checkWord}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                    className={`absolute w-14 h-14 sm:w-18 sm:h-18 rounded-[20px] flex items-center justify-center text-3xl font-black cursor-pointer shadow-xl transition-all
                      ${selectedIndices.includes(index) ? 'bg-blue-500 text-white border-blue-300 scale-110' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-b-4 border-slate-200 dark:border-slate-700'}`}
                  >
                    {letter}
                  </div>
                );
              })}
              <Sparkles className="text-blue-500/10 animate-pulse" size={50} />
            </div>
          </div>

        </div>
      </div>

      {/* WIN MODAL */}
      <AnimatePresence>
        {isLevelComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] w-full max-w-sm text-center shadow-3xl border-t-8 border-yellow-400">
              <Trophy size={80} className="mx-auto text-yellow-400 mb-4 drop-shadow-lg" />
              <h3 className="text-4xl font-black mb-1 dark:text-white uppercase tracking-tighter">WINNER!</h3>
              <div className="bg-yellow-400/10 py-3 rounded-2xl mb-8">
                <p className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">+30 Coins Bonus</p>
              </div>
              <button 
                onClick={() => {
                  if (levelIdx < LEVELS.length - 1) { 
                    setLevelIdx(prev => prev + 1); 
                    setFoundWords([]); 
                    setRevealedHints([]); // Yangi bosqichda yordamlar ham tozalanadi
                    setIsLevelComplete(false); 
                  }
                }}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all"
              >
                Next Level
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        html, body { overflow: hidden !important; height: 100% !important; width: 100% !important; }
        ::-webkit-scrollbar { display: none !important; width: 0 !important; background: transparent !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        @keyframes petal { 0% { transform: translateY(-10px) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(600px) rotate(720deg); opacity: 0; } }
        .animate-petal { animation: petal 10s linear infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default WordGardenGame;