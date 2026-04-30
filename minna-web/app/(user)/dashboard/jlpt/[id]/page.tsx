"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X, Check, Clock, Info } from "lucide-react";

export default function SolveTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Endi faqat bitta aktiv bo'limni ushlab turamiz (Desktop va Mobile uchun bir xil)
  const [activeSection, setActiveSection] = useState<string>(""); 
  
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // =====================
  // 🧩 DATA FETCHING
  // =====================
  useEffect(() => {
    const loadTestData = async () => {
      try {
        const [testRes, qRes] = await Promise.all([
          adminAPI.getTestById(Number(testId)),
          adminAPI.getQuestionsByTestId(Number(testId))
        ]);
        
        setTest(testRes.data.data || testRes.data);
        const qData = qRes.data.data || qRes.data || [];
        setQuestions(qData);
        setTimeLeft((testRes.data.time || 105) * 60);

        // Dastlabki bo'limni faol qilish
        if (qData.length > 0) {
          const firstType = qData[0].type;
          setActiveSection(firstType.charAt(0).toUpperCase() + firstType.slice(1));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTestData();
  }, [testId]);

  // =====================
  // ⏱ TIMER LOGIC
  // =====================
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (questionId: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const finishTest = () => {
    if (confirm("Testni yakunlamoqchimisiz?")) {
      localStorage.setItem(`jlpt_result_${testId}`, JSON.stringify(userAnswers));
      router.push(`/dashboard/jlpt/${testId}/result`);
    }
  };

  const exitTest = () => {
    if (confirm("Testdan chiqmoqchimisiz? Barcha natijalar yo'qolishi mumkin.")) {
      router.back();
    }
  };

  const sections = useMemo(() => {
    if (!questions.length) return [];
    const types = Array.from(new Set(questions.map((q) => q.type)));
    
    return types.map((type) => ({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      questions: questions.map((q, idx) => ({ ...q, globalIndex: idx })).filter(q => q.type === type)
    }));
  }, [questions]);

  const formatTimeDesktop = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const formatTimeMobile = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Savolga silliq scroll qilish funksiyasi
  const scrollToQuestion = (sectionTitle: string, questionId: number) => {
    if (activeSection !== sectionTitle) {
      setActiveSection(sectionTitle);
      // Agar boshqa bo'lim bo'lsa, render bo'lishini kutib keyin scroll qilamiz
      setTimeout(() => {
        document.getElementById(`question-${questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } else {
      document.getElementById(`question-${questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">Yuklanmoqda...</div>;
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">Savollar topilmadi.</div>;

  const currentSectionData = sections.find((sec) => sec.title === activeSection);
  const currentSectionIndex = sections.findIndex((sec) => sec.title === activeSection);

  return (
    <>
      {/* ========================================================= */}
      {/* 💻 DESKTOP KO'RINISHi (Scroll qilinadigan ro'yxat) */}
      {/* ========================================================= */}
      <div className="hidden lg:block min-h-screen  text-slate-900 dark:text-slate-200 p-8 font-sans selection:bg-[#5c4cf2]/30">
        <div className="max-w-[1400px] mx-auto flex gap-10 items-start">
          
          {/* CHAP TOMON: MAIN CONTENT (Savollar ro'yxati) */}
          <div className="flex-1 w-full">
            
            {/* TABS (Tepaga yopishib turadigan - sticky) */}
            <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md pt-2 pb-4 mb-6 border-b border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-6">
              {sections.map((sec, idx) => {
                const isActive = activeSection === sec.title;
                return (
                  <button 
                    key={idx}
                    className={`text-lg transition-all ${
                      isActive 
                        ? "bg-[#5c4cf2] text-white dark:bg-slate-200 dark:text-slate-900 px-5 py-1.5 rounded-full font-semibold shadow-sm" 
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1.5"
                    }`}
                    onClick={() => {
                      setActiveSection(sec.title);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {sec.title}
                  </button>
                );
              })}
            </div>

            {/* SAVOLLAR RO'YXATI */}
            <div className="space-y-12 pb-20">
              {currentSectionData?.questions.map((q, qIndex) => {
                const questionNumber = `${currentSectionIndex + 1}.${qIndex + 1}`;
                
                return (
                  <div key={q.id} id={`question-${q.id}`} className="scroll-mt-24">
                    
                    {/* O'qish matni */}
                    {q.text && (
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl text-lg mb-5 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {q.text}
                      </div>
                    )}

                    {/* SAVOL MATNI VA BADGE */}
                    <div className="flex items-start gap-4 mb-6">
                      <span className="bg-[#5c4cf2] text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm shrink-0 mt-0.5">
                        {questionNumber}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {q.question}
                      </h2>
                    </div>

                    {/* VARIANTLAR (Radio button style) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((option: string, idx: number) => {
                        const isSelected = userAnswers[q.id] === option;
                        return (
                          <label
                            key={idx}
                            className={`flex items-center w-full p-4 rounded-xl cursor-pointer transition-all border shadow-sm ${
                              isSelected
                                ? "bg-[#5c4cf2]/10 border-[#5c4cf2] text-slate-900 dark:bg-slate-800/80 dark:border-purple-500 dark:text-white"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 dark:bg-slate-800/40 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={option}
                              checked={isSelected}
                              onChange={() => handleAnswer(q.id, option)}
                              className="hidden"
                            />
                            
                            {/* Radio doiracha */}
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "border-[#5c4cf2]" : "border-slate-300 dark:border-slate-600"
                            }`}>
                              {isSelected && <div className="w-[10px] h-[10px] bg-[#5c4cf2] rounded-full" />}
                            </div>
                            
                            <span className="text-[17px] font-medium">
                              {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* O'NG TOMON: SIDEBAR (Timer va Savollar Palitrasi) */}
          <div className="w-[360px] shrink-0 space-y-6 sticky top-[90px]">
            {/* TIMER CARD */}
            <div className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
              <p className="text-center text-slate-500 dark:text-slate-400 mb-4 font-medium uppercase text-sm tracking-wider">Time Remaining</p>
              <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-3xl tracking-widest py-4 rounded-xl text-center mb-6 border border-slate-100 dark:border-transparent font-bold">
                {formatTimeDesktop(timeLeft)}
              </div>
              
              <Button 
                onClick={finishTest}
                className="w-full bg-[#5c4cf2] hover:bg-[#4b3ed1] text-white h-12 rounded-xl text-base font-semibold shadow-lg shadow-[#5c4cf2]/20"
              >
                Submit Exam
              </Button>
            </div>

            {/* QUESTION PALETTE GRID */}
            <div className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700/50 rounded-2xl p-6 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar shadow-sm">
              {sections.map((sec, sIdx) => (
                <div key={sIdx} className="mb-8 last:mb-0">
                  <h3 className="text-slate-800 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                    {sIdx + 1}. {sec.title}
                  </h3>
                  <div className="grid grid-cols-5 gap-2.5">
                    {sec.questions.map((q, idx) => {
                      const isAnswered = !!userAnswers[q.id];
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => scrollToQuestion(sec.title, q.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            isAnswered
                              ? "bg-[#5c4cf2] text-white shadow-md shadow-[#5c4cf2]/30 dark:bg-slate-200 dark:text-slate-900"
                              : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-transparent dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>


      {/* ========================================================= */}
      {/* 📱 MOBILE KO'RINISHi (Oq fonda - o'zgarmadi) */}
      {/* ========================================================= */}
      <div className="block lg:hidden min-h-screen bg-[#F8F9FB] text-slate-900 font-sans sm:pb-10 pb-20">
        
        <header className="sticky top-0 z-50 bg-white flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={exitTest} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 bg-gray-100/80 px-4 py-1.5 rounded-full text-slate-800 font-medium">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="tracking-wide">{formatTimeMobile(timeLeft)}</span>
          </div>

          <button onClick={finishTest} className="p-2 text-[#5c4cf2] hover:bg-indigo-50 rounded-full transition">
            <Check className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </header>

        <div className="sticky top-[60px] z-40 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
          <div className="flex overflow-x-auto custom-scrollbar flex-1">
            {sections.map((sec) => {
              const isActive = activeSection === sec.title;
              return (
                <button 
                  key={sec.title}
                  onClick={() => setActiveSection(sec.title)}
                  className={`whitespace-nowrap px-6 py-3.5 text-[15px] font-medium transition-all border-b-[3px] ${
                    isActive 
                      ? "border-[#5c4cf2] text-[#5c4cf2]" 
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {sec.title}
                </button>
              );
            })}
          </div>
          <button className="px-4 py-3 border-l border-gray-100 text-[#5c4cf2]">
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-10">
          {currentSectionData?.questions.map((q, qIndex) => {
            const questionNumber = `${currentSectionIndex + 1}.${qIndex + 1}`;
            
            return (
              <div key={q.id} className="space-y-5">
                
                {q.text && (
                  <div className="bg-white p-4 rounded-xl text-lg border border-gray-200 text-gray-700 leading-relaxed shadow-sm">
                    {q.text}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="bg-[#5c4cf2] text-white px-2.5 py-1 rounded-md text-sm font-bold shadow-sm shrink-0 mt-0.5">
                    {questionNumber}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">
                    {q.question}
                  </h2>
                </div>

                <div className="space-y-3 pl-[2px]">
                  {q.options.map((option: string, idx: number) => {
                    const isSelected = userAnswers[q.id] === option;
                    return (
                      <label
                        key={idx}
                        className={`flex items-center w-full p-4 rounded-[16px] cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-[#5c4cf2]/[0.03] border-[#5c4cf2] shadow-[0_0_0_1px_rgba(92,76,242,0.1)]"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleAnswer(q.id, option)}
                          className="hidden"
                        />
                        
                        <div className={`w-6 h-6 rounded-full border-[1.5px] mr-4 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "border-[#5c4cf2]" : "border-gray-300"
                        }`}>
                          {isSelected && <div className="w-[10px] h-[10px] bg-[#5c4cf2] rounded-full" />}
                        </div>
                        
                        <span className={`text-[17px] ${isSelected ? "text-slate-900 font-medium" : "text-slate-700"}`}>
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}