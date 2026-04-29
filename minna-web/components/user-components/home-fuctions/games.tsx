import Link from "next/link";
import { Play, Target, Zap, Trophy, LayoutGrid, ChevronRight } from "lucide-react";

const GamesList = () => {
  return (
    // Yorug' fon va ixcham kenglik (max-w-5xl)
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-screen bg-slate-50">
      
      {/* Sarlavha qismi - Ixcham va toza */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Mini Games
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          O'yinlar <span className="text-slate-400">Markazi</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pufakcha Yorish O'yini - Yorug' va Ixcham Karta */}
        <div className="group flex flex-col sm:flex-row bg-white rounded-[24px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_8px_40px_rgb(37,99,235,0.08)] transition-all duration-300">
          
          {/* Rasm qismi - Och ko'k fon va shisha pufakchalar */}
          <div className="w-full sm:w-2/5 relative bg-gradient-to-br from-sky-400 to-blue-500 p-6 flex items-center justify-center overflow-hidden min-h-[160px]">
            {/* Kichik pufakcha */}
            <div className="absolute w-10 h-10 bg-white/20 backdrop-blur-md rounded-full border border-white/40 shadow-sm top-4 left-4 animate-pulse flex items-center justify-center">
               <span className="text-white/90 font-bold text-sm">火</span>
            </div>
            {/* Asosiy pufakcha */}
            <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-white/40 to-white/10 backdrop-blur-md rounded-full border-[1.5px] border-white/60 shadow-[0_4px_20px_rgba(255,255,255,0.4)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
               <span className="text-white font-black text-4xl drop-shadow-sm">水</span>
            </div>
            {/* O'rtacha pufakcha */}
            <div className="absolute w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/40 shadow-sm bottom-4 right-4 flex items-center justify-center">
               <span className="text-white/90 font-bold text-lg">木</span>
            </div>
          </div>

          {/* Ma'lumot qismi */}
          <div className="w-full sm:w-3/5 p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                Pufakcha Yorish
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mb-4 line-clamp-2">
                Kanji belgilarini pufakchalarni yorish orqali qiziqarli tarzda yodlang.
              </p>

              {/* Ixcham Statistika Paneli */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 mb-5 border border-slate-100">
                <div className="flex flex-col items-center gap-0.5 w-1/3">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-600 mt-1">N5-N4</span>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex flex-col items-center gap-0.5 w-1/3">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-600 mt-1">Tezkor</span>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex flex-col items-center gap-0.5 w-1/3">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-600 mt-1">Reyting</span>
                </div>
              </div>
            </div>

            {/* Tugmalar */}
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/games/buble/1" 
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.25)] active:scale-95 transition-all"
              >
                Boshlash
                <Play className="w-4 h-4 fill-current" />
              </Link>
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 cursor-pointer transition-colors shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Kutilayotgan o'yin (Placeholder) */}
        <div className="flex flex-col items-center justify-center bg-slate-100/50 rounded-[24px] border-2 border-dashed border-slate-200 min-h-[220px] p-6 text-center">
          <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-300">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-400 mb-1">Yangi o'yin</h3>
          <p className="text-slate-400/70 text-[10px] uppercase tracking-widest font-bold">Tez kunda yuklanadi</p>
        </div>

      </div>
    </div>
  );
};

export default GamesList;