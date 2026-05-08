"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function AppDownload() {
  const containerRef = useRef(null);

  // Parallax effekti uchun skrollni kuzatish
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-40 bg-[#dcf2ff] flex flex-col items-center overflow-hidden"
    >
      {/* 1. Atrofdagi 3D Pro elementlar (Parallax) */}
      <motion.div style={{ y: y1 }} className="absolute left-[5%] top-[10%] text-8xl filter drop-shadow-2xl opacity-40">📱</motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[5%] top-[20%] text-9xl filter drop-shadow-2xl">🔥</motion.div>
      <motion.div style={{ y: y1 }} className="absolute left-[15%] bottom-[10%] text-7xl opacity-30">💎</motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[15%] bottom-[20%] text-8xl opacity-30 rotate-12">👑</motion.div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute left-[40%] top-[5%] text-5xl opacity-20">⚙️</motion.div>

      {/* 2. Markaziy Kontent */}
      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center px-6">
        
        {/* Sarlavha qismi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-center mb-20"
        >
          <h2 className="text-7xl md:text-[120px] font-[1000] text-[#042c60] leading-none tracking-tighter mb-6">
            o'rganing
          </h2>
          <p className="text-xl md:text-2xl font-bold text-[#042c60]/60 max-w-2xl mx-auto">
            Testlar, maktablar va til kurslari — hammasi bitta ilovada!
          </p>
        </motion.div>

        {/* 3. Mahsulotlar Kartochkalari (Test va Maktab o'rniga zamonaviy bloklar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20">
          {/* Ingliz tili testi bloki */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border-2 border-white shadow-xl flex flex-col items-center text-center group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
            <h3 className="text-2xl font-black text-[#042c60] mb-2">Ingliz tili testi</h3>
            <p className="text-gray-600 font-bold text-sm">Sertifikatni uydan chiqmay oling.</p>
          </motion.div>

          {/* Maktablar uchun blok */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border-2 border-white shadow-xl flex flex-col items-center text-center group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏫</div>
            <h3 className="text-2xl font-black text-[#042c60] mb-2">Maktablar uchun</h3>
            <p className="text-gray-600 font-bold text-sm">O'qituvchilar uchun bepul vositalar.</p>
          </motion.div>
        </div>

        {/* 4. Yuklab olish tugmalari (Haqiqiy 3D effekt) */}
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <motion.button 
            whileHover={{ y: -8 }} whileTap={{ y: 0 }}
            className="bg-white px-10 py-5 rounded-[2rem] flex items-center gap-4 border-b-[10px] border-gray-300 active:border-b-0 transition-all shadow-2xl"
          >
             <span className="text-4xl text-black font-black"></span>
             <div className="text-left">
                <div className="text-[10px] font-black text-gray-400 uppercase">Yuklab olish</div>
                <div className="text-lg font-black text-[#042c60]">App Store</div>
             </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -8 }} whileTap={{ y: 0 }}
            className="bg-white px-10 py-5 rounded-[2rem] flex items-center gap-4 border-b-[10px] border-gray-300 active:border-b-0 transition-all shadow-2xl"
          >
             <span className="text-4xl">▶️</span>
             <div className="text-left">
                <div className="text-[10px] font-black text-gray-400 uppercase">Mavjud</div>
                <div className="text-lg font-black text-[#042c60]">Google Play</div>
             </div>
          </motion.button>
        </div>

      </div>

      {/* Orqa fondagi 3D nuqtali tekstura */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#042c60 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
      </div>
    </section>
  );
}