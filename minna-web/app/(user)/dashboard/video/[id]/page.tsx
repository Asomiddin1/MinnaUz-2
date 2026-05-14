"use client";

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation'; // Orqaga qaytish uchun
import { VIDEOS_DATABASE } from '../../../../constants/video-data';
import { 
  Bookmark, 
  Play, 
  Clock, 
  AlignLeft, 
  Volume2, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft, // Orqaga tugmasi uchun ikonka
  Eye // Ko'rishlar soni uchun ikonka
} from 'lucide-react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter(); // Router funksiyasi
  const resolvedParams = use(params);
  const videoId = resolvedParams.id;
  
  const currentVideo = VIDEOS_DATABASE[videoId] || VIDEOS_DATABASE["1"];

  const [activeSubtitle, setActiveSubtitle] = useState(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-0 md:p-6 h-screen lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-0 lg:gap-6 overflow-hidden bg-white dark:bg-[#0f111a]">
      
      {/* 1. CHAP TOMON: Video va Ma'lumotlar */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col shrink-0">
        
        {/* VIDEO KONTEYNERI */}
        <div className="sticky top-0 z-30 w-full aspect-video bg-black md:rounded-2xl overflow-hidden shadow-sm border-b md:border border-gray-200 dark:border-gray-800">
          
          {/* BACK BUTTON - Video ustida chap burchakda */}
          <button 
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-40 p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img 
            src={currentVideo.thumbnail} 
            alt="Video" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-blue-600/90 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer shadow-xl">
              <Play className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* MA'LUMOTLAR QISMI */}
        <div className="flex flex-col p-4 pb-2 bg-white dark:bg-[#0f111a]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className={`text-[17px] md:text-2xl font-bold text-gray-900 dark:text-white leading-tight ${!isDetailsExpanded && "line-clamp-1"}`}>
                {currentVideo.title}
              </h1>
              
              {/* BACKEND MA'LUMOTLARI UCHUN JOY (Ko'rishlar va Vaqt) */}
              <div className="flex items-center gap-3 mt-2 text-[11px] md:text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> {currentVideo.views}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {currentVideo.postedAt}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} 
              className="shrink-0 flex items-center gap-1 text-[13px] font-bold text-blue-600 dark:text-blue-400 mt-0.5"
            >
              {isDetailsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isDetailsExpanded ? "Yopish" : "Batafsil"}</span>
            </button>
          </div>

          {isDetailsExpanded && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between py-3 border-y border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    MU
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">MinnaUz Academy</h3>
                    <p className="text-[11px] text-gray-500">Yapon tili maktabi</p>
                  </div>
                </div>
                
                <button className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-5 py-2 rounded-full text-xs font-bold transition-colors">
                  <Bookmark className="w-4 h-4" />
                  Saqlash
                </button>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {currentVideo.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. O'NG TOMON: Subtitrlar */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0f111a] border-t lg:border border-gray-200 dark:border-gray-800 lg:rounded-2xl overflow-hidden">
        <div className="shrink-0 p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-blue-500" />
          <h2 className="text-[14px] md:text-lg font-bold text-gray-900 dark:text-white">Video matni</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar pb-20">
          {currentVideo.transcript.map((line: any, index: number) => {
            const isActive = index === activeSubtitle;
            return (
              <div 
                key={line.id} 
                onClick={() => setActiveSubtitle(index)} 
                className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-sm" 
                    : "hover:bg-gray-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
                }`}
              >
                <div className={`font-mono text-[10px] md:text-xs font-semibold shrink-0 mt-1 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                  {line.time}
                </div>
                <div className={`text-[13px] md:text-[15px] leading-relaxed ${isActive ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                  {isActive && <Volume2 className="w-3.5 h-3.5 text-blue-500 inline mr-2 animate-pulse" />}
                  {line.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}