import Link from "next/link";
import { Play, ArrowLeft, Gamepad2, Flame, Sparkles, BrainCircuit } from "lucide-react";

const GamesList = () => {
  return (
    <div className="relative min-h-screen  bg_game_list bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white p-3 sm:p-6 lg:p-10 overflow-hidden font-sans transition-colors duration-500">
      
      {/* Orqa fon nurlari */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        
        {/* Navigatsiya qismi */}
        <div className="mb-6 sm:mb-10 flex items-center justify-between">
          <Link href={'/dashboard'} className="group flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-medium">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="hidden sm:inline">Bosh sahifaga</span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full backdrop-blur-md shadow-sm">
          </div>
        </div>

        {/* Sarlavha qismi - App Store uslubida qisqa va aniq */}
        <div className="mb-8 border-b border-slate-700 dark:border-white/10 pb-4">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-1">
            Yangi o'yinlar
          </h1>
          <p className="border-slate-200 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Tavsiya etilgan qiziqarli mashg'ulotlar
          </p>
        </div>

        {/* O'YINLAR GRID - Mobil uchun 2 qator (grid-cols-2), PC uchun 3/4 qator */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          
          {/* 1. PUFAKCHA YORISH KARTASI */}
          <div className="group relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[20px] sm:rounded-[28px] overflow-hidden bg-slate-900 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 border border-slate-200 dark:border-white/10">
            
            {/* Katta fon rasmi */}
            <img 
              src="https://i.pinimg.com/1200x/9c/3a/53/9c3a536b4fa4148811d29d07ff33bf72.jpg" 
              alt="Pufakcha Yorish" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* O'qilishi uchun qorong'i gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            {/* Tepada kichik yorliq */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
              <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">N5-N4</span>
            </div>

            {/* Pastki o'yin ma'lumotlari paneli (App Store dizayni) */}
            <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-[16px] p-2.5 sm:p-3 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="flex items-center gap-2.5 sm:gap-3">
                
                {/* O'yin App Ikonkasi */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-[14px] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                </div>
                
                {/* O'yin Nomi va Kategoriya */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-xs sm:text-sm truncate leading-tight mb-0.5 drop-shadow-sm">
                    Buble Game
                  </h2>
                  <p className="text-cyan-300 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate drop-shadow-sm">
                    Action
                  </p>
                </div>

                {/* Play Tugmasi */}
                <Link href="/dashboard/games/buble/1" className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-white/20 hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current ml-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 2. SO'Z BOG'I KARTASI */}
          <div className="group relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[20px] sm:rounded-[28px] overflow-hidden bg-slate-900 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 border border-slate-200 dark:border-white/10">
            
            <img  
              src="https://i.pinimg.com/1200x/fa/cf/78/facf7892ac06c9e690eb578ff426f8de.jpg" 
              alt="So'z Bog'i" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Yangi</span>
            </div>

            <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-[16px] p-2.5 sm:p-3 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="flex items-center gap-2.5 sm:gap-3">
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-[14px] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-xs sm:text-sm truncate leading-tight mb-0.5 drop-shadow-sm">
                    So'z O'yini
                  </h2>
                  <p className="text-emerald-300 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate drop-shadow-sm">
                    Sarguzasht
                  </p>
                </div>

                <Link href="/dashboard/games/soz-bogi" className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-white/20 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current ml-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 3. KANJI BUILDER KARTASI */}
          <div className="group relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-[20px] sm:rounded-[28px] overflow-hidden bg-slate-900 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-slate-200 dark:border-white/10">
            
            <img 
              src="https://i.pinimg.com/1200x/59/2b/38/592b388671a2bd9a07a39eb81f8ff778.jpg" 
              alt="Kanji Builder" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
              <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">N5-N1</span>
            </div>

            <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-[16px] p-2.5 sm:p-3 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="flex items-center gap-2.5 sm:gap-3">
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-[14px] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-inner border border-white/20">
                  <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-xs sm:text-sm truncate leading-tight mb-0.5 drop-shadow-sm">
                    Kanji Builder
                  </h2>
                  <p className="text-purple-300 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate drop-shadow-sm">
                    Mantiq & Puzzle
                  </p>
                </div>

                <Link href="/dashboard/games/kanji" className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-white/20 hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current ml-0.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GamesList;