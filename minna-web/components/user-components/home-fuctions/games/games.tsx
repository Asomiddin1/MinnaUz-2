"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Play, Home , Lock} from "lucide-react";

const GamesList = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const banners = [
    {
     id: 1,
     title: "Sehrli Dunyo",
     desc: "Butun Yaponiyani zabt eting! Har bir orol va viloyatda yangi sarguzasht va kanji o'yinlari sizni kutmoqda.",
     mediaUrl: "/video/qasir.mp4",
     mediaType: "video",
     link: "/dashboard/games/map"
   },
    {
      id: 2,
      title: "Buble Game",
      desc: "Osmondan tushayotgan kanji belgilarini ushlang. Reaksiya va o'qish tezligingizni maksimal darajada sinovdan o'tkazing.",
      mediaUrl: "/video/ballon2.mp4",
      mediaType: "video",
      link: "/dashboard/games/buble/1"
    },
    {
      id: 3,
      title: "So'z O'yini",
      desc: "Sirli bo'g'inlarni topib, yaponcha so'zlar tuzing. Lug'at boyligingizni qiziqarli sarguzasht orqali oshiring.",
      mediaUrl: "/video/mp.mp4",
      mediaType: "video",
      link: "/dashboard/games/soz-bogi"
    },
    {
      id: 4,
      title: "Kanji Builder",
      desc: "Iyeroglif qismlarini mantiqiy tarzda birlashtirib, murakkab kanjilarni yarating va o'zlashtiring.",
      mediaUrl: "https://i.pinimg.com/1200x/59/2b/38/592b388671a2bd9a07a39eb81f8ff778.jpg",
      mediaType: "image",
      link: "/dashboard/games/kanji"
    },
  ];

  return (
    <div className="relative min-h-screen bg_game_list bg-cover bg-center bg-no-repeat bg-slate-900 text-white overflow-x-hidden font-sans pb-12 -mx-4 px-4 sm:-mx-6 sm:px-6">
      <div className="relative z-10 w-full max-w-[1600px] mx-auto pt-4 sm:pt-6">
        
        {/* ASOSIY KATTA BANNER */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 mb-10 pb-4 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {banners.map((banner) => (
          <div 
            key={banner.id} 
              className="relative w-full shrink-0 snap-center aspect-[16/9] sm:aspect-[21/9] lg:aspect-[26/9] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl group bg-slate-950"
>
              {/* MEDIA QISMI - globals.css dagi banner-media-style klassi ishlatildi */}
              {banner.mediaType === "video" ? (
                <video 
                  src={banner.mediaUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="banner-media-style"
                />
              ) : (
                <img 
                  src={banner.mediaUrl} 
                  alt={banner.title} 
                  className="banner-media-style"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-[#0f172a]/40 to-transparent pointer-events-none"></div>

              <div className="absolute inset-0 p-6 sm:p-10 lg:p-16 flex flex-col justify-end w-full md:w-3/4 lg:w-2/3 pointer-events-none">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4 text-white drop-shadow-lg">
                  {banner.title}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed mb-8 max-w-2xl text-shadow-sm font-medium">
                  {banner.desc}
                </p>

                <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto w-max">
                  <Link href={banner.link} className="flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base hover:scale-105 hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                    O'ynash
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Sizga yoqishi mumkin
          </h2>
          <Link 
            href={'/dashboard'} 
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Bosh sahifa</span>
          </Link>
        </div>

        {/* O'YINLAR GRID */}
        {/* BU YERDA QATOR 2 DAN 5 GA OSHIRILDI VA MAP RPG QO'SHILDI */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          
          {/* 1. BUBLE GAME */}
          <Link 
            href="/dashboard/games/buble/1" 
            className="group block relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-900 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10"
          >
            <img 
              src="https://i.pinimg.com/1200x/9c/3a/53/9c3a536b4fa4148811d29d07ff33bf72.jpg" 
              alt="Pufakcha Yorish" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between transition-transform duration-300 group-hover:-translate-y-2">
              <div className="flex flex-col">
                <span className="bg-white/20 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-1.5 w-max">
                  Action
                </span>
                <h2 className="text-white font-bold text-lg leading-tight mb-0.5 drop-shadow-sm">Buble Game</h2>
              </div>
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white text-black group-hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors shadow-lg">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              </div>
            </div>
          </Link>

          {/* 2. SO'Z O'YINI */}
          <Link 
            href="/dashboard/games/soz-bogi" 
            className="group block relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-900 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10"
          >
            <img  
              src="https://i.pinimg.com/1200x/fa/cf/78/facf7892ac06c9e690eb578ff426f8de.jpg" 
              alt="So'z Bog'i" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between transition-transform duration-300 group-hover:-translate-y-2">
              <div className="flex flex-col">
                <span className="bg-white/20 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-1.5 w-max">
                  Sarguzasht
                </span>
                <h2 className="text-white font-bold text-lg leading-tight mb-0.5 drop-shadow-sm">So'z O'yini</h2>
              </div>
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white text-black group-hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors shadow-lg">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              </div>
            </div>
          </Link>
          
          {/* 3. KANJI BUILDER */}
          <Link 
            href="/dashboard/games/kanji" 
            className="group block relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-900 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10"
          >
            <img 
              src="https://i.pinimg.com/1200x/59/2b/38/592b388671a2bd9a07a39eb81f8ff778.jpg" 
              alt="Kanji Builder" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between transition-transform duration-300 group-hover:-translate-y-2">
              <div className="flex flex-col">
                <span className="bg-white/20 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-1.5 w-max">
                  Mantiq
                </span>
                <h2 className="text-white font-bold text-lg leading-tight mb-0.5 drop-shadow-sm">Kanji Builder</h2>
              </div>
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white text-black group-hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors shadow-lg">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              </div>
            </div>
          </Link>

          {/* 4. YANGI QO'SHILGAN: KANJIO QUEST (MAP RPG) */}
          <Link 
            href="/dashboard/games/map" 
            className="group block relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-900 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10"
          >
            <img 
              src="https://i.pinimg.com/1200x/c1/af/d9/c1afd9d56eb5947a505bdf972412803b.jpg" 
              alt="Kanjio Quest" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between transition-transform duration-300 group-hover:-translate-y-2">
              <div className="flex flex-col">
                <span className="bg-blue-500/80 backdrop-blur-md border border-blue-400/50 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-1.5 w-max">
                  Map RPG
                </span>
                <h2 className="text-white font-bold text-lg leading-tight mb-0.5 drop-shadow-sm"> Sehrli Dunyo Kanjio Quest</h2>
              </div>
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white group-hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              </div>
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default GamesList;