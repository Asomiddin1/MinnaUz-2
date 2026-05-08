"use client";
import { motion } from "framer-motion";

export default function SuperDuolingo() {
  return (
    <section className="relative w-full bg-[#101138] py-32 flex justify-center px-6 overflow-hidden">
      
      {/* Orqa fondagi harakatlanuvchi neon nurlar (Aura) */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-full h-full bg-[radial-gradient(circle,rgba(59,130,246,0.3)_0%,transparent_70%)] blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-[radial-gradient(circle,rgba(168,85,247,0.3)_0%,transparent_70%)] blur-3xl"
        />
      </div>

      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
        
        {/* Chap tomon: Vizual Effekt (Logo yoki Mascot) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative w-full md:w-1/2 flex justify-center"
        >
          {/* Neon xalqa */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          
          <div className="relative group cursor-pointer">
             <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-[140px] md:text-[180px] drop-shadow-[0_0_50px_rgba(59,130,246,0.8)] select-none"
             >
                💫
             </motion.div>
             {/* Element tagidagi soya */}
             <div className="w-32 h-6 bg-black/40 blur-xl rounded-full mx-auto mt-4"></div>
          </div>
        </motion.div>

        {/* O'ng tomon: Matn va Tugma */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-5xl md:text-7xl font-[1000] italic leading-[0.9] tracking-tighter mb-8">
              <span className="text-white block mb-2 drop-shadow-lg">POWER UP WITH</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#a855f7] to-[#f472b6] animate-gradient-x bg-[length:200%_auto]">
                SUPER MINNA
              </span>
            </h2>
            
            <p className="text-blue-200/70 text-lg md:text-xl font-bold mb-10 max-w-md">
              Reklamasiz o'qing, cheksiz jonlarga ega bo'ling va bilimingizni Super tezlikda oshiring!
            </p>

            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#101138] font-black py-5 px-12 rounded-2xl text-lg uppercase tracking-wider border-b-[6px] border-gray-300 active:border-b-0 active:translate-y-1 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
            >
              1 HAFTA BEPUL
            </motion.button>
          </motion.div>
        </div>

      </div>

      {/* Dekorativ chiziqlar (Cyberpunk stili) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
    </section>
  );
}