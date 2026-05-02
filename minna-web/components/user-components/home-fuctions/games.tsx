import Link from "next/link";
import { Play, Target, Zap, Trophy, LayoutGrid, ChevronRight, Sparkles, ArrowLeft } from "lucide-react";

const GamesList = () => {
  return (
    // Yorug' va qorong'i rejim uchun asosiy fon
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0a0f1c] p-4 sm:p-6 lg:p-8 overflow-hidden font-sans transition-colors duration-500">
      
      {/* Orqa fondagi xira porlash effekti (Har ikki rejim uchun moslashtirilgan) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="">
          <Link href={'/dashboard'} className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-4">
             <ArrowLeft />
            <button className= "font-bold text-lg">orqaga qaytish</button>
          </Link>
        </div>
        {/* Sarlavha qismi */}
        <div className="mb-10 sm:mb-14">
          
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-blue-100/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
           
            <span className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
              Premium Mini Games
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
            O'yinlar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 drop-shadow-sm">Markazi</span>
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl font-medium transition-colors">
            Yapon tilini qiziqarli mini-o'yinlar orqali o'rganing. Tezlik, xotira va e'tiboringizni sinab ko'ring.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* 1. PUFAKCHA YORISH - PRO KARTA */}
          <div className="group flex flex-col sm:flex-row bg-white/70 dark:bg-[#131b2f]/80 backdrop-blur-xl rounded-[28px] border border-slate-200/80 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl overflow-hidden hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-500">
            
            {/* Rasm qismi - Banner qismi doim yorqin va o'yindek qoladi */}
            <div className="w-full sm:w-2/5 relative bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] p-6 flex items-center justify-center overflow-hidden min-h-[200px] sm:min-h-full">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              
              {/* Kichik pufakcha */}
              <div className="absolute w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] top-6 left-6 animate-pulse flex items-center justify-center transform -rotate-12">
                 <span className="text-white/90 font-black text-sm drop-shadow-md">火</span>
              </div>
              
              {/* Asosiy pufakcha */}
              <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-white/30 to-white/5 backdrop-blur-lg rounded-full border-[1.5px] border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_4px_15px_rgba(255,255,255,0.5)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                 <div className="absolute top-2 left-4 w-6 h-3 bg-white/60 rounded-full blur-[2px] rotate-[-30deg]"></div>
                 <span className="text-white font-black text-5xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">水</span>
              </div>
              
              {/* O'rtacha pufakcha */}
              <div className="absolute w-14 h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)] bottom-6 right-6 flex items-center justify-center transform rotate-12">
                 <span className="text-white/80 font-black text-xl">木</span>
              </div>
            </div>

            {/* Ma'lumot qismi */}
            <div className="w-full sm:w-3/5 p-6 sm:p-8 flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  Pufakcha Yorish
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 transition-colors">
                  Osmondan tushayotgan Kanji belgilarini to'g'ri topib yoring. Diqqatingizni jamlang!
                </p>

                {/* Statistika Paneli */}
                <div className="flex items-center justify-between bg-slate-100/50 dark:bg-black/20 rounded-[16px] p-3.5 mb-6 border border-slate-200/50 dark:border-white/5 shadow-inner transition-colors">
                  <div className="flex flex-col items-center gap-1 w-1/3">
                    <Target className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">N5-N4</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-white/10 transition-colors"></div>
                  <div className="flex flex-col items-center gap-1 w-1/3">
                    <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tezkor</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-white/10 transition-colors"></div>
                  <div className="flex flex-col items-center gap-1 w-1/3">
                    <Trophy className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Reyting</span>
                  </div>
                </div>
              </div>

              {/* Tugmalar */}
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard/games/buble/1" 
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-500 text-white px-5 py-3.5 rounded-[16px] font-black text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(37,99,235,0.2)] dark:shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all duration-300 group/btn"
                >
                  O'ynash
                  <Play className="w-4 h-4 fill-current group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <div className="w-12 h-12 flex items-center justify-center rounded-[16px] bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-all shrink-0 active:scale-95">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. SO'Z BOG'I - YANGI KARTA */}
          <div className="group flex flex-col sm:flex-row bg-white/70 dark:bg-[#131b2f]/80 backdrop-blur-xl rounded-[28px] border border-emerald-200/80 dark:border-emerald-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl overflow-hidden hover:border-emerald-400/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-500">
            
            {/* Rasm qismi */}
            <div className="w-full sm:w-2/5 relative bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-6 flex items-center justify-center overflow-hidden min-h-[200px] sm:min-h-full">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
              
              <div className="absolute w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg border border-white/40 top-8 left-8 flex items-center justify-center transform -rotate-12">
                 <span className="text-white/90 font-bold text-lg">あ</span>
              </div>
              <div className="absolute w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg border border-white/40 bottom-10 right-8 flex items-center justify-center transform rotate-12">
                 <span className="text-white/90 font-bold text-lg">い</span>
              </div>
              
              {/* Asosiy ikonka */}
              <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-white/90 to-white/10 backdrop-blur-lg rounded-full border-2 border-white/50 shadow-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                 <span className="text-emerald-600 font-black text-5xl">A</span>
              </div>
            </div>

            {/* Ma'lumot qismi */}
            <div className="w-full sm:w-3/5 p-6 sm:p-8 flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                    So'z Bog'i
                  </h2>
                  <span className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Yangi</span>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 transition-colors">
                  Yaponcha bo'g'inlarni birlashtirib yashirin so'zlarni toping. Lug'at boyligingizni oshiring!
                </p>

                {/* Statistika Paneli */}
                <div className="flex items-center justify-between bg-slate-100/50 dark:bg-black/20 rounded-[16px] p-3.5 mb-6 border border-slate-200/50 dark:border-white/5 shadow-inner transition-colors">
                  <div className="flex flex-col items-center gap-1 w-1/2">
                    <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">N5 Daraja</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-white/10 transition-colors"></div>
                  <div className="flex flex-col items-center gap-1 w-1/2">
                    <LayoutGrid className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Lug'at</span>
                  </div>
                </div>
              </div>

              {/* Tugmalar */}
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard/games/soz-bogi" 
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-400 dark:hover:to-teal-500 text-white px-5 py-3.5 rounded-[16px] font-black text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all duration-300 group/btn"
                >
                  O'ynash
                  <Play className="w-4 h-4 fill-current group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
          {/* 3. KANJI BUILDER - YANGI KARTA */}
<div className="group flex flex-col sm:flex-row bg-white/70 dark:bg-[#131b2f]/80 backdrop-blur-xl rounded-[28px] border border-purple-200/80 dark:border-purple-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl overflow-hidden hover:border-purple-400/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-500">
  
  {/* Rasm qismi - Kanji vizualizatsiyasi */}
  <div className="w-full sm:w-2/5 relative bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 p-6 flex items-center justify-center overflow-hidden min-h-[200px] sm:min-h-full">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
    
    {/* Suzib yurgan radikallar */}
    <div className="absolute w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg border border-white/40 top-8 right-8 flex items-center justify-center transform rotate-12 animate-bounce">
       <span className="text-white/90 font-bold text-lg">人</span>
    </div>
    <div className="absolute w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg border border-white/40 bottom-10 left-8 flex items-center justify-center transform -rotate-12">
       <span className="text-white/90 font-bold text-lg">木</span>
    </div>
    
    {/* Asosiy Natija Kanji */}
    <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-white/90 to-white/10 backdrop-blur-lg rounded-3xl border-2 border-white/50 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
       <span className="text-purple-700 font-black text-6xl drop-shadow-sm">休</span>
    </div>
  </div>

  {/* Ma'lumot qismi */}
  <div className="w-full sm:w-3/5 p-6 sm:p-8 flex flex-col justify-between relative">
    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
    
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors tracking-tight">
          Kanji Builder
        </h2>
        <span className="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Logic</span>
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 transition-colors">
        Kanji qismlarini (radikallarni) birlashtirib, iyerogliflar yasang. Yozuv sirlarini mantiqiy yo'l bilan o'rganing!
      </p>

      {/* Statistika Paneli */}
      <div className="flex items-center justify-between bg-slate-100/50 dark:bg-black/20 rounded-[16px] p-3.5 mb-6 border border-slate-200/50 dark:border-white/5 shadow-inner transition-colors">
        <div className="flex flex-col items-center gap-1 w-1/2">
          <LayoutGrid className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">N5-N1</span>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-white/10 transition-colors"></div>
        <div className="flex flex-col items-center gap-1 w-1/2">
          <Zap className="w-4 h-4 text-fuchsia-500 dark:text-fuchsia-400" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Ieroglif</span>
        </div>
      </div>
    </div>

    {/* Tugmalar */}
    <div className="flex items-center gap-3">
      <Link 
        href="/dashboard/games/kanji" 
        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 dark:hover:from-purple-500 dark:hover:to-violet-600 text-white px-5 py-3.5 rounded-[16px] font-black text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(147,51,234,0.2)] dark:shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-95 transition-all duration-300 group/btn"
      >
        O'ynash
        <Play className="w-4 h-4 fill-current group-hover/btn:translate-x-1 transition-transform" />
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