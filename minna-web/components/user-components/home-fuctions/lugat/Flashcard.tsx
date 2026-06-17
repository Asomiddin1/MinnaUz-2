"use client";

import React from 'react';
import { Word } from '../../../../app/constants/dictionary-data';
import { RotateCw } from 'lucide-react';

interface FlashcardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export default function Flashcard({ 
  word, 
  isFlipped, 
  onFlip, 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd 
}: FlashcardProps) {
  if (!word) return null;

  return (
    <div 
      className="relative h-[400px] sm:h-[450px] md:h-[500px] w-full max-w-2xl mx-auto cursor-pointer group perspective-1000" 
      onClick={onFlip}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`relative w-full h-full transition-transform duration-700 ease-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* ================= OLD TOMONI (Kanji) ================= */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-between p-6 sm:p-8 shadow-sm">
          
          <div className="absolute top-6 right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-slate-600 flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-400 bg-white dark:bg-[#1E293B]">
            0%
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <span className="text-[7rem] sm:text-[9rem] md:text-[11rem] font-normal text-[#141d2f] dark:text-white leading-none">
              {word.kanji}
            </span>
          </div>

          <div className="w-full flex flex-col items-center justify-end shrink-0">
            <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-gray-400 font-medium mb-3">
              <span>W:0</span>
              <span>音:0</span>
              <span>訓:0</span>
            </div>
            <div className="w-16 sm:w-20 h-[2px] sm:h-[3px] bg-gray-200 dark:bg-slate-700 rounded-full mb-3"></div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded uppercase">
                {word.level || "N5"}
              </span>
              <span className="bg-gray-50 dark:bg-slate-800 text-gray-400 border border-gray-100 dark:border-slate-600 text-[10px] sm:text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                <span className="hidden sm:inline">Bosing yoki Space</span>
                <span className="sm:hidden">Bosish</span>
              </span>
            </div>
          </div>

        </div>

        {/* ================= ORQA TOMONI (Tarjima va Romaji) ================= */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-between p-6 sm:p-8 shadow-sm">
           
           <div className="absolute top-6 right-6 text-gray-300 dark:text-gray-500">
             <RotateCw className="w-6 h-6 sm:w-8 sm:h-8" />
           </div>

           <div className="flex-1 flex flex-col items-center justify-center w-full text-center px-2 sm:px-4">
             <p className="text-lg sm:text-2xl text-indigo-500 dark:text-indigo-400 font-medium mb-2 uppercase tracking-widest">
               {word.kana || word.romaji}
             </p>
             <h2 className="text-3xl sm:text-5xl font-medium text-gray-900 dark:text-white leading-tight">
               {word.uzbek}
             </h2>
           </div>

           <div className="w-full flex flex-col items-center justify-end shrink-0">
            <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-gray-400 font-medium mb-3">
              <span>W:0</span>
              <span>音:0</span>
              <span>訓:0</span>
            </div>
            <div className="w-16 sm:w-20 h-[2px] sm:h-[3px] bg-gray-200 dark:bg-slate-700 rounded-full mb-3"></div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded uppercase">
                {word.level || "N5"}
              </span>
              <span className="bg-gray-50 dark:bg-slate-800 text-gray-400 border border-gray-100 dark:border-slate-600 text-[10px] sm:text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                <span className="hidden sm:inline">Bosing yoki Space</span>
                <span className="sm:hidden">Bosish</span>
              </span>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}