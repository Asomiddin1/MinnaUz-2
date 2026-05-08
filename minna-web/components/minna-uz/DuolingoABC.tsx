export default function DuolingoABC() {
  return (
    <section className="w-full py-24 px-6 bg-white flex justify-center">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-20">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-[#0213cc] mb-6">
            Minnada ABC
          </h2>
          <p className="text-[17px] text-gray-500 font-medium mb-8">
            Til kelgan joyda savodxonlik bo'ladi! Duolingo ABC yordamida har bir bola o'qish va yozishni o'rganishi mumkin. Ushbu ilova 3 yoshdan 8 yoshgacha bo'lgan bolalar uchun qiziqarli fonetik darslar va qiziqarli hikoyalarni taklif etadi. Va bularning barchasi mutlaqo bepul.
          </p>
          <button className="text-[#0213cc] hover:bg-gray-50 text-[#1cb0f6] font-extrabold text-sm uppercase py-4 px-8 rounded-2xl border-2 border-gray-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all">
            ABC HAQIDA KO'PROQ BILIB OLING
          </button>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-72 h-72 bg-gray-50 rounded-3xl flex items-center justify-center">
             <span className="text-gray-400 font-bold">ABC Bolalar Rasmi</span>
          </div>
        </div>
      </div>
    </section>
  );
}