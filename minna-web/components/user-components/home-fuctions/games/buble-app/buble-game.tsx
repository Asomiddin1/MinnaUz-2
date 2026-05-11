"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import GameLogin from "./buble-Menu";

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

const TOTAL_LEVELS = 2;

// --- YORDAMCHI KOMPONENTLAR ---
const FloatingClouds = React.memo(() => (
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
));
FloatingClouds.displayName = "FloatingClouds";

const Confetti = React.memo(() => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <motion.div key={i} className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full opacity-70 ${["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400"][i % 5]}`} style={{ left: `${Math.random() * 100}%`, top: `-5%` }} animate={{ y: `105vh`, x: `${(Math.random() - 0.5) * 30}vw`, rotate: 360 }} transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
    ))}
  </div>
));
Confetti.displayName = "Confetti";

// Sharlar qotmasligi uchun optimizatsiya qilingan komponent
const BubbleStatic = React.memo(({ bubble, handlePop, removeBubble, isPaused }: any) => {
  return (
    <motion.div
      initial={{ y: 0 }} 
      // Qotmasligi uchun piksel emas, balki vh ishlatamiz. Mobil ekranni aniq tark etadi.
      animate={isPaused ? {} : { y: "-120vh" }}
      exit={{ scale: 1.8, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: bubble.duration, ease: "linear" }}
      onAnimationComplete={() => removeBubble(bubble.id)}
      onClick={() => !isPaused && handlePop(bubble.ja, bubble.id)} 
      className={`absolute will-change-transform flex flex-col items-center justify-center 
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
});
BubbleStatic.displayName = "BubbleStatic";


// --- ASOSIY KOMPONENT ---
export default function CompleteGame() {
  const router = useRouter(); 
  
  const [gameState, setGameState] = useState<'briefing' | 'playing' | 'paused' | 'completed' | 'gameover'>('briefing');
  const [targetWord, setTargetWord] = useState(WORDS_LIST[0]);
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [highestLevel, setHighestLevel] = useState(1);
  const [showLevelsModal, setShowLevelsModal] = useState(false);

  const LEVEL_INFO = { 
    id: currentLevelId, 
    targetScore: 50, 
    speed: Math.max(600, 1200 - (currentLevelId - 1) * 60)
  };

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';

    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.touchAction = 'auto';
    };
  }, []);

  useEffect(() => {
    if (score >= LEVEL_INFO.targetScore && gameState === 'playing') {
      setGameState('completed');
      setBubbles([]);
      setHighestLevel(prev => Math.min(TOTAL_LEVELS, Math.max(prev, currentLevelId + 1)));
    }
  }, [score, gameState, currentLevelId]);

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
        left: `${5 + Math.random() * 80}%`, // Ekranga siqishi uchun 85% dan 80% ga tushirildi
        duration: Math.max(3.5, 6 + Math.random() * 4 - (currentLevelId * 0.2)),
        colorClass: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      }]);
    }, LEVEL_INFO.speed);

    return () => clearInterval(interval);
  }, [gameState, targetWord, currentLevelId]);

  // OPTIMIZATSIYA: Bubble o'chirish funksiyasi qotirib qo'yildi
  const removeBubble = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // OPTIMIZATSIYA: handlePop o'zgarganda barcha sharlar re-render bo'lmasligi uchun useRef ishlatildi
  const handlePopLogic = (clickedWord: string, id: number) => {
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

  const popLogicRef = useRef(handlePopLogic);
  useEffect(() => {
    popLogicRef.current = handlePopLogic;
  });

  const stableHandlePop = useCallback((word: string, id: number) => {
    popLogicRef.current(word, id);
  }, []);
  // ===========================================

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

 const changeLevel = (lvl: number) => {
    if (lvl === 2) {
      router.push('/dashboard/games/buble/2'); 
    } else {
      setCurrentLevelId(lvl);
      setScore(0);
      setLives(3);
      setBubbles([]);
      setTargetWord(WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)]);
      setGameState('playing');
      setShowLevelsModal(false);
    }
  };

  if (gameState === 'briefing') {
    return (
      <GameLogin 
        LEVEL_INFO={LEVEL_INFO}
        setGameState={setGameState}
        setShowLevelsModal={setShowLevelsModal}
        resumeGame={resumeGame}
        restartLevel={restartLevel}
        showLevelsModal={showLevelsModal}
        TOTAL_LEVELS={TOTAL_LEVELS}
        highestLevel={highestLevel}
        currentLevelId={currentLevelId}
        changeLevel={changeLevel}
      />
    );
  }

  return (
   <div className="max-md:fixed max-md:inset-0 max-md:z-[999] relative w-full h-[100dvh] md:h-[calc(100vh-80px)] md:min-h-[650px] bg_buble_levle1 from-sky-400 via-sky-200 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden md:rounded-[30px] border border-transparent dark:border-slate-700 shadow-inner transition-colors duration-500 select-none touch-none"> 
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
            <BubbleStatic 
               key={bubble.id} 
               bubble={bubble} 
               handlePop={stableHandlePop} 
               removeBubble={removeBubble} 
               isPaused={gameState === 'paused' || showLevelsModal} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* PAUZA MENYUSI */}
      {gameState === 'paused' && !showLevelsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1a3a6e]/60 dark:bg-black/80 backdrop-blur-md md:rounded-[30px]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#3f67aa0d] dark:bg-slate-800 p-8 sm:p-10 rounded-[30px] border border-[#6b8ad71f] dark:border-white/10 backdrop-blur-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center w-[90%] max-w-[400px]">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-wider uppercase drop-shadow-sm">To'xtatildi</h2>
            <div className="flex flex-col gap-4 w-full">
              <button onClick={resumeGame} className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-black rounded-full font-black text-lg shadow-lg uppercase">▶️ Davom etish</button>
              <button onClick={restartLevel} className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-black text-lg shadow-lg uppercase">🔄 Qaytadan</button>
              <button onClick={() => setShowLevelsModal(true)} className="w-full py-3.5 bg-purple-500 hover:bg-purple-400 text-white rounded-full font-black text-lg shadow-lg uppercase">📊 Darajalar</button>
              <Link href="/dashboard/games/map" className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold border border-white/10 text-center">🗺️ Xaritaga qaytish</Link>
              <Link href="/dashboard/games" className="w-full py-3.5 bg-red-500 hover:bg-red-400 text-white text-center rounded-full font-black text-lg shadow-lg uppercase">🚪 Chiqish</Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* DARAJALAR MODALI */}
      <AnimatePresence>
        {showLevelsModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl md:rounded-[30px]">
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md md:rounded-[30px]">
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a3a6e]/90 to-[#2db82a]/60 dark:from-slate-900/90 dark:to-green-900/60 backdrop-blur-md md:rounded-[30px]">
          <Confetti />
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#3f67aa0d] dark:bg-slate-800 p-8 sm:p-12 rounded-[30px] border border-[#6b8ad71f] dark:border-white/10 backdrop-blur-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center w-[90%] max-w-[500px] z-10 text-center">
            <div className="text-6xl sm:text-8xl mb-6">⭐</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-green-300 drop-shadow-md">BOSQICH YAKUNLANDI!</h2>
            <p className="text-xl text-white mb-8">Siz {score} ball to'pladingiz!</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/dashboard/games" className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-black border border-white/20 uppercase flex items-center justify-center">🏠 Menyuga</Link>
              
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