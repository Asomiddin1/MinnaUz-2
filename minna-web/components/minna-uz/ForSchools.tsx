export default function ForSchools() {
  return (
    <section className="w-full flex justify-center py-24 px-6 bg-white">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-20">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-64 h-64 bg-blue-50 rounded-3xl flex items-center justify-center border-2 border-gray-200">
             <span className="text-blue-400 font-bold">Maktab Rasmi</span>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0213cc] mb-6">
            Maktablar uchun minna
          </h2>
          <p className="text-lg text-gray-500 font-medium mb-8">
          O'qituvchilar uchun o'quvchilarning o'zlashtirishini kuzatishga yordam beradigan va darslarni qiziqarliroq qiladigan bepul vosita.</p>
          <button className="text-[#0213cc] hover:bg-gray-100 text-[#1cb0f6] font-bold py-3.5 px-8 rounded-2xl border-2 border-gray-200 border-b-4 active:border-b-2 active:translate-y-[2px] uppercase transition-all">
          O'qituvchilar uchun ma'lumot
          </button>
        </div>
      </div>
    </section>
  );
}