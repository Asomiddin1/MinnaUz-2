"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, Grid, RotateCcw, PlayCircle } from "lucide-react"; 

// --- MA'LUMOTLAR ---
const WORDS_LIST = [
  { ja: "猫", uz: "Mushuk" }, { ja: "犬", uz: "It" },
  { ja: "鳥", uz: "Qush" }, { ja: "魚", uz: "Baliq" },
  { ja: "車", uz: "Mashina" }, { ja: "本", uz: "Kitob" },
  { ja: "花", uz: "Gul" }, { ja: "水", uz: "Suv" },
];

const BUBBLE_COLORS = [
  "from-pink-400 to-rose-500", "from-blue-400 to-indigo-500",
  "from-green-400 to-emerald-500", "from-yellow-400 to-orange-500",
  "from-purple-400 to-fuchsia-500",
];

// O'yindagi umumiy darajalar soni
const TOTAL_LEVELS = 2;

// --- YORDAMCHI KOMPONENTLAR ---
const FloatingClouds = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {[1, 2, 3, 4, 5].map((cloud, index) => (
      <motion.div key={cloud} className="absolute opacity-40 sm:opacity-60" style={{ top: `${index * 18}%`, left: "-30%" }} animate={{ x: ["0vw", "130vw"] }} transition={{ duration: 25 + Math.random() * 15, ease: "linear", repeat: Infinity, delay: Math.random() * 10 }}>
        <div className="w-16 h-8 sm:w-24 sm:h-12 bg-white/80 dark:bg-white/10 rounded-full relative shadow-sm">
          <div className="absolute w-10 h-10 sm:w-16 sm:h-16 bg-white/80 dark:bg-white/10 rounded-full -top-4 sm:-top-6 left-2"></div>
          <div className="absolute w-8 h-8 sm:w-12 sm:h-12 bg-white/80 dark:bg-white/10 rounded-full -top-3 sm:-top-4 left-8 sm:left-10"></div>
        </div>
      </motion.div>
    ))}
  </div>
);

const Confetti = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <motion.div key={i} className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full opacity-70 ${["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400"][i % 5]}`} style={{ left: `${Math.random() * 100}%`, top: `-5%` }} animate={{ y: `105vh`, x: `${(Math.random() - 0.5) * 30}vw`, rotate: 360 }} transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
    ))}
  </div>
);

const BubbleStatic = ({ bubble, handlePop, removeBubble, isPaused }: any) => (
  <motion.div
    initial={{ y: 0 }} 
    animate={isPaused ? {} : { y: -1300 }}
    exit={{ scale: 1.8, opacity: 0, transition: { duration: 0.2 } }}
    transition={{ duration: bubble.duration, ease: "linear" }}
    onAnimationComplete={() => removeBubble(bubble.id)}
    onClick={() => !isPaused && handlePop(bubble.ja, bubble.id)} 
    className={`absolute flex flex-col items-center justify-center 
      w-20 h-20 sm:w-32 sm:h-32 rounded-full 
      bg-gradient-to-br ${bubble.colorClass} 
      border-2 border-white/60
      shadow-[inset_0_5px_15px_rgba(255,255,255,0.4),0_10px_25px_rgba(0,0,0,0.2)] 
      text-white text-2xl sm:text-4xl font-black 
      ${!isPaused ? 'cursor-pointer active:scale-90' : 'cursor-not-allowed opacity-80 grayscale-[30%]'} transition-transform`}
    style={{ left: bubble.left, top: "100%" }} 
  >
    <div className="absolute top-2 left-4 w-5 h-3 bg-white/40 rounded-full blur-[1px] rotate-[-30deg]"></div>
    <span className="z-10 drop-shadow-lg select-none">{bubble.ja}</span>
    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-12 sm:h-20 bg-white/40"></div>
  </motion.div>
);

// --- ASOSIY KOMPONENT ---
export default function CompleteGame() {
  const [gameState, setGameState] = useState<'briefing' | 'playing' | 'paused' | 'completed' | 'gameover'>('briefing');
  const [targetWord, setTargetWord] = useState(WORDS_LIST[0]);
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Darajalar qulfi uchun mantiq
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [highestLevel, setHighestLevel] = useState(1);
  const [showLevelsModal, setShowLevelsModal] = useState(false);

  // Har bir darajaga qarab o'yin tezligi o'zgaradi
  const LEVEL_INFO = { 
    id: currentLevelId, 
    targetScore: 50, 
    speed: Math.max(600, 1200 - (currentLevelId - 1) * 60) // Har levelda shar tezlashadi
  };

  // Yutish mantiqi
  useEffect(() => {
    if (score >= LEVEL_INFO.targetScore && gameState === 'playing') {
      setGameState('completed');
      setBubbles([]);
      // Yangi darajani ochish (lekin max TOTAL_LEVELS gacha)
      setHighestLevel(prev => Math.min(TOTAL_LEVELS, Math.max(prev, currentLevelId + 1)));
    }
  }, [score, gameState, currentLevelId]);

  // Sharlar chiqishi
  useEffect(() => {
    if (gameState !== 'playing') return;

    let spawnCount = 0;
    const interval = setInterval(() => {
      spawnCount++;
      const isTarget = spawnCount % 3 === 0;
      const startWord = isTarget ? targetWord : WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
      setBubbles((prev) => [...prev, {
        id: Math.random(),
        ja: startWord.ja,
        left: `${5 + Math.random() * 85}%`,
        duration: Math.max(4, 7 + Math.random() * 5 - (currentLevelId * 0.2)), // Shar qulash tezligi
        colorClass: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      }]);
    }, LEVEL_INFO.speed);

    return () => clearInterval(interval);
  }, [gameState, targetWord, currentLevelId]);

  // Shar bosilishi
  const handlePop = (clickedWord: string, id: number) => {
    if (gameState !== 'playing') return;
    
    if (clickedWord === targetWord.ja) {
      setScore((prev) => prev + 10);
      setTargetWord(WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)]);
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    } else {
      setLives((prev) => prev - 1);
      setBubbles((prev) => prev.filter((b) => b.id !== id));
      if (lives <= 1) setGameState('gameover');
    }
  };

  const removeBubble = (id: number) => setBubbles((prev) => prev.filter((b) => b.id !== id));

  const resumeGame = () => {
      if (score === 0 || gameState === 'gameover' || lives === 0) {
          restartLevel();
      } else {
          setGameState('playing');
      }
  };
  
  const restartLevel = () => {
    setScore(0);
    setLives(3);
    setBubbles([]);
    setTargetWord(WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)]);
    setGameState('playing');
  };

  // Qulfdan yechilgan darajani tanlash
  const changeLevel = (lvl: number) => {
    setCurrentLevelId(lvl);
    setScore(0);
    setLives(3);
    setBubbles([]);
    setGameState('briefing');
    setShowLevelsModal(false);
  };

  // ==========================================
  // 1. MISSION BRIEFING EKRANI 
  // ==========================================
  if (gameState === 'briefing') {
    return (
      <div className="relative w-full min-h-[650px] md:h-[calc(100vh-100px)] flex flex-col items-center justify-end md:justify-center px-4 pb-6 md:pb-0 overflow-hidden rounded-[24px] md:rounded-[40px] bg-gradient-to-b from-[#1a3a6e] via-[#3a6fc4] to-[#7aa8d8] dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 border border-transparent dark:border-white/10">
        <FloatingClouds />

        {/* --- ORQA FONDAGI BEZAK SHARLAR --- */}
        <motion.div animate={{ y: [0, -14, 0], rotate: [-3, 2, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-0 scale-75 md:scale-100 top-[8%] left-[5%] origin-top flex flex-col items-center">
          <div style={{ width: '72px', height: '86px', background: 'radial-gradient(circle at 35% 32%, #7ee87a, #2db82a 60%, #1a7a18)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -6px -8px 16px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[34px] font-black text-white drop-shadow-md">犬</span></div>
          <div className="w-[2px] h-[55px] bg-white/40 mt-[1px]"></div>
        </motion.div>
        <motion.div animate={{ y: [0, -15, 0], rotate: [1, -3, 1] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="absolute z-0 scale-75 md:scale-100 top-[15%] left-[18%] origin-top flex flex-col items-center">
          <div style={{ width: '68px', height: '80px', background: 'radial-gradient(circle at 35% 30%, #ff8a90, #ff4e63 55%, #cc0022)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[30px] font-black text-white drop-shadow-md">鳥</span></div>
          <div className="w-[2px] h-[50px] bg-white/40 mt-[1px]"></div>
        </motion.div>
        <motion.div animate={{ y: [0, -18, 0], rotate: [2, -2, 2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute z-0 scale-75 md:scale-100 top-[2%] left-[38%] origin-top flex flex-col items-center">
          <div style={{ width: '82px', height: '98px', background: 'radial-gradient(circle at 35% 30%, #7bbfee, #3a8fd4 55%, #1a5fa0)', borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%', boxShadow: 'inset -8px -10px 20px rgba(0,0,0,0.25), inset 4px 4px 10px rgba(255,255,255,0.3), 0 6px 18px rgba(0,0,0,0.3)' }} className="flex items-center justify-center"><span className="text-[38px] font-black text-white drop-shadow-md">猫</span></div>
          <div className="w-[2px] h-[65px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* ASOSIY OYNA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 mt-[160px] md:mt-0 w-full max-w-[340px] md:max-w-[850px] bg-[#3f67aa0d] dark:bg-black/30 backdrop-blur-[24px] border border-[#6b8ad71f] dark:border-white/10 rounded-[24px] md:rounded-[32px] p-5 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-stretch gap-5 md:gap-8 lg:gap-10"
        >
          {/* CHAP TARAFI */}
          <div className="w-full md:w-[45%] flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <h2 className="text-2xl md:text-[42px] font-black text-white leading-tight tracking-tight uppercase drop-shadow-sm">
                  MISSIA <br /> BRIEFING
                </h2>
              </div>

              <div className="mt-2 md:mt-6">
                <p className="text-[10px] md:text-sm font-bold text-white/70 uppercase tracking-[0.15em] mb-[-4px] md:mb-[-10px]">Level</p>
                <div className="text-6xl md:text-[8rem] font-black italic text-white leading-none tracking-tighter drop-shadow-lg">
                  {LEVEL_INFO.id < 10 ? `0${LEVEL_INFO.id}` : LEVEL_INFO.id}
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-5 mt-4 md:mt-8">
              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-white/80">Goal:</span>
                  <span className="text-[9px] md:text-xs font-bold text-white/50 uppercase tracking-widest">GOAL: {LEVEL_INFO.targetScore} PTS</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-2.5 md:h-4 w-full bg-[#111736] rounded-full p-[2px] shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#6b7af5] to-[#929ef9] rounded-full w-[35%]" />
                  </div>
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-[#161a38] rounded-full flex items-center justify-center text-[10px] md:text-xs border border-white/10 shadow-sm text-yellow-500">🔒</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">LIVES: 3</span>
                <div className="flex gap-1 md:gap-1.5">
                  <span className="text-sm md:text-lg">❤️</span><span className="text-sm md:text-lg">❤️</span><span className="text-sm md:text-lg">❤️</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px bg-white/10 self-stretch"></div>
          <div className="block md:hidden h-px w-full bg-white/10"></div>

          {/* O'NG TARAFI */}
          <div className="w-full md:w-[50%] flex flex-col justify-between">
            <div className="space-y-2 md:space-y-4">
              <p className="text-white text-base md:text-[28px] font-semibold leading-snug">
                Target: Identify Kanji symbols matching the target word.
              </p>
              <p className="text-[#a8c6e6] dark:text-slate-300 text-xs md:text-base font-normal">
                Nishon: Nishon so'zga mos Kanji belgisini toping. Umumiy {LEVEL_INFO.targetScore} ball to'plang.
              </p>
            </div>

            <div className="mt-6 md:mt-auto space-y-3">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                {/* Darajalar oynasini ochuvchi tugma */}
                <button 
                  onClick={() => setShowLevelsModal(true)}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl text-white/80 hover:text-white transition-all active:scale-95"
                >
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Levels</span>
                </button>
                
                <button 
                  onClick={resumeGame}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl text-white/80 hover:text-white transition-all active:scale-95"
                >
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Continue</span>
                </button>
                
                <button 
                  onClick={restartLevel}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl text-white/80 hover:text-white transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Restart</span>
                </button>
              </div>

              <button
                onClick={() => setGameState('playing')}
                className="group w-full py-4 sm:py-5 bg-[#0c122b] hover:bg-[#121a3d] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 shadow-[0_0_15px_rgba(40,60,180,0.4)] border border-[#3b54b4]/50 active:scale-95 mt-2"
              >
                <span className="text-xl sm:text-2xl font-black text-[#e0e6ff] uppercase tracking-[0.15em]">
                  START
                </span>
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-[#829bf9] dark:fill-white text-[#829bf9] dark:text-white group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            
          </div>
        </motion.div>
        
        {/* DARAJALAR MODALI (Briefing ichida qulflar bilan) */}
        <AnimatePresence>
          {showLevelsModal && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl rounded-[24px] md:rounded-[40px]">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-slate-900 border border-white/20 p-6 sm:p-8 rounded-[30px] shadow-2xl w-[90%] max-w-[500px] flex flex-col items-center">
                  <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-wider">Darajalar</h2>
                  <div className="grid grid-cols-4 gap-3 w-full mb-6 max-h-[40vh] overflow-y-auto pr-2">
                     {[...Array(TOTAL_LEVELS)].map((_, i) => {
                        const levelNum = i + 1;
                        const isUnlocked = levelNum <= highestLevel;
                        const isCurrent = levelNum === currentLevelId;
                        
                        return (
                          <button 
                            key={i} 
                            disabled={!isUnlocked}
                            onClick={() => changeLevel(levelNum)}
                            className={`flex items-center justify-center h-12 rounded-xl font-bold text-lg transition-all ${
                              isCurrent ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                              : isUnlocked ? 'bg-white/10 text-white hover:bg-white/20' 
                              : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                          >
                            {isUnlocked ? levelNum : '🔒'}
                          </button>
                        )
                     })}
                  </div>
                  <button onClick={() => setShowLevelsModal(false)} className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-full font-black text-lg uppercase transition-all shadow-lg shadow-red-500/30">Orqaga</button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==========================================
  // 2. ASOSIY O'YIN EKRANI
  // ==========================================
  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[500px] bg-gradient-to-b from-sky-400 via-sky-200 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden rounded-[30px] border border-slate-200 dark:border-slate-700 shadow-inner transition-colors duration-500">
      <FloatingClouds />

      {/* TEPADAGI HUD */}
      <div className="absolute top-2 sm:top-6 left-2 sm:left-6 right-2 sm:right-6 flex justify-between items-center bg-white/30 dark:bg-black/30 backdrop-blur-xl px-3 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-[30px] shadow-2xl z-20 border border-white/40 dark:border-white/10">
        
        {/* HAYOTLAR */}
        <div className="flex gap-0.5 sm:gap-2 text-xl sm:text-3xl min-w-[60px] sm:min-w-[100px]">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`transition-all duration-500 ${i < lives ? "scale-100 opacity-100" : "scale-75 opacity-20 grayscale"}`}>❤️</span>
          ))}
        </div>
        
        {/* NISHON SO'Z */}
        <div className="flex flex-col items-center flex-1 px-1">
          <span className="text-[10px] sm:text-xs font-black text-blue-900/50 dark:text-white/50 uppercase tracking-[0.2em] mb-1">Toping:</span>
          <div className="text-xl sm:text-4xl font-black text-blue-950 dark:text-white drop-shadow-sm truncate">{targetWord?.uz}</div>
        </div>

        {/* BALL VA PAUZA */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-white/50 dark:bg-white/10 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-2xl border border-white/50 dark:border-white/10 shadow-inner text-right">
            <span className="text-sm sm:text-2xl font-black text-blue-600 dark:text-blue-400">{score}/{LEVEL_INFO.targetScore}</span>
          </div>
          <button 
            onClick={() => setGameState('paused')}
            className="w-10 h-10 sm:w-14 sm:h-14 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md border border-white/50 dark:border-white/10 transition-all active:scale-90"
            title="To'xtatish"
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* SHARLAR */}
      <div className="relative w-full h-full z-10">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <BubbleStatic key={bubble.id} bubble={bubble} handlePop={handlePop} removeBubble={removeBubble} isPaused={gameState === 'paused' || showLevelsModal} />
          ))}
        </AnimatePresence>
      </div>

      {/* PAUZA MENYUSI */}
      {gameState === 'paused' && !showLevelsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1a3a6e]/60 dark:bg-black/80 backdrop-blur-md rounded-[30px]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#3f67aa0d] dark:bg-slate-800 p-8 sm:p-10 rounded-[30px] border border-[#6b8ad71f] dark:border-white/10 backdrop-blur-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center w-[90%] max-w-[400px]">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-wider uppercase drop-shadow-sm">To'xtatildi</h2>
            <div className="flex flex-col gap-4 w-full">
              <button onClick={resumeGame} className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-black rounded-full font-black text-lg shadow-lg uppercase">▶️ Davom etish</button>
              <button onClick={restartLevel} className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-black text-lg shadow-lg uppercase">🔄 Qaytadan</button>
              <button onClick={() => setShowLevelsModal(true)} className="w-full py-3.5 bg-purple-500 hover:bg-purple-400 text-white rounded-full font-black text-lg shadow-lg uppercase">📊 Darajalar</button>
              <Link href="/dashboard/games" className="w-full py-3.5 bg-red-500 hover:bg-red-400 text-white text-center rounded-full font-black text-lg shadow-lg uppercase">🚪 Chiqish</Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* DARAJALAR MODALI (Pauza ichida) */}
      <AnimatePresence>
        {showLevelsModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl rounded-[30px]">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-slate-900 border border-white/20 p-6 sm:p-8 rounded-[30px] shadow-2xl w-[90%] max-w-[500px] flex flex-col items-center">
                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-wider">Darajalar</h2>
                <div className="grid grid-cols-4 gap-3 w-full mb-6 max-h-[40vh] overflow-y-auto pr-2">
                   {[...Array(TOTAL_LEVELS)].map((_, i) => {
                      const levelNum = i + 1;
                      const isUnlocked = levelNum <= highestLevel;
                      const isCurrent = levelNum === currentLevelId;
                      
                      return (
                        <button 
                          key={i} 
                          disabled={!isUnlocked}
                          onClick={() => changeLevel(levelNum)}
                          className={`flex items-center justify-center h-12 rounded-xl font-bold text-lg transition-all ${
                            isCurrent ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                            : isUnlocked ? 'bg-white/10 text-white hover:bg-white/20' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          {isUnlocked ? levelNum : '🔒'}
                        </button>
                      )
                   })}
                </div>
                <button onClick={() => setShowLevelsModal(false)} className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-full font-black text-lg uppercase transition-all shadow-lg shadow-red-500/30">Orqaga</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GAME OVER EKRANI */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-[30px]">
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 border border-red-500/30 p-8 sm:p-12 rounded-[30px] shadow-[0_20px_50px_rgba(255,0,0,0.2)] flex flex-col items-center w-[90%] max-w-[450px]">
            <h2 className="text-4xl sm:text-6xl font-black mb-6 text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">GAME OVER</h2>
            <div className="text-2xl sm:text-3xl mb-8 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 text-white">Ball: <span className="text-yellow-400 font-bold">{score}</span></div>
            <div className="flex flex-col gap-4 w-full">
              <button onClick={restartLevel} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] uppercase">🔄 Qayta urinish</button>
              <Link href="/dashboard/games" className="w-full py-4 bg-transparent hover:bg-white/5 text-white text-center rounded-full font-black text-lg border border-white/10 uppercase">🏠 Menyuga qaytish</Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* LEVEL COMPLETE EKRANI */}
      {gameState === 'completed' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a3a6e]/90 to-[#2db82a]/60 dark:from-slate-900/90 dark:to-green-900/60 backdrop-blur-md rounded-[30px]">
          <Confetti />
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#3f67aa0d] dark:bg-slate-800 p-8 sm:p-12 rounded-[30px] border border-[#6b8ad71f] dark:border-white/10 backdrop-blur-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center w-[90%] max-w-[500px] z-10 text-center">
            <div className="text-6xl sm:text-8xl mb-6">⭐</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-green-300 drop-shadow-md">BOSQICH YAKUNLANDI!</h2>
            <p className="text-xl text-white mb-8">Siz {score} ball to'pladingiz!</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/dashboard/games" className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-black border border-white/20 uppercase flex items-center justify-center">🏠 Menyuga</Link>
              
              {/* NEXT LEVEL YOKI TEZ ORADA TUGMASI */}
              {currentLevelId < TOTAL_LEVELS ? (
                <button 
                  onClick={() => changeLevel(currentLevelId + 1)} 
                  className="flex-1 py-4 bg-green-500 hover:bg-green-400 text-black rounded-full font-black shadow-[0_0_15px_rgba(40,200,80,0.4)] uppercase flex items-center justify-center"
                >
                  Keyingi ➡️
                </button>
              ) : (
                <button 
                  disabled
                  className="flex-1 py-4 bg-yellow-500/80 text-black/80 rounded-full font-black uppercase flex items-center justify-center cursor-not-allowed"
                >
                  Tez Orada 🚀
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}