"use client";
import { motion } from "framer-motion";
import Link from "next/link"; // Link import qilindi

export default function HeroSection() {
  // Yangi ranglar palitrasi
  const brandBlue = "#d7ebf8"; // Siz yuborgan rasmdagi asosiy fon rangi
  const dotColor = "#b9d6e9";  // Nuqtalar uchun to'qroq moviy

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#f8f8f8] flex flex-col items-center pt-24 pb-20">
      
      {/* 1. PREMIUM NUQTALI FON (Siz yuborgan rasmdagidek) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ 
          backgroundImage: `radial-gradient(${dotColor} 3px, transparent 3px)`, 
          backgroundSize: '45px 45px',
          opacity: 0.6
        }}
      ></div>

      {/* 2. Sarlavha va Tugma */}
      <div className="relative z-50 flex flex-col items-center text-center px-6 mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[42px] md:text-[72px] font-[1000] text-[#042c60] leading-none tracking-tighter mb-8"
        >
          Minna.Uz bilan tillarni <br className="hidden md:block" /> o'rganing
        </motion.h1>

        {/* Tugma Link bilan o'raldi */}
        <Link href="/auth/login">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#ffffff] text-[#042c60] font-black text-lg md:text-xl uppercase py-4 px-16 rounded-2xl border-b-[6px] border-[#1342a0] shadow-xl hover:shadow-[0_15px_30px_rgba(28,176,246,0.3)] transition-all"
          >
            Boshlanishi
          </motion.button>
        </Link>
      </div>

      {/* 3. Markaziy Kompozitsiya Maydoni */}
      <div className="relative w-full max-w-5xl h-[500px] flex justify-center items-end" style={{ perspective: "1500px" }}>
        
        {/* 3D TELEFON - Yonlari to'q ko'k (border-[#042c60] qo'shildi) */}
        <motion.div
          initial={{ opacity: 0, rotateX: 45, y: 150 }}
          animate={{ opacity: 1, rotateX: 30, y: 70 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
          className="relative z-40 w-[290px] h-[550px] md:w-[340px] md:h-[620px] bg-white border-[12px] border-[#042c60] text-[#042c60] rounded-[3.5rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.15)] flex flex-col items-center overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute top-4 w-28 h-7 bg-[#1c4d91] rounded-full z-50 opacity-20"></div>
          
          <div className="w-full h-full bg-gradient-to-b from-[#f0f9ff] to-white relative flex items-end justify-center overflow-hidden">
            <div className="relative w-full h-[85%] flex items-end justify-center px-4">
              <motion.img 
                initial={{ y: 250, opacity: 0, scale: 0.7 }}
                animate={{ y: [0, -15, 0], opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.1, 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 12,
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                src="/bolalar.png"
                alt="Minna Characters"
                className="w-[110%] h-auto object-contain z-20 select-none drop-shadow-2xl mb-4"
              />

              {/* Sparkles */}
              <div className="absolute top-10 flex space-x-12 text-3xl z-30 pointer-events-none">
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }}>✨</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} className="mt-[-30px]">⭐</motion.span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/10 pointer-events-none z-40" />
        </motion.div>
      </div>

      {/* 4. MOVIY TO'LQIN (To'g'rilangan qism) */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none translate-y-[1px]">
        <svg viewBox="0 0 1440 320" className="w-full h-[250px] md:h-[400px] fill-[#380dd1]">
          <path d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,229.3C1120,235,1280,213,1360,202.7L1440,192V320H1360C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320H0V224Z"></path>
        </svg>
      </div>
      
      {/* Footer block - To'liq bo'yalgan qism (To'g'rilandi: fill o'rniga bg ishlatildi) */}
      <div className="absolute bottom-0 w-full h-[80px] bg-[#380dd1] z-30" />

    </section>
  );
}