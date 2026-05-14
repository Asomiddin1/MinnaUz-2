"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// Papkalar ierarxiyasiga mos import yo'llari
import VideoCard from '../../../../components/user-components/video-app/video-card';
import { VIDEOS_DATABASE } from '../../../constants/video-data';
import { PlayCircle, Sparkles, Eye, Clock } from 'lucide-react';

export default function VideoPage() {
  const [activeFilter, setActiveFilter] = useState("Barchasi");

  const filters = ["Barchasi", "Anime tili", "Yaponiyada hayot", "Vloglar", "Madaniyat", "Qiziqarli faktlar", "Shorts"];

  // video-data.ts'dan barcha videolarni massiv ko'rinishida olamiz
  const allVideos = Object.values(VIDEOS_DATABASE);

  // Filtrlash mantiqi
  const filteredVideos = activeFilter === "Barchasi" 
    ? allVideos.slice(1) 
    : allVideos.filter((v: any) => v.category === activeFilter);

  // Banner uchun birinchi video
  const featuredVideo = allVideos[0] as any;

  return (
    <div className="flex flex-col h-full w-full mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8 space-y-10">
      
      {/* 1. KATTA BANNER (Hero Section) */}
      {activeFilter === "Barchasi" && featuredVideo && (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl group">
          <img 
            src={featuredVideo.thumbnail} 
            alt={featuredVideo.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/60 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4 lg:w-2/3 flex flex-col justify-end h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Yangi Dars
              </span>
              <span className="text-gray-300 text-sm font-medium">{featuredVideo.category}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg line-clamp-2">
              {featuredVideo.title}
            </h1>

            {/* Backend ma'lumotlari: Ko'rishlar va Vaqt */}
            <div className="flex items-center gap-4 mb-6 text-gray-300 text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Eye className="w-4 h-4" /> {featuredVideo.views}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" /> {featuredVideo.postedAt}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/video/${featuredVideo.id}`} 
                    className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors duration-300 w-full sm:w-auto">
                <PlayCircle className="w-5 h-5" fill="currentColor" />
                Tomosha qilish
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. ZAMONAVIY FILTRLAR */}
      <div className="sticky top-0 z-10 bg-[#fafafa]/80 dark:bg-[#0f111a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-2">
        <div className="flex gap-6 overflow-x-auto snap-x scroll-smooth no-scrollbar items-center">
          {filters.map((filter, index) => (
            <button 
              key={index}
              onClick={() => setActiveFilter(filter)}
              className={`snap-start whitespace-nowrap py-4 text-[14px] md:text-[15px] font-semibold transition-all duration-300 relative ${
                activeFilter === filter 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {filter}
              {activeFilter === filter && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.5)]"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. VIDEOLAR RO'YXATI */}
      <div className="pb-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {activeFilter === "Barchasi" ? "Tavsiya etilgan videolar" : `${activeFilter} videolari`}
        </h2>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredVideos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bu bo'limda hozircha videolar yo'q</h3>
          </div>
        )}
      </div>

    </div>
  );
}