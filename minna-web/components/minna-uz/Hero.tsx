"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface HeroProps {
  isBottom?: boolean;
}

export default function Hero({ isBottom = false }: HeroProps) {
  return (
    <section className={`relative w-full overflow-hidden flex flex-col items-center bg-[#eaf6ff] ${isBottom ? 'pt-24 pb-0' : 'pt-24 pb-20 min-h-[85vh]'}`}>
      
      {/* Nuqtali (Dotted) orqa fon */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15] z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 z-20 px-6">
        
       <motion.div 
          className="w-full md:w-1/2 flex justify-center order-2 md:order-1"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <div className={`w-64 h-64 md:w-[400px] md:h-[400px] rounded-full flex items-center justify-center border-4 border-dashed shadow-2xl ${isBottom ? 'bg-white border-white/20' : 'bg-gray-100 border-gray-300'}`}>
            <span className={`${isBottom ? 'text-[#58cc02]' : 'text-gray-400'} font-black text-center`}>
              {isBottom ? "🦉 Duo" : "3D Rasm joyi"}
            </span>
          </div>
        </motion.div>

        {/* Matn va tugmalar */}
        <motion.div 
          className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-2"
          initial={{ opacity: 0, x: isBottom ? 0 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-black leading-tight mb-10 text-[#042c60]">
            MINNA bilan tillarni <br className="hidden md:block" /> o'rganing
          </h1>
          
          <div className="flex flex-col w-full max-w-[320px] gap-4">
            <Link href={'/dashboard'}>
              <button className="w-full font-black text-[17px] uppercase py-4 rounded-2xl border-b-4 transition-all shadow-sm text-[#1259fe] hover:bg-gray-100 text-[#0549b0] border-[#03206a]  active:border-b-3 active:translate-y-1">
                Boshlanishi
              </button>
            </Link>

            {!isBottom && (
              <Link href={'/auth/login'}>
                <button className="w-full bg-white hover:bg-gray-100 text-[#1cb0f6] font-black text-[17px] uppercase py-4 rounded-2xl border-2 border-gray-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all shadow-sm">
                  Mening akkauntim bor
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Faqat tepada bo'lsa - TO'Q KO'K To'lqin (Wave) */}
      {!isBottom && (
        <div className="absolute bottom-0 left-0 w-full leading-[0] z-10 translate-y-[1px]">
          {/* fill-[#042c60] orqali to'lqin rangi to'q ko'k qilindi */}
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[120px] fill-[#042c60]">
            <path d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      )}
    </section>
  );
}