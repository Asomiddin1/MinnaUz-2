"use client";

import { useState, useEffect } from "react";
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

const FloatingClouds = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {[1, 2, 3, 4, 5].map((cloud, index) => (
        <motion.div
          key={cloud}
          className="absolute opacity-40 sm:opacity-60"
          style={{ top: `${index * 18}%`, left: "-30%" }}
          animate={{ x: ["0vw", "130vw"] }}
          transition={{
            duration: 25 + Math.random() * 15,
            ease: "linear",
            repeat: Infinity,
            delay: Math.random() * 10,
          }}
        >
          <div className="w-16 h-8 sm:w-24 sm:h-12 bg-white/80 rounded-full relative shadow-sm">
            <div className="absolute w-10 h-10 sm:w-16 sm:h-16 bg-white/80 rounded-full -top-4 sm:-top-6 left-2"></div>
            <div className="absolute w-8 h-8 sm:w-12 sm:h-12 bg-white/80 rounded-full -top-3 sm:-top-4 left-8 sm:left-10"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const LevelCompleteConfetti = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full opacity-70 ${["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400"][i % 5]}`}
          style={{ left: `${Math.random() * 100}%`, top: `-5%` }}
          animate={{ y: `105vh`, x: `${(Math.random() - 0.5) * 30}vw`, rotate: 360 }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
    </div>
  );
};

const BubbleStatic = ({ bubble, handlePop, removeBubble }: any) => {
  return (
    <motion.div
      initial={{ y: 0 }} 
      animate={{ y: -1300 }} 
      exit={{ scale: 1.8, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: bubble.duration, ease: "linear" }}
      onAnimationComplete={() => removeBubble(bubble.id)}
      onClick={() => handlePop(bubble.ja, bubble.id)}
      className={`absolute cursor-pointer flex flex-col items-center justify-center 
        w-20 h-20 sm:w-32 sm:h-32 rounded-full 
        bg-gradient-to-br ${bubble.colorClass} 
        border-2 border-white/60
        shadow-[inset_0_5px_15px_rgba(255,255,255,0.4),0_10px_25px_rgba(0,0,0,0.2)] 
        text-white text-2xl sm:text-4xl font-black 
        hover:scale-105 active:scale-90 transition-transform`}
      style={{ left: bubble.left, top: "100%" }} 
    >
      <div className="absolute top-2 left-4 w-5 h-3 bg-white/40 rounded-full blur-[1px] rotate-[-30deg]"></div>
      <span className="z-10 drop-shadow-lg select-none">{bubble.ja}</span>
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-12 sm:h-20 bg-white/40"></div>
    </motion.div>
  );
};

export default function Level1Game() {
  const [targetWord, setTargetWord] = useState(WORDS_LIST[0]);
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (score >= 50) {
      setLevelComplete(true);
      setBubbles([]);
    }
  }, [score]);

  useEffect(() => {
    if (!isStarted || gameOver || levelComplete) return;

    let spawnCount = 0;
    const interval = setInterval(() => {
      spawnCount++;
      const isTarget = spawnCount % 3 === 0;
      const startWord = isTarget ? targetWord : WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
      setBubbles((prev) => [...prev, {
        id: Math.random(),
        ja: startWord.ja,
        left: `${5 + Math.random() * 85}%`,
        duration: 7 + Math.random() * 5,
        colorClass: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      }]);
    }, 1100);
    return () => clearInterval(interval);
  }, [isStarted, gameOver, levelComplete, targetWord]);

  const handlePop = (clickedWord: string, id: number) => {
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

  const removeBubble = (id: number) => setBubbles((prev) => prev.filter((b) => b.id !== id));

  const restartGame = () => {
    setScore(0); setLives(3); setBubbles([]); setGameOver(false); setLevelComplete(false);
    setTargetWord(WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)]);
    setIsStarted(false);
  };

  // ==========================================
  // ULTRA PRO MISSION BRIEFING (RESPONSIVE)
  // ==========================================


// ... (boshqa importlar, FloatingClouds komponentlari)

  if (!isStarted) {
    return (
      // Asosiy fon: Mobilda elementlar pastga tushishi uchun tepadan joy tashlaymiz
      <div className="relative w-full min-h-[650px] md:h-[calc(100vh-100px)] flex flex-col items-center justify-end md:justify-center px-4 pb-6 md:pb-0 overflow-hidden rounded-[24px] md:rounded-[40px] bg-gradient-to-b from-[#1a3a6e] via-[#3a6fc4] to-[#7aa8d8]">
        <FloatingClouds />

         {/* --- ASOSIY KARTA --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // Mobilda kengligi 340px, Desktopda 850px. mt-[160px] orqali mobilda pufaklardan pastga qochirilgan.
          className="relative z-10 mt-[160px] md:mt-0 w-full max-w-[340px] md:max-w-[850px] bg-[#3f67aa0d] backdrop-blur-[24px] border border-[#6b8ad71f] rounded-[24px] md:rounded-[32px] p-5 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-stretch gap-5 md:gap-8 lg:gap-10"
        >
          
          {/* CHAP TARAFI: LEVEL INFO */}
          <div className="w-full md:w-[45%] flex flex-col justify-between">
            <div>
              {/* Header va Logo */}
              <div className="flex items-start justify-between">
                <h2 className="text-2xl md:text-[42px] font-black text-white leading-tight tracking-tight uppercase drop-shadow-sm">
                  MISSIA <br /> BRIEFING
                </h2>
                {/* Kichik Badge/Logo */}
                <div className="w-10 h-10 md:w-16 md:h-16 bg-[#162542] border-[2px] border-[#e65c58] rounded-md md:rounded-xl flex flex-col items-center justify-center rotate-[3deg] p-1 md:p-1.5 flex-shrink-0 cursor-pointer transition-transform hover:scale-110 hover:rotate-0">
                   <div className="text-[4px] md:text-[6px] text-white font-black uppercase tracking-widest text-center leading-tight">MISSION<br/>BRIEFING</div>
                   <div className="w-[80%] h-[1px] bg-white/30 my-[2px] md:my-[4px]"></div>
                   <div className="w-[85%] flex-1 bg-[#4d88be] rounded-[1px] md:rounded-[2px] relative overflow-hidden">
                     <div className="absolute bottom-0 w-full h-[55%] bg-white" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}></div>
                   </div>
                </div>
              </div>

              {/* Level 01 */}
              <div className="mt-2 md:mt-6">
                <p className="text-[10px] md:text-sm font-bold text-white/70 uppercase tracking-[0.15em] mb-[-4px] md:mb-[-10px]">Level</p>
                <div className="text-6xl md:text-[8rem] font-black italic text-white leading-none tracking-tighter drop-shadow-lg">
                  01
                </div>
              </div>
            </div>

            {/* Statistika qismi */}
            <div className="space-y-3 md:space-y-5 mt-4 md:mt-8">
              {/* Progress Bar */}
              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-white/80">Goal:</span>
                  <span className="text-[9px] md:text-xs font-bold text-white/50 uppercase tracking-widest">GOAL: 50 PTS</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-2.5 md:h-4 w-full bg-[#111736] rounded-full p-[2px] shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#6b7af5] to-[#929ef9] rounded-full w-[35%]" />
                  </div>
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-[#161a38] rounded-full flex items-center justify-center text-[10px] md:text-xs border border-white/10 shadow-sm text-yellow-500">🔒</div>
                </div>
              </div>

              {/* Complexity */}
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-medium text-white/80">Complexity:</span>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-[9px] md:text-xs font-bold text-white/60 uppercase mr-1 tracking-widest">EASY</span>
                  <div className="h-2.5 md:h-3.5 w-4 md:w-7 bg-[#6b7af5] rounded-sm md:rounded" />
                  <div className="h-2.5 md:h-3.5 w-4 md:w-7 bg-[#111736] rounded-sm md:rounded" />
                  <div className="h-2.5 md:h-3.5 w-4 md:w-7 bg-[#111736] rounded-sm md:rounded" />
                  <div className="h-2.5 md:h-3.5 w-4 md:w-7 bg-[#111736] rounded-sm md:rounded" />
                  <div className="h-2.5 md:h-3.5 w-4 md:w-7 bg-[#111736] rounded-sm md:rounded" />
                </div>
              </div>

              {/* Lives */}
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest">LIVES: 3</span>
                <div className="flex gap-1 md:gap-1.5">
                  <span className="text-sm md:text-lg">❤️</span>
                  <span className="text-sm md:text-lg">❤️</span>
                  <span className="text-sm md:text-lg">❤️</span>
                </div>
              </div>
            </div>
          </div>

          {/* O'rta Ajratuvchi Chiziq (Desktopda tik, Mobilda yotiq) */}
          <div className="hidden md:block w-px bg-white/10 self-stretch"></div>
          <div className="block md:hidden h-px w-full bg-white/10"></div>

          {/* O'NG TARAFI: TARGET INFO & BUTTON */}
          <div className="w-full md:w-[50%] flex flex-col justify-between">
            <div className="space-y-2 md:space-y-4">
              <p className="text-white text-base md:text-[28px] font-semibold leading-snug">
                Target: Identify 5 Kanji symbols matching the target word.
              </p>
              <p className="text-[#a8c6e6] text-xs md:text-base font-normal">
                Nishon: Nishon so'zga mos 5 ta Kanji belgisini toping.
              </p>
            </div>

            {/* NEON BOSHLACH BUTTON */}
            <button
              onClick={() => setIsStarted(true)}
              className="group mt-6 md:mt-auto w-full py-3 md:py-5 bg-[#0c122b] hover:bg-[#121a3d] rounded-full flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 shadow-[0_0_15px_rgba(40,60,180,0.4)] md:shadow-[0_0_20px_rgba(40,60,180,0.5)] border border-[#3b54b4]/50 active:scale-95"
            >
              <span className="text-lg md:text-2xl font-black text-[#e0e6ff] uppercase tracking-widest">
                START
              </span>
              <div className="w-0 h-0 border-y-[6px] md:border-y-[8px] border-y-transparent border-l-[10px] md:border-l-[14px] border-l-[#829bf9] group-hover:translate-x-1 transition-transform duration-300"></div>
            </button>
          </div>

        </motion.div>
{/* --- BALONLAR --- */}
        
        {/* 1. Yashil shar - 犬 (It) */}
        {/* --- BALONLAR TO'PLAMI (10 TA) --- */}

        {/* 1. Yashil - 犬 (It) */}
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [-3, 2, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-10 scale-75 md:scale-100 top-[8%] left-[5%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '72px', height: '86px',
            background: 'radial-gradient(circle at 35% 32%, #7ee87a, #2db82a 60%, #1a7a18)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 16px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[34px] font-black text-white drop-shadow-md">犬</span>
          </div>
          <div className="w-[2px] h-[55px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* 2. Pushti - 鳥 (Qush) */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [1, -3, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute z-10 scale-75 md:scale-100 top-[15%] left-[18%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '68px', height: '80px',
            background: 'radial-gradient(circle at 35% 30%, #ff8a90, #ff4e63 55%, #cc0022)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[30px] font-black text-white drop-shadow-md">鳥</span>
          </div>
          <div className="w-[2px] h-[50px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* 3. Ko'k - 猫 (Mushuk) */}
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-10 scale-75 md:scale-100 top-[2%] left-[38%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '82px', height: '98px',
            background: 'radial-gradient(circle at 35% 30%, #7bbfee, #3a8fd4 55%, #1a5fa0)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -8px -10px 20px rgba(0,0,0,0.25), inset 4px 4px 10px rgba(255,255,255,0.3), 0 6px 18px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[38px] font-black text-white drop-shadow-md">猫</span>
          </div>
          <div className="w-[2px] h-[65px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* 4. Binafsha - 大 (Katta) */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-1, 3, -1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute z-10 scale-75 md:scale-100 top-[10%] left-[58%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '68px', height: '80px',
            background: 'radial-gradient(circle at 35% 30%, #b0b0ee, #6060cc 55%, #3a3a99)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[30px] font-black text-white drop-shadow-md">大</span>
          </div>
          <div className="w-[2px] h-[50px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* 5. Sariq - 月 (Oy) */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute z-10 scale-75 md:scale-100 top-[5%] right-[22%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '74px', height: '88px',
            background: 'radial-gradient(circle at 35% 30%, #ffea8c, #ffc107 55%, #cc8b00)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 16px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[32px] font-black text-white drop-shadow-md">月</span>
          </div>
          <div className="w-[2px] h-[60px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* 6. To'q sariq - 木 (Daraxt) */}
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [3, -1, 3] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute z-10 scale-75 md:scale-100 top-[14%] right-[5%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '64px', height: '76px',
            background: 'radial-gradient(circle at 35% 30%, #f0b060, #e07018 55%, #a04c08)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[28px] font-black text-white drop-shadow-md">木</span>
          </div>
          <div className="w-[2px] h-[48px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* 7. Indigo - 山 (Tog') */}
        <motion.div
          animate={{ y: [0, -13, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="absolute z-10 scale-75 md:scale-100 top-[28%] left-[8%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '70px', height: '84px',
            background: 'radial-gradient(circle at 35% 30%, #818cf8, #4f46e5 55%, #312e81)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[30px] font-black text-white drop-shadow-md">山</span>
          </div>
          <div className="w-[2px] h-[52px] bg-white/40 mt-[1px]"></div>
        </motion.div>

        {/* 8. Qizil - 火 (Olov) */}
        <motion.div
          animate={{ y: [0, -17, 0], rotate: [1, -2, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="absolute z-10 scale-75 md:scale-100 top-[35%] right-[12%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '66px', height: '78px',
            background: 'radial-gradient(circle at 35% 30%, #fca5a5, #ef4444 55%, #991b1b)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[30px] font-black text-white drop-shadow-md">火</span>
          </div>
          <div className="w-[2px] h-[45px] bg-white/40 mt-[1px]"></div>
        </motion.div>   

        {/* 10. Binafsha/Pushti - 花 (Gul) */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute z-10 scale-75 md:scale-100 top-[52%] right-[30%] origin-top flex flex-col items-center"
        >
          <div style={{
            width: '68px', height: '82px',
            background: 'radial-gradient(circle at 35% 30%, #f9a8d4, #ec4899 55%, #831843)',
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.25), inset 3px 3px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)'
          }} className="flex items-center justify-center">
            <span className="text-[30px] font-black text-white drop-shadow-md">花</span>
          </div>
          <div className="w-[2px] h-[48px] bg-white/40 mt-[1px]"></div>
        </motion.div>
      </div>
    );
  }
  // ==========================================
  // LEVEL COMPLETE, GAMEOVER VA MAIN GAME
  // ==========================================
  if (levelComplete) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-blue-900 to-emerald-900 text-white z-[100] p-4 overflow-hidden rounded-[30px]">
        <LevelCompleteConfetti />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 p-6 sm:p-12 rounded-[30px] sm:rounded-[40px] border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col items-center z-10 text-center max-w-lg w-full">
            <div className="text-5xl sm:text-8xl mb-4 sm:mb-6 drop-shadow-xl">⭐</div>
            <h2 className="text-2xl sm:text-5xl font-black mb-4 text-green-300 tracking-tight">BOSQICH YAKUNLANDI!</h2>
            <p className="text-lg sm:text-2xl mb-8 sm:mb-10 text-blue-100">Siz {score} ball yig'dingiz!</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <button onClick={restartGame} className="flex-1 px-6 py-3 sm:py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all border border-white/10">🔄 Qaytadan</button>
                <Link href="/dashboard/games/buble/2" className="flex-1 px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 rounded-2xl font-bold shadow-lg text-center font-bold">2-Bosqich ➡️</Link>
            </div>
        </motion.div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-black text-white z-[100] p-4 rounded-[30px]">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900/80 p-8 sm:p-12 rounded-[30px] sm:rounded-[40px] border border-slate-700 backdrop-blur-3xl shadow-2xl flex flex-col items-center max-w-lg w-full">
            <h2 className="text-4xl sm:text-6xl font-black mb-4 sm:mb-6 text-red-500">GAME OVER</h2>
            <div className="text-2xl sm:text-4xl mb-8 sm:mb-10 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                🏆 Ball: <span className="text-yellow-400 font-bold">{score}</span>
            </div>
            <button onClick={restartGame} className="w-full px-8 py-4 sm:py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl sm:text-2xl transition-all shadow-xl">🔄 Qayta urinish</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[500px] bg-gradient-to-b from-sky-400 via-sky-200 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden rounded-[30px] border border-slate-200 dark:border-slate-700 shadow-inner">
      <FloatingClouds />

      <div className="absolute top-2 sm:top-6 left-2 sm:left-6 right-2 sm:right-6 
        flex justify-between items-center bg-white/30 dark:bg-black/30 backdrop-blur-xl 
        px-3 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-[30px] shadow-2xl z-20 border border-white/40">
        
        <div className="flex gap-0.5 sm:gap-2 text-xl sm:text-3xl min-w-[60px] sm:min-w-[120px]">
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`transition-all duration-500 ${i < lives ? "scale-100 opacity-100" : "scale-75 opacity-20 grayscale"}`}>❤️</span>
          ))}
        </div>
        
        <div className="flex flex-col items-center flex-1 px-1">
          <span className="hidden sm:block text-[10px] font-black text-blue-900/50 dark:text-white/50 uppercase tracking-[0.2em] mb-1 text-black dark:text-white">Toping:</span>
          <div className="text-xl sm:text-3xl md:text-5xl font-black text-blue-950 dark:text-white drop-shadow-sm tracking-tight text-center truncate max-w-[120px] sm:max-w-none">
            {targetWord?.uz}
          </div>
        </div>

        <div className="bg-white/50 dark:bg-white/10 px-2 py-1 sm:px-6 sm:py-2 rounded-lg sm:rounded-2xl border border-white/50 shadow-inner min-w-[70px] sm:min-w-[100px] text-right">
          <span className="hidden sm:inline text-xs font-bold text-blue-900/60 dark:text-white/60 mr-1 uppercase text-black dark:text-white">Ball:</span>
          <span className="text-sm sm:text-2xl font-black text-blue-600 dark:text-blue-400">{score}/50</span>
        </div>
      </div>

      <div className="relative w-full h-full z-10">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <BubbleStatic key={bubble.id} bubble={bubble} handlePop={handlePop} removeBubble={removeBubble} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}