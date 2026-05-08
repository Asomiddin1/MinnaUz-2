export default function EnglishTest() {
  return (
    <section className="w-full py-24 px-6 bg-white flex justify-center">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-20">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-[#0213cc] mb-6">
            Minnadan Yapon tili testi
          </h2>
          <p className="text-[17px] text-gray-500 font-medium mb-8">
            Sun'iy intellekt va tilni baholash sohasidagi so'nggi tadqiqotlarga asoslangan qulay, tezkor va arzon yapon tilini bilish testini taqdim etamiz. Endi har kim o'zi uchun qulay muhitda va qulay vaqtda ishonchli test topshirishi mumkin.
          </p>
          <button className="text-[#0213cc] hover:bg-gray-50 text-[#1cb0f6] font-extrabold text-sm uppercase py-4 px-8 rounded-2xl border-2 border-gray-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all">
            SERTIFIKAT OLING
          </button>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-72 h-72 bg-gray-50 rounded-3xl flex items-center justify-center">
             <span className="text-gray-400 font-bold">Test Rasmi</span>
          </div>
        </div>
      </div>
    </section>
  );
}