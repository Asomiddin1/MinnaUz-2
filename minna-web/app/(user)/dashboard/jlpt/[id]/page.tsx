"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { userAPI } from "@/lib/api/user";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Send,
  Loader2,
  X,
  CheckCheck,
  Menu,
  LayoutList,
  ChevronRight,
  Lock,
  Sparkles,
} from "lucide-react";

// ---------- YORDAMCHI FUNKSIYALAR ----------
const formatTotalTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatPlayerTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// ---------- INTERFACES ----------
interface QuestionOption {
  text?: string | null;
  image?: string | null;
  image_url?: string | null;
}

interface Question {
  id: number;
  mondai_number: number;
  question_number: number;
  type: string;
  question_text: string;
  passage?: string;
  image_url?: string | null;
  options: QuestionOption[];
  correct_answer?: string;
  points?: number;
}

interface Section {
  id: number;
  name: string;
  type: string;
  questions: Question[];
}

interface Test {
  id: number;
  title: string;
  level: string;
  time: number;
  sections: Section[];
  audio_url?: string;
  is_premium?: boolean;
}

// ---------- Rasm URL yasovchi funksiya ----------
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
    : "http://127.0.0.1:8000";
  
  let cleanPath = imagePath;
  if (!cleanPath.includes("storage/")) {
    cleanPath = `storage/${cleanPath}`;
  }
  cleanPath = cleanPath.replace(/^\//, "");
  
  return `${baseUrl}/${cleanPath}`;
};

const getAudioUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
    : "http://127.0.0.1:8000";
  let cleanPath = path.includes("storage/") ? path : `storage/${path}`;
  if (cleanPath.includes("audios") && !cleanPath.includes("audios/")) {
    cleanPath = cleanPath.replace("audios", "audios/");
  }
  return `${baseUrl}/${cleanPath.replace(/^\//, "")}`;
};

// ---------- ASOSIY SAHIFA KOMPONENTI ----------
export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = Number(params.id);

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);
  const [needsPremium, setNeedsPremium] = useState(false);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { question_id: number; selected_option: string }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);

      const res = await userAPI.getTestDetails(testId);
      const data = res.data?.data || res.data;

      // PREMIUM TEKSHIRUVI
      if (data.is_premium) {
        try {
          const userRes = await (userAPI as any).getProfile(); 
          const isPremium = userRes?.data?.is_premium;
          
          if (!isPremium) {
            setNeedsPremium(true); // Oddiy userni premium UI ga yo'naltirish
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("User ma'lumotlarini olishda xatolik yuz berdi.");
          setNeedsPremium(true);
          setLoading(false);
          return;
        }
      }

      // Savollarni formatlash
      if (data?.sections) {
        data.sections = data.sections.map((section: any) => ({
          ...section,
          questions: (section.questions || []).map((question: any) => ({
            ...question,
            image_url: getImageUrl(question.image_url || question.image_path || question.image),
            options: (question.options || []).map((opt: any) => ({
              text: opt.text ?? null,
              image: opt.image ?? null,
              image_url: getImageUrl(opt.image_url || opt.image),
            })),
          })),
        }));
      }

      setTest(data);
      setTimeLeft(data.time * 60);
    } catch (err: any) {
      // Backend 403 (ruxsat yo'q) xatosi qaytarganda ham Premium UI ni chiqaramiz
      if (err?.response?.status === 403 || err?.response?.status === 401) {
         setNeedsPremium(true);
      } else {
         setError("Bunday test topilmadi yoki yuklashda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  }, [testId, router]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // Vaqt hisoblagich
  useEffect(() => {
    if (!test || loading || submitting || !hasStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [test, loading, submitting, hasStarted]);

  useEffect(() => {
    if (timeLeft === 0 && test && hasStarted && !submitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, hasStarted]);

  const handleSubmit = async () => {
    if (submitting) return;

    if (timeLeft > 0) {
      const confirmSubmit = window.confirm("Testni yakunlamoqchimisiz?");
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const timeSpent = test!.time * 60 - timeLeft;
      const response = await userAPI.submitExam(testId, answers, timeSpent);

      const resultId =
        response.data?.result_id || response.data?.id || response.data?.data?.id;

      if (resultId) {
        router.push(`/dashboard/jlpt/${testId}/result/${resultId}`);
      } else {
        router.push(`/dashboard/jlpt`);
      }
    } catch (err: any) {
      console.error("Testni topshirishda xatolik:", err);
      alert(
        "Testni yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."
      );
      setSubmitting(false);
    }
  };

  const currentSection = test?.sections?.[currentSectionIndex];

  const groupedQuestions = useMemo(() => {
    if (!currentSection) return {};
    return currentSection.questions.reduce((acc: any, q: any) => {
      if (!acc[q.mondai_number]) acc[q.mondai_number] = [];
      acc[q.mondai_number].push(q);
      return acc;
    }, {});
  }, [currentSection]);

  const totalQuestions = useMemo(() => {
    if (!test) return 0;
    return test.sections.reduce(
      (total, section) => total + (section.questions?.length || 0),
      0
    );
  }, [test]);

  const handleAnswer = (qId: number, val: string) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.question_id !== qId);
      return [...filtered, { question_id: qId, selected_option: val }];
    });
  };

  const isAnswered = (qId: number) => answers.some((a) => a.question_id === qId);

  const scrollToQuestion = (qId: number) => {
    const element = document.getElementById(`q-${qId}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const renderQuestionNavigator = () => {
    if (!currentSection) return null;
    return (
      <div className="space-y-4">
        <p className="text-[13px] font-bold tracking-wide text-[#5C55C4] uppercase">
          {currentSection.name}
        </p>
        <div className="grid grid-cols-4 gap-2.5 xl:grid-cols-5">
          {currentSection.questions.map((q: any) => {
            const answered = isAnswered(q.id);
            return (
              <button
                key={q.id}
                onClick={() => {
                  scrollToQuestion(q.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`h-9 w-full rounded-[8px] border text-[13px] font-bold shadow-sm transition-all ${
                  answered
                    ? "border-[#5C55C4] bg-[#5C55C4] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#5C55C4] hover:text-[#5C55C4] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {q.mondai_number}.{q.question_number}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white p-10">
        <Skeleton className="h-full w-full" />
      </div>
    );

  // ============================================
  // 🔥 CHIROYLI PREMIUM BLOKI (Premium test bo'lib, user oddiy bo'lsa chiqadi)
  // ============================================
  if (needsPremium) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-[420px] animate-in zoom-in-95 duration-500 rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900">
          
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 shadow-inner">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Premium obuna zarur
          </h2>
          
          <p className="mb-8 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Ushbu test faqat <strong className="text-amber-500">Premium</strong> foydalanuvchilar uchun ochiladi. Barcha testlarni cheklovsiz ishlash uchun hoziroq obuna bo'ling!
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/dashboard/premium")}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[16px] font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] hover:from-amber-600 hover:to-yellow-600"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Premium sotib olish
            </Button>
            
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="h-12 w-full rounded-2xl text-[15px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Orqaga qaytish
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // ============================================

  if (error) return <div className="p-20 text-center text-red-500">{error}</div>;

  if (!test) return <div className="p-20 text-center">Test not found</div>;

  const formattedTime = formatTotalTime(timeLeft);
  const isLastSection = currentSectionIndex === test.sections.length - 1;

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-200">
      
      {/* ===== TEST MODALI ===== */}
      {!hasStarted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[480px] rounded-[24px] bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-bold text-[#5C55C4] dark:text-indigo-400">
                 {test.title}
               </h2>
               {!test.is_premium && (
                 <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm px-3 py-1 text-sm font-semibold">
                   Bepul
                 </Badge>
               )}
            </div>
            
            <div className="space-y-4 text-[16px] text-slate-700 dark:text-slate-300">
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="font-medium text-slate-500">Vaqt:</span>
                <span className="font-bold text-slate-900 dark:text-white">{test.time} daqiqa</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="font-medium text-slate-500">Umumiy savollar:</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalQuestions} ta</span>
              </div>
              
              <div className="pt-2">
                <p className="mb-3 text-sm font-semibold text-slate-400">Bo'limlar kesimida:</p>
                <div className="space-y-2">
                  {test.sections.map((sec) => (
                    <div key={sec.id} className="flex justify-between rounded-lg bg-slate-50 px-4 py-2.5 dark:bg-slate-800/50">
                      <span className="font-medium">{sec.name}</span>
                      <span className="font-semibold text-[#5C55C4] dark:text-indigo-400">
                        {sec.questions?.length || 0} savol
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                className="h-12 w-1/2 rounded-xl border-slate-200 text-base"
                onClick={() => router.back()}
              >
                Orqaga
              </Button>
              <Button
                className="h-12 w-1/2 rounded-xl bg-[#5C55C4] text-base font-bold text-white shadow-md hover:bg-indigo-700"
                onClick={() => setHasStarted(true)}
              >
                Boshlash
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ======================= */}

      {/* MOBILE TOP HEADER */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
        <button
          onClick={() => router.back()}
          className="-ml-2 p-2 text-slate-800 dark:text-slate-200"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-[15px] font-semibold tracking-wide text-slate-800 dark:text-slate-200">
            {formattedTime}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !hasStarted}
          className="-mr-2 p-2 text-[#5C55C4] disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <CheckCheck className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <nav className="sticky top-[60px] z-30 border-b border-slate-100 bg-white lg:top-0 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-[1400px] items-center">
          <div className="no-scrollbar flex flex-1 items-center overflow-x-auto px-2">
            {test.sections.map((sec: any, idx: number) => (
              <button
                key={sec.id}
                onClick={() => {
                  setCurrentSectionIndex(idx);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`border-b-[3px] px-4 py-3.5 text-[15px] font-semibold whitespace-nowrap transition-colors ${
                  currentSectionIndex === idx
                    ? "border-[#5C55C4] text-[#5C55C4] dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex h-full items-center justify-center border-l border-slate-100 px-4 py-[14px] transition-colors dark:border-slate-800 ${
              isSidebarOpen
                ? "bg-indigo-50 text-[#5C55C4] dark:bg-indigo-900/20"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
            } `}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* MOBIL UCHUN SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative flex h-full w-[85%] max-w-[340px] animate-in flex-col bg-white shadow-2xl duration-300 fade-in slide-in-from-right dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <LayoutList className="h-4 w-4 text-[#5C55C4]" /> Navigatsiya
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full bg-slate-50 p-2 text-slate-500 hover:text-slate-800 dark:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-none flex-1 overflow-y-auto p-6">
              {renderQuestionNavigator()}
            </div>
          </div>
        </div>
      )}

      {/* ASOSIY QISM */}
      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-12 lg:px-6">
        {/* CHAP QISM: SAVOLLAR */}
        <div
          className={`${
            isSidebarOpen ? "lg:col-span-8" : "lg:col-span-12"
          } space-y-10 transition-all duration-300`}
        >
          {/* UMUMIY AUDIO PLEYER */}
          {currentSection?.type === "listening" && test.audio_url && (
            <div className="sticky top-[110px] z-20 bg-slate-50/90 backdrop-blur-md lg:top-[80px] dark:bg-slate-950/90">
              <audio
                src={getAudioUrl(test.audio_url)}
                controls
                controlsList="nodownload"
                className="h-12 w-full outline-none"
              />
            </div>
          )}

          {/* Mondai Guruhlari */}
          {Object.entries(groupedQuestions).map(([mondaiNum, qs]: any) => (
            <div
              key={mondaiNum}
              className="animate-in space-y-8 duration-500 fade-in"
            >
              {qs[0]?.passage && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-[15px] leading-relaxed text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <Badge className="mr-3 mb-2 bg-[#5C55C4] px-3 py-1 text-xs text-white hover:bg-indigo-600">
                    Mondai {mondaiNum}
                  </Badge>
                  {qs[0].passage}
                </div>
              )}

              {/* Savollar ro'yxati */}
              <div className="space-y-10">
                {qs.map((q: Question) => (
                  <div
                    key={q.id}
                    id={`q-${q.id}`}
                    className="space-y-4 scroll-mt-[180px]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-[6px] bg-[#5C55C4] px-2.5 py-1 text-[13px] font-semibold text-white">
                        {q.mondai_number}.{q.question_number}
                      </div>
                      <div className="flex-1 space-y-3">
                        <h3 className="text-[17px] leading-relaxed font-medium text-slate-900 dark:text-slate-100">
                          {q.question_text}
                        </h3>

                        {q.image_url && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-gray-50 p-2 dark:border-slate-800 dark:bg-slate-900">
                            <img
                              src={q.image_url}
                              alt="Savol rasmi"
                              className="mx-auto max-h-64 w-auto object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <RadioGroup
                      onValueChange={(val) => handleAnswer(q.id, val)}
                      value={
                        answers.find((a) => a.question_id === q.id)
                          ?.selected_option || ""
                      }
                      className="mt-2 grid grid-cols-1 gap-2.5"
                      disabled={!hasStarted}
                    >
                      {q.options.map((opt: QuestionOption, i: number) => {
                        const optionValue = String(i);
                        const isSelected =
                          answers.find((a) => a.question_id === q.id)
                            ?.selected_option === optionValue;

                        return (
                          <Label
                            key={i}
                            className={`flex cursor-pointer items-center gap-4 rounded-[14px] border p-4 transition-all select-none ${
                              isSelected
                                ? "border-[#5C55C4] bg-[#F8F8FF] text-[#5C55C4] dark:bg-indigo-500/10 dark:text-indigo-300"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
                            }`}
                          >
                            <RadioGroupItem
                              value={optionValue}
                              className="sr-only"
                            />
                            <div
                              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                                isSelected
                                  ? "border-[#5C55C4]"
                                  : "border-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {isSelected && (
                                <div className="h-[12px] w-[12px] rounded-full bg-[#5C55C4]" />
                              )}
                            </div>

                            <div className="flex flex-1 items-center gap-3">
                              {opt.image_url && (
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900">
                                  <img
                                    src={opt.image_url}
                                    alt={`Variant ${i + 1}`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}

                              {opt.text && (
                                <span className="text-[16px] leading-tight font-normal">
                                  {opt.text}
                                </span>
                              )}

                              {!opt.text && !opt.image_url && (
                                <span className="text-[16px] leading-tight font-normal italic text-slate-400">
                                  (bo'sh variant)
                                </span>
                              )}
                            </div>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </div>
                ))}
              </div>
              <hr className="mt-8 border-slate-200 dark:border-slate-800/50" />
            </div>
          ))}

          {/* KEYINGI BO'LIMGA O'TISH YOKI YAKUNLASH */}
          <div className="animate-in pt-6 pb-12 duration-500 fade-in">
            {!isLastSection ? (
              <Button
                onClick={() => {
                  setCurrentSectionIndex((prev) => prev + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={!hasStarted}
                className="w-full rounded-2xl border border-indigo-100 bg-indigo-50 py-7 text-[16px] font-bold text-[#5C55C4] transition-all hover:bg-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
              >
                Keyingi bo'lim: {test.sections[currentSectionIndex + 1]?.name}{" "}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !hasStarted}
                className="w-full rounded-2xl bg-[#5C55C4] py-7 text-[16px] font-bold text-white shadow-md hover:bg-indigo-700"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Testni yakunlash"
                )}{" "}
                <CheckCheck className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* O'NG QISM: DESKTOP SIDEBAR */}
        {isSidebarOpen && (
          <div className="hidden transition-all duration-300 lg:col-span-4 lg:block">
            <div className="sticky top-[100px] animate-in space-y-6 fade-in slide-in-from-right-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-3 text-center text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  Qolgan Vaqt
                </p>
                <div className="mb-6 text-center font-mono text-[40px] leading-none font-black text-slate-800 dark:text-slate-100">
                  {formattedTime}
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !hasStarted}
                    className="h-[52px] w-full rounded-[12px] bg-[#5C55C4] font-bold text-white shadow-md hover:bg-indigo-700"
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    Testni yakunlash
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h4 className="mb-6 flex items-center text-sm font-bold text-slate-800 dark:text-slate-200">
                  <LayoutList className="mr-2 h-4 w-4 text-[#5C55C4]" /> Joriy
                  bo'lim savollari
                </h4>
                <div className="scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 max-h-[55vh] overflow-y-auto pr-3">
                  {renderQuestionNavigator()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}