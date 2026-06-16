"use client";

import React, { useState, useEffect } from 'react';
import { Word } from '../../../../app/constants/dictionary-data';
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Flashcard from './Flashcard';

interface KartochkalarProps {
  words: Word[];
  onPracticeStateChange?: (isPracticing: boolean) => void;
}

export default function Kartochkalar({ words = [], onPracticeStateChange }: KartochkalarProps) {
  const [practiceIndex, setPracticeIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (onPracticeStateChange) {
      onPracticeStateChange(practiceIndex !== null);
    }
  }, [practiceIndex, onPracticeStateChange]);

  const nextCard = () => {
    if (practiceIndex !== null && practiceIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setPracticeIndex(prev => prev! + 1), 150);
    }
  };

  const prevCard = () => {
    if (practiceIndex !== null && practiceIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setPracticeIndex(prev => prev! - 1), 150);
    }
  };

  useEffect(() => {
    if (practiceIndex === null || words.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextCard();
      else if (e.key === "ArrowLeft") prevCard();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); 
        setIsFlipped(prev => !prev);
      } else if (e.key === "Escape") {
        setPracticeIndex(null); 
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [practiceIndex, words.length]);

  const minSwipeDistance = 50;
  const onTouchStartEvent = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMoveEvent = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextCard();
    else if (distance < -minSwipeDistance) prevCard();
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!words || words.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-gray-500">
        <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg">Hozircha kanji so'zlar yo'q.</p>
      </div>
    );
  }

  // ===============================================
  // 1. MASHQ REJIMI
  // ===============================================
  if (practiceIndex !== null) {
    const currentWord = words[practiceIndex];

    return (
      <div className="w-full max-w-[900px] mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-500 mt-2">
        
        {/* Orqaga qaytish va Progress */}
        <div className="flex items-center justify-between px-1">
          <button 
            onClick={() => setPracticeIndex(null)}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-semibold transition-colors bg-gray-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span>Ro'yxatga qaytish</span>
          </button>
          <div className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500">
            {practiceIndex + 1} <span className="opacity-60">/ {words.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div className="h-1.5 sm:h-2 rounded-full transition-all duration-500 bg-indigo-500" style={{ width: `${((practiceIndex + 1) / words.length) * 100}%` }}></div>
        </div>

        {/* Karta va Strelkalar qismi (To'liq kenglikda) */}
        <div className="relative flex items-center justify-center w-full mt-4">
          
          {/* Chap strelka (Kartaning ustida chetda turadi) */}
          <button 
            onClick={prevCard} 
            disabled={practiceIndex === 0} 
            className="absolute left-2 sm:left-4 z-20 shrink-0 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-0 transition-all shadow-md backdrop-blur-md"
          >
            <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
          </button>

          {/* Flashcard - ikki tomonga to'liq tekkizildi (w-full) */}
          <div className="w-full">
             <Flashcard 
               word={currentWord} 
               isFlipped={isFlipped} 
               onFlip={() => setIsFlipped(!isFlipped)}
               onTouchStart={onTouchStartEvent}
               onTouchMove={onTouchMoveEvent}
               onTouchEnd={onTouchEndEvent}
             />
          </div>

          {/* O'ng strelka (Kartaning ustida chetda turadi) */}
          <button 
            onClick={nextCard} 
            disabled={practiceIndex === words.length - 1} 
            className="absolute right-2 sm:right-4 z-20 shrink-0 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-0 transition-all shadow-md backdrop-blur-md"
          >
            <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />
          </button>

        </div>
      </div>
    );
  }

  // ===============================================
  // 2. RO'YXAT REJIMI
  // ===============================================
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
        {words.map((word, index) => (
          <div 
            key={word.id} 
            onClick={() => {
              setPracticeIndex(index);
              setIsFlipped(false);
            }}
            className="relative bg-white dark:bg-[#1a1d27] rounded-xl p-3 sm:p-4 flex flex-col shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer aspect-square overflow-hidden"
          >
            <div className="flex-1 flex items-center justify-center w-full min-h-0">
              <span className="text-3xl sm:text-6xl font-normal text-[#141d2f] dark:text-white leading-none text-center">
                {word.kanji}
              </span>
            </div>
            <div className="w-full flex flex-col items-center justify-end shrink-0 pb-1 z-10 bg-white dark:bg-[#1a1d27]">
              <p className="text-xs sm:text-[16px] font-medium text-gray-500 dark:text-gray-400 truncate w-full text-center px-1 mb-2.5 sm:mb-4">
                {word.uzbek}
              </p>
              <div className="w-8 sm:w-10 h-[2px] bg-gray-200 dark:bg-gray-700 rounded-full mb-1 sm:mb-1.5"></div>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded">
                N5
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}