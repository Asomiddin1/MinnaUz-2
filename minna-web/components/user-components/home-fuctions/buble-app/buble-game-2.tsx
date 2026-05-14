"use client";
import { unlockNextStage } from "@/components/user-components/japan-map-rpg/data";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const WORDS_LIST = [
  { ja: "猫", uz: "Mushuk" },
  { ja: "犬", uz: "It" },
  { ja: "鳥", uz: "Qush" },
  { ja: "魚", uz: "Baliq" },
  { ja: "車", uz: "Mashina" },
  { ja: "本", uz: "Kitob" },
  { ja: "花", uz: "Gul" },
  { ja: "水", uz: "Suv" },
];

const BUBBLE_COLORS = [
  "from-pink-400 to-rose-500",
  "from-blue-400 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-yellow-400 to-orange-500",
  "from-purple-400 to-fuchsia-500",
];

const FloatingClouds = React.memo(() => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {[1, 2, 3, 4, 5].map((cloud, index) => (
        <motion.div
          key={cloud}
          className="absolute opacity-40 sm:opacity-60 will-change-transform"
          style={{ top: `${index * 18}%`, left: "-30%" }}
          animate={{ x: ["0vw", "130vw"] }}
          transition={{
            duration: 25 + Math.random() * 15,
            ease: "linear",
            repeat: Infinity,
            delay: Math.random() * 10,
          }}
        >
          <div className="w-16 h-8 sm:w-24 sm:h-12 bg-white/80 dark:bg-white/10 rounded-full relative shadow-sm">
            <div className="absolute w-10 h-10 sm:w-16 sm:h-16 bg-white/80 dark:bg-white/10 rounded-full -top-4 sm:-top-6 left-2"></div>
            <div className="absolute w-8 h-8 sm:w-12 sm:h-12 bg-white/80 dark:bg-white/10 rounded-full -top-3 sm:-top-4 left-8 sm:left-10"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});
FloatingClouds.displayName = "FloatingClouds";

const VictoryConfetti = React.memo(() => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full opacity-70 will-change-transform ${["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400"][i % 5]}`}
          style={{ left: `${Math.random() * 100}%`, top: `-5%` }}
          animate={{ y: `105vh`, x: `${(Math.random() - 0.5) * 30}vw`, rotate: 360 }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
    </div>
  );
});
VictoryConfetti.displayName = "VictoryConfetti";

// Sharlar qotmasligi uchun React.memo
const Bubble = React.memo(({ bubble, handlePop, removeBubble, isPaused }: any) => {
  const [currentText, setCurrentText] = useState(bubble.ja);

  useEffect(() => {
    if (isPaused) return; 
    const interval = setInterval(() => {
      const randomWord = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)].ja;
      setCurrentText(randomWord);
    }, 1500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <motion.div
      initial={{ y: 0 }} 
      // y yo'nalishi bo'yicha -120vh ishlatildi
      animate={isPaused ? {} : { y: "-120vh" }} 
      exit={{ scale: 1.8, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: bubble.duration, ease: "linear" }}
      onAnimationComplete={() => removeBubble(bubble.id)}
      onClick={() => !isPaused && handlePop(currentText, bubble.id)} 
      className={`absolute pointer-events-auto will-change-transform flex flex-col items-center justify-center 
        w-20 h-20 sm:w-32 sm:h-32 rounded-full 
        bg-gradient-to-br ${bubble.colorClass} 
        border-2 border-white/60
        shadow-[inset_0_5px_15px_rgba(255,255,255,0.4),0_10px_25px_rgba(0,0,0,0.2)] 
        text-white text-2xl sm:text-4xl font-black 
        ${!isPaused ? 'cursor-pointer active:scale-90' : 'cursor-not-allowed opacity-80 grayscale-[30%]'} transition-transform`}
      style={{ left: bubble.left, top: "100%" }} 
    >
      <div className="absolute top-2 left-4 w-5 h-3 bg-white/40 rounded-full blur-[1px] rotate-[-30deg]"></div>
      <span className="z-10 drop-shadow-lg select-none">{currentText}</span>
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-12 sm:h-20 bg-white/40"></div>
    </motion.div>
  );
});
Bubble.displayName = "Bubble";

export default function PopTheWordStage2() {
  const [targetWord, setTargetWord] = useState(WORDS_LIST[0]);
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (score >= 100) {
      setVictory(true);
      setBubbles([]);

      // BUM! 🚀 Shunchaki bosqich raqamini beramiz, qolganini o'zi hal qiladi!
      // Faraz qilaylik, bu Bubble Pop o'yini xaritadagi 2-bosqich o'yini:
      unlockNextStage(2); 
    }
  }, [score]);

  useEffect(() => {
    if (gameOver || victory || isPaused) return; 
    
    const interval = setInterval(() => {
      const startWord = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
      setBubbles((prev) => [...prev, {
        id: Math.random(),
        ja: startWord.ja,
        left: `${5 + Math.random() * 85}%`,
        duration: 8 + Math.random() * 6,
        colorClass: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      }]);
    }, 1200);
    return () => clearInterval(interval);
  }, [gameOver, victory, isPaused]);

  // OPTIMIZATSIYA: removeBubble qotirib qo'yildi
  const removeBubble = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // OPTIMIZATSIYA: handlePop o'zgarganda boshqa sharlar qotib qolmasligi uchun useRef
  const handlePopLogic = (clickedWord: string, id: number) => {
    if (isPaused) return;
    
    if (clickedWord === targetWord.ja) {
      setScore((prev) => prev + 10);
      setTargetWord(WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)]);
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    } else {
      setLives((prev) => prev - 1);
      setBubbles((prev) => prev.filter((b) => b.id !== id));
      if (lives <= 1) setGameOver(true);
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

  const restartGame = () => {
    setScore(0); setLives(3); setBubbles([]); setGameOver(false); setVictory(false); setIsPaused(false);
    setTargetWord(WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)]);
  };

  if (victory) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-950 text-white z-[100] p-4 overflow-hidden">
        <VictoryConfetti />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 p-8 sm:p-12 rounded-[30px] sm:rounded-[40px] border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col items-center z-10 text-center max-w-lg w-full">
            <div className="text-6xl sm:text-8xl mb-6">👑</div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 text-yellow-300">SIZ YENGILMASSIZ!</h2>
            <p className="text-xl sm:text-2xl mb-10 text-blue-100">Siz 100 ball yig'ib, 2-bosqichni zabt etdingiz!</p>
            <div className="flex flex-col gap-4 w-full">
                <button onClick={restartGame} className="w-full px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-bold shadow-lg">🔄 Qaytadan o'ynash</button>
                <Link href="/dashboard/games/map" className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold border border-white/10 text-center">🗺️ Xaritaga qaytish</Link>
                <Link href="/dashboard/games" className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold border border-white/10 text-center">🏠 Menyuga qaytish</Link>
            </div>
        </motion.div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-black text-white z-[100] p-4 overflow-hidden">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900/80 p-8 sm:p-12 rounded-[30px] sm:rounded-[40px] border border-slate-700 backdrop-blur-3xl shadow-2xl flex flex-col items-center max-w-lg w-full">
            <h2 className="text-4xl sm:text-6xl font-black mb-6 text-red-500">GAME OVER</h2>
            <div className="text-2xl sm:text-4xl mb-10 bg-white/5 px-8 py-4 rounded-2xl border border-white/10">
                🏆 Ball: <span className="text-yellow-400 font-bold">{score}</span>
            </div>
            <button onClick={restartGame} className="w-full px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl sm:text-2xl transition-all shadow-xl shadow-blue-900/30">🔄 Qayta urinish</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg_buble_level2 bg-cover bg-center bg-no-repeat overflow-hidden bg-slate-900">
      <FloatingClouds />

      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 
        flex justify-between items-center bg-white/30 dark:bg-black/30 backdrop-blur-xl 
        px-3 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-[30px] shadow-2xl z-20 border border-white/40 dark:border-white/10">
        
        <div className="flex gap-0.5 sm:gap-2 text-xl sm:text-3xl min-w-[60px] sm:min-w-[120px]">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`transition-all duration-500 ${i < lives ? "scale-100 opacity-100" : "scale-75 opacity-20 grayscale"}`}>❤️</span>
          ))}
        </div>
        
        <div className="flex flex-col items-center flex-1 px-1">
          <span className="hidden sm:block text-[10px] font-black text-purple-900/50 dark:text-white/50 uppercase tracking-[0.2em] mb-1 text-center">Toping:</span>
          <div className="text-xl sm:text-3xl md:text-5xl font-black text-indigo-950 dark:text-white drop-shadow-sm tracking-tight text-center truncate max-w-[120px] sm:max-w-none">
            {targetWord?.uz}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-white/50 dark:bg-white/10 px-2 py-1 sm:px-6 sm:py-2 rounded-lg sm:rounded-2xl border border-white/50 dark:border-white/10 shadow-inner min-w-[70px] sm:min-w-[100px] text-right">
            <span className="hidden sm:inline text-xs font-bold text-purple-900/60 dark:text-white/60 mr-1 uppercase">Ball:</span>
            <span className="text-sm sm:text-2xl font-black text-purple-600 dark:text-purple-400">{score}/100</span>
          </div>
          
          <button 
            onClick={() => setIsPaused(true)}
            className="w-10 h-10 sm:w-14 sm:h-14 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md border border-white/50 dark:border-white/10 transition-all active:scale-90"
            title="To'xtatish"
          >
            ⏸️
          </button>
        </div>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
       <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <Bubble 
              key={bubble.id} 
              bubble={bubble} 
              handlePop={stableHandlePop} 
              removeBubble={removeBubble} 
              isPaused={isPaused} 
            />
          ))}
        </AnimatePresence>
      </div>
      </div>

      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-950/60 dark:bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 dark:bg-slate-800 p-8 sm:p-10 rounded-[30px] border border-white/20 dark:border-white/10 backdrop-blur-[24px] shadow-2xl flex flex-col items-center w-[90%] max-w-[400px]">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-wider uppercase drop-shadow-sm">To'xtatildi</h2>
            <div className="flex flex-col gap-4 w-full">
              <button onClick={() => setIsPaused(false)} className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-black rounded-full font-black text-lg shadow-lg uppercase">▶️ Davom etish</button>
              <button onClick={restartGame} className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-black text-lg shadow-lg uppercase">🔄 Qaytadan</button>
              <Link href="/dashboard/games/map" className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold border border-white/10 text-center"> 🗺️ Xaritaga qaytish</Link>
              <Link href="/dashboard/games" className="w-full py-3.5 bg-red-500 hover:bg-red-400 text-white text-center rounded-full font-black text-lg shadow-lg uppercase">🚪 Chiqish</Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}