export default function Footer() {
  return (
    // overflow-hidden eng muhimi: bu ulkan yozuvning pastki yarmini kesib tashlaydi
    <footer className="relative w-full bg-[#f4f7f9] pt-20 overflow-hidden flex flex-col font-sans">
      
      {/* 4 Ustunli Menyu qismi */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-6 mb-32">
        
        {/* 1-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">Ma'lumot</h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Minna.Uz haqida</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Missiya</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Ommaviy oferta<br />(Foydalanish shartlari)</li>
          </ul>
        </div>

        {/* 2-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">O'rganing</h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Kurslar</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Samaradorlik</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Ommaviy oferta</li>
          </ul>
        </div>

        {/* 3-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">Mahsulotlar</h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Minna.Uz</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Maktablar uchun</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Ishlab chiquvchilar uchun</li>
          </ul>
        </div>

        {/* 4-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">Yordam</h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Qo'llab-quvvatlash markazi</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Maxfiylik va xavfsizlik</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">Hisob</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">To'lovlar</li>
          </ul>
        </div>

      </div>

      {/* Eng pastki qism: Yarim kesilgan yozuv va Copyright */}
      <div className="relative w-full flex justify-center items-end h-32 md:h-48 mt-10">
        
        {/* Copyright matni (Ulkan yozuvning ustida turishi uchun z-20 berildi) */}
        <div className="absolute bottom-6 md:bottom-10 z-20 text-center w-full px-4">
          <p className="text-black text-[15px] md:text-[17px] font-medium">
            © 2026 Minna.Uz <span className="mx-2 md:mx-4 font-light text-gray-400">|</span> 
            Maxfiylik shartlari <span className="mx-2 md:mx-4 font-light text-gray-400">|</span> 
            Til: O'zbek
          </p>
        </div>

        {/* Yarim kesilgan ulkan yozuv (translate-y-[38%] bilan pastga surildi) */}
        <h1 className="absolute bottom-0 z-70 text-[25vw] font-black text-[#0832579d] leading-none tracking-tighter uppercase select-none translate-y-[30%] text-center w-full whitespace-nowrap">
          MINNA 
        </h1>
        
      </div>
      
    </footer>
  );
}