"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { userAPI } from "@/lib/api/user";
import { 
  Bookmark, 
  Play, 
  Clock, 
  AlignLeft, 
  Volume2, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  Eye,
  Loader2,
  Pause
} from 'lucide-react';
import ReactPlayer from 'react-player/youtube';

// Transkript tipini aniqlaymiz
interface TranscriptLine {
  time: string;
  text: string;
}

interface VideoData {
  id: number;
  youtube_id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  created_at: string;
  postedAt?: string;
  transcript: TranscriptLine[];
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const videoId = resolvedParams.id;
  
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  
  // ReactPlayer uchun ref
  const playerRef = useRef<ReactPlayer>(null);
  // Scroll uchun ref yaratamiz
  const transcriptRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true);
        setError(false);
        const res = await userAPI.getVideoById(Number(videoId));
        const videoData = res.data?.data || res.data;

        if (videoData) {
          const date = new Date(videoData.created_at);
          videoData.postedAt = `${date.getDate()}-${date.toLocaleString('uz-UZ', { month: 'short' })} ${date.getFullYear()}`;
          
          // Transkriptni parse qilish
          let parsedTranscript: TranscriptLine[] = [];
          if (videoData.transcript) {
            if (typeof videoData.transcript === 'string') {
              try {
                parsedTranscript = JSON.parse(videoData.transcript);
              } catch (e) {
                console.error("Transcript JSON error:", e);
                parsedTranscript = [];
              }
            } else if (Array.isArray(videoData.transcript)) {
              parsedTranscript = videoData.transcript;
            }
          }
          videoData.transcript = parsedTranscript;
          setCurrentVideo(videoData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Video yuklashda xatolik:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  // AVTOMATIK SCROLL FUNKSIYASI
  useEffect(() => {
    if (transcriptRefs.current[activeSubtitle]) {
      transcriptRefs.current[activeSubtitle]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSubtitle]);

  // Video vaqtiga qarab active subtitleni yangilash
  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
    
    if (currentVideo?.transcript) {
      // Transcript vaqtlarini soniyalarga aylantirib solishtiramiz
      const currentTime = state.playedSeconds;
      const newActiveIndex = currentVideo.transcript.findIndex((line, index) => {
        const currentLineTime = timeToSeconds(line.time);
        const nextLine = currentVideo.transcript[index + 1];
        const nextLineTime = nextLine ? timeToSeconds(nextLine.time) : Infinity;
        
        return currentTime >= currentLineTime && currentTime < nextLineTime;
      });
      
      if (newActiveIndex !== -1 && newActiveIndex !== activeSubtitle) {
        setActiveSubtitle(newActiveIndex);
      }
    }
  };

  // Vaqt stringini soniyalarga aylantirish (masalan: "1:23" => 83)
  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  // Transkript qatoriga bosganda videoni o'sha vaqtga o'tkazish
  const handleTranscriptClick = (index: number, timeStr: string) => {
    setActiveSubtitle(index);
    const seconds = timeToSeconds(timeStr);
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds');
    }
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  // Qayta yuklash yoki boshqa videoga o'tishda holatni reset qilish
  const handleBack = () => {
    setIsPlaying(false);
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#0f111a]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#0f111a]">
        <p className="text-red-500 font-medium text-lg">Video topilmadi yoki yuklashda xatolik yuz berdi!</p>
        <button onClick={handleBack} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-0 md:p-6 h-screen lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-0 lg:gap-6 overflow-hidden bg-white dark:bg-[#0f111a]">
      
      {/* 1. CHAP TOMON: Video Player */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col shrink-0">
        <div className="relative z-30 w-full aspect-video bg-black md:rounded-2xl overflow-hidden shadow-sm border-b md:border border-gray-200 dark:border-gray-800">
          {/* Orqaga qaytish tugmasi */}
          <button 
            onClick={handleBack}
            className="absolute top-4 left-4 z-40 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full border border-white/10 transition-all"
            aria-label="Orqaga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Play/Pause indikatori */}
          {!isPlaying && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
              <div className="w-20 h-20 bg-blue-600/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                   onClick={() => setIsPlaying(true)}>
                <Play className="w-10 h-10 text-white ml-1.5" fill="currentColor" />
              </div>
            </div>
          )}

          {/* ReactPlayer yoki iframe */}
          {isPlaying ? (
            <div className="w-full h-full">
              <ReactPlayer
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${currentVideo.youtube_id}`}
                playing={isPlaying}
                controls={true}
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                config={{
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                  }
                }}
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </div>
          ) : (
            <div 
              className="relative w-full h-full cursor-pointer group" 
              onClick={() => setIsPlaying(true)}
            >
              <img 
                src={currentVideo.thumbnail} 
                alt={currentVideo.title} 
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" 
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Video ma'lumotlari */}
        <div className="flex flex-col p-4 md:p-5 bg-white dark:bg-[#0f111a]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className={`text-[17px] md:text-2xl font-bold text-gray-900 dark:text-white transition-all ${!isDetailsExpanded ? "line-clamp-1" : "line-clamp-3"}`}>
                {currentVideo.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> 
                  {currentVideo.views?.toLocaleString() || 0} ko'rish
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 
                  {currentVideo.postedAt}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} 
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {isDetailsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDetailsExpanded ? "Yopish" : "Batafsil"}</span>
            </button>
          </div>
          
          {isDetailsExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-fadeIn">
              {currentVideo.description || "Tavsif mavjud emas."}
            </div>
          )}
        </div>
      </div>

      {/* 2. O'NG TOMON: Transkript */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0f111a] border-t lg:border border-gray-200 dark:border-gray-800 lg:rounded-2xl overflow-hidden mt-4 lg:mt-0">
        <div className="shrink-0 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5 bg-white dark:bg-[#0f111a] z-10">
          <AlignLeft className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Video matni</h2>
          {currentVideo.transcript && currentVideo.transcript.length > 0 && (
            <span className="text-xs text-gray-400 ml-auto">
              {currentVideo.transcript.length} qator
            </span>
          )}
        </div>
        
        {/* SCROLL KONTEYNERI */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar pb-10">
          {currentVideo.transcript && currentVideo.transcript.length > 0 ? (
            currentVideo.transcript.map((line: TranscriptLine, index: number) => {
              const isActive = index === activeSubtitle;
              return (
                <div 
                  key={index}
                  ref={(el) => { transcriptRefs.current[index] = el; }}
                  onClick={() => handleTranscriptClick(index, line.time)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleTranscriptClick(index, line.time);
                    }
                  }}
                  className={`group flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-500 shadow-md scale-[1.01]" 
                      : "hover:bg-gray-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent"
                  }`}
                >
                  <div className={`font-mono text-xs font-semibold shrink-0 mt-0.5 ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {line.time}
                  </div>
                  <div className={`text-[14px] md:text-[15px] leading-relaxed transition-colors ${
                    isActive 
                      ? "text-gray-900 dark:text-white font-medium" 
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                  }`}>
                    {isActive && <Volume2 className="w-3.5 h-3.5 text-blue-500 inline mr-2 animate-pulse" />}
                    {line.text}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
              <AlignLeft className="w-8 h-8 opacity-50" />
              <p className="text-sm italic">Video matni mavjud emas.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom CSS */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}