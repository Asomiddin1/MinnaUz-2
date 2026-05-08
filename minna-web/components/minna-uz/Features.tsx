"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FeatureItem = ({ feat, idx }: { feat: any, idx: number }) => {
  const itemRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const textY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <motion.div 
      ref={itemRef}
      className={`max-w-6xl w-full flex flex-col md:flex-row items-center gap-16 md:gap-24 ${feat.reverse ? 'md:flex-row-reverse' : ''}`}
    >
      <motion.div 
        style={{ y: imageY }}
        className="w-full md:w-1/2 flex justify-center relative"
      >
        <div className={`absolute inset-0 scale-75 blur-3xl opacity-20 bg-gradient-to-tr ${idx === 1 ? 'from-orange-400 to-yellow-300' : 'from-[#022ecc] to-cyan-400'}`} />
        
        <motion.div 
          whileHover={{ scale: 1.05, rotateY: feat.reverse ? -10 : 10 }}
          className="relative w-80 h-80 bg-white rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden group"
        >
          <div className="text-8xl group-hover:scale-110 transition-transform duration-500 select-none">
            {idx === 0 ? "🎮" : idx === 1 ? "🚀" : "🧠"}
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>

      <motion.div 
        style={{ y: textY }}
        className="w-full md:w-1/2 flex flex-col text-center md:text-left px-4"
      >
        <motion.h2 
          className="text-4xl md:text-6xl font-[1000] text-[#4b4b4b] mb-8 leading-[1.1] tracking-tighter"
          // BU YERDA: #58cc02 (yashil) o'rniga #03206a (to'q ko'k) qo'yildi
          whileHover={{ x: 10, color: "#03206a" }} 
        >
          {feat.title}
        </motion.h2>
        <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-lg">
          {feat.desc}
        </p>
        
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          className="h-2 bg-[#1002cc] rounded-full mt-8 self-center md:self-start"
        />
      </motion.div>
    </motion.div>
  );
};

export default function Features() {
  const features = [
    {
      title: "Bepul. Qiziqarli. Samarali.",
      desc: "Minna bilan o'rganish o'yin kabi qiziqarli. Ballar to'plang, yangi darajalarni oching va nutq qobiliyatingizni hayratlanarli darajada rivojlantiring.",
      reverse: false,
    },
    {
      title: "O'qishga rag'bat",
      desc: "Bizning maskotimiz Minna sizni zeriktirmaydi. Qiziqarli vazifalar va eslatmalar bilan o'qishni kundalik odatga aylantirish endi juda oson.",
      reverse: true,
    },
    {
      title: "Aqlli mashg'ulotlar",
      desc: "Sun'iy intellekt darslarni aynan sizga moslashtiradi. Qiyinchilik darajasi sizning bilimingizga qarab real vaqtda o'zgarib boradi.",
      reverse: false,
    }
  ];

  return (
    <section className="relative w-full flex flex-col items-center py-40 px-6 space-y-48 bg-white overflow-hidden">
      
      <motion.div 
        animate={{ y: [0, 50, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute right-0 top-1/4 text-9xl blur-sm select-none pointer-events-none opacity-20"
      >
        ✨
      </motion.div>
      <motion.div 
        animate={{ x: [0, -40, 0], rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute left-10 top-1/2 text-7xl blur-[2px] select-none pointer-events-none opacity-10"
      >
        ⚙️
      </motion.div>

      {features.map((feat, idx) => (
        <FeatureItem key={idx} feat={feat} idx={idx} />
      ))}

      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#58cc02 2px, transparent 2px)', backgroundSize: '60px 60px' }}>
      </div>
    </section>
  );
}