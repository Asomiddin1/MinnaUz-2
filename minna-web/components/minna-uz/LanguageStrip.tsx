"use client";
import { motion } from "framer-motion";

export default function LanguageStrip() {
  const features = [
    { name: "Yapon tili", icon: "🇯🇵", desc: "N5 dan N1 gacha", color: "from-[#380dd1]/10 to-transparent" },
    { name: "JLPT Testlar", icon: "📝", desc: "Tayyorgarlik", color: "from-[#380dd1]/10 to-transparent" },
    { name: "Video darslar", icon: "📺", desc: "Ekspertlardan", color: "from-[#380dd1]/10 to-transparent" },
    { name: "O'yinlar", icon: "🎮", desc: "Qiziqarli o'qish", color: "from-[#380dd1]/10 to-transparent" },
  ];

  const deepPurple = "#380dd1"; // Siz tanlagan asosiy rang

  return (
    <div className="w-full border-y-2 border-gray-100 bg-white py-12 overflow-hidden relative">
      
      {/* Orqa fondagi juda xira dekorativ matn (Yaponcha) */}
      <div className="absolute inset-0 flex items-center justify-around opacity-[0.03] select-none pointer-events-none text-9xl font-black">
        <span>日本語</span>
        <span>JLPT</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {features.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ 
                y: -12,
                scale: 1.02,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              className="group relative flex flex-col items-center text-center p-8 rounded-[3rem] transition-all cursor-pointer bg-white border border-gray-50 hover:shadow-[0_30px_60px_-15px_rgba(56,13,209,0.15)]"
            >
              {/* Ikonka orqasidagi yumshoq gradient aura */}
              <div className={`absolute inset-0 rounded-[3rem] bg-gradient-to-b ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Ikonka qismi */}
              <div 
                className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 relative z-10 transition-all duration-500 group-hover:shadow-lg shadow-[#380dd1]/10"
                style={{ backgroundColor: '#f8faff' }}
              >
                <span className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  {item.icon}
                </span>
              </div>

              {/* Matnlar qismi */}
              <div className="relative z-10">
                <h3 
                  className="font-[1000] uppercase text-sm md:text-base tracking-widest mb-2 transition-colors duration-300"
                  style={{ color: '#042c60' }} // Asosiy ko'k rang
                >
                  <span className="group-hover:text-[#380dd1] transition-colors">
                    {item.name}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-tighter opacity-80 group-hover:opacity-100">
                  {item.desc}
                </p>
              </div>

              {/* Pastki 3D Aktivlik Chizig'i */}
              <motion.div 
                className="absolute bottom-6 w-0 h-1.5 rounded-full opacity-0 group-hover:w-16 group-hover:opacity-100 transition-all duration-500"
                style={{ backgroundColor: deepPurple, boxShadow: `0 4px 10px ${deepPurple}66` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}