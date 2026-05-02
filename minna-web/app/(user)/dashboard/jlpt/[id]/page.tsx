"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  AlertCircle,
  Send,
  Save,
  ChevronRight,
  Volume2,
} from "lucide-react";

// ---------- YORDAMCHI FUNKSIYALAR ----------
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return {
    h: h.toString().padStart(2, "0"),
    m: m.toString().padStart(2, "0"),
    s: s.toString().padStart(2, "0")
  };
};

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = Number(params.id);

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: number; selected_option: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio URL generatsiyasi
  const getAudioUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
      : "http://127.0.0.1:8000";
    let cleanPath = path.includes('storage/') ? path : `storage/${path}`;
    if (cleanPath.includes('audios') && !cleanPath.includes('audios/')) {
        cleanPath = cleanPath.replace('audios', 'audios/');
    }
    return `${baseUrl}/${cleanPath.replace(/^\//, '')}`;
  };

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userAPI.getTestDetails(testId);
      const data = res.data?.data || res.data;
      setTest(data);
      setTimeLeft(data.time * 60);
    } catch (err: any) {
      setError("Test yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => { fetchTest(); }, [fetchTest]);

  useEffect(() => {
    if (!test || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [test, loading]);

  // Savollarni Mondai bo'yicha guruhlash
  const currentSection = test?.sections?.[currentSectionIndex];
  const groupedQuestions = useMemo(() => {
    if (!currentSection) return {};
    return currentSection.questions.reduce((acc: any, q: any) => {
      if (!acc[q.mondai_number]) acc[q.mondai_number] = [];
      acc[q.mondai_number].push(q);
      return acc;
    }, {});
  }, [currentSection]);

  const handleAnswer = (qId: number, val: string) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.question_id !== qId);
      return [...filtered, { question_id: qId, selected_option: val }];
    });
  };

  const isAnswered = (qId: number) => answers.some(a => a.question_id === qId);

  if (loading) return <div className="min-h-screen bg-white dark:bg-slate-950 p-10"><Skeleton className="h-full w-full" /></div>;
  if (error) return <div className="text-center p-20">{error}</div>;

  const time = formatTime(timeLeft);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. TOP NAVIGATION (TABS) */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center h-16 gap-6">
          {test.sections.map((sec: any, idx: number) => (
            <button
              key={sec.id}
              onClick={() => setCurrentSectionIndex(idx)}
              className={`text-sm font-bold transition-all relative h-full px-4 ${
                currentSectionIndex === idx 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              {sec.name}
              {currentSectionIndex === idx && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. LEFT: QUESTIONS AREA */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Audio Player (Choukai) */}
          {currentSection?.type === "listening" && test.audio_url && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl p-6 sticky top-20 z-10 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">Listening Section Audio</h3>
              </div>
              <audio src={getAudioUrl(test.audio_url)} controls className="w-full h-12 dark:invert-[0.9] dark:hue-rotate-180" />
            </div>
          )}

          {/* Mondai Groups */}
          {Object.entries(groupedQuestions).map(([mondaiNum, qs]: any) => (
            <div key={mondaiNum} className="space-y-6 animate-in fade-in duration-500">
              {/* Mondai Header - Rasmda ko'rsatilgan uslubda */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white mb-3 px-3 py-1">Mondai {mondaiNum}</Badge>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {qs[0]?.passage || "Quyidagi savollar uchun eng to'g'ri javobni tanlang."}
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-8 pl-2">
                {qs.map((q: any) => (
                  <div key={q.id} id={`q-${q.id}`} className="space-y-5">
                    <div className="flex gap-3 items-start">
                      <span className="text-indigo-600 dark:text-indigo-500 font-mono font-bold text-lg">{q.mondai_number}.{q.question_number}</span>
                      <h3 className="text-lg font-semibold leading-snug">{q.question_text}</h3>
                    </div>

                    <RadioGroup 
                      onValueChange={(val) => handleAnswer(q.id, val)}
                      value={answers.find(a => a.question_id === q.id)?.selected_option}
                      className="grid grid-cols-1 gap-3 ml-8"
                    >
                      {q.options.map((opt: string, i: number) => (
                        <Label
                          key={i}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                            answers.find(a => a.question_id === q.id)?.selected_option === opt
                              ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-100"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <RadioGroupItem value={opt} className="sr-only" />
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                               answers.find(a => a.question_id === q.id)?.selected_option === opt
                               ? "border-indigo-600 bg-indigo-600 text-white"
                               : "border-slate-300 dark:border-slate-600 text-slate-500"
                          }`}>
                            {i + 1}
                          </div>
                          <span className="text-[15px] font-medium">{opt}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
              <hr className="border-slate-200 dark:border-slate-800 mt-10" />
            </div>
          ))}
        </div>

        {/* 3. RIGHT: SIDEBAR NAVIGATION */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            
            {/* Timer & Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-center mb-4 font-bold">Time Remaining</p>
              <div className="flex justify-center items-center gap-2 font-mono text-4xl font-black mb-8">
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100">{time.h}</div>
                <span className="text-indigo-500 animate-pulse">:</span>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100">{time.m}</div>
                <span className="text-indigo-500 animate-pulse">:</span>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400">{time.s}</div>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                  <Send className="w-4 h-4 mr-2" /> Submit Exam
                </Button>
                <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 h-12 rounded-xl font-bold">
                  <Save className="w-4 h-4 mr-2" /> Save Progress
                </Button>
              </div>
            </div>

            {/* Question Map */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-6 flex items-center">
                <ChevronRight className="w-4 h-4 mr-1 text-indigo-500" /> Question Navigator
              </h4>
              
              <div className="h-[350px] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {test.sections.map((sec: any) => (
                  <div key={sec.id}>
                    <p className="text-[10px] font-bold text-slate-400 mb-3 px-1">{sec.name}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {sec.questions.map((q: any, idx: number) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`h-10 w-10 rounded-lg text-xs font-bold transition-all border ${
                            isAnswered(q.id)
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}