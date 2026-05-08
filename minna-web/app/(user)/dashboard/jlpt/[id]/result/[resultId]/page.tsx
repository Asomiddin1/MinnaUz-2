"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userAPI } from "@/lib/api/user";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  AlertTriangle,
  RotateCcw,
  Home,
  Award,
  Download,
  Clock,
} from "lucide-react";
import ScoreBreakdown from "@/components/user-components/jlpt/ResultCard";
import Certificate from "@/components/user-components/jlpt/Certificate";
import QuestionReview from "@/components/user-components/jlpt/QuestionReview";

// ---------- TYPELAR ----------
interface AnswerDetail {
  question_id: number;
  question_text: string;
  passage?: string | null;
  options: any[];
  type: string;
  audio_url?: string | null;
  image_url?: string | null;
  selected_option: string | null;
  correct_option: string;
  is_correct: boolean;
  points: number;
}

interface TestResultData {
  id: number;
  test_id: number;
  test_title: string;
  level: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_points: number;
  earned_points: number;
  jlpt_score: number;
  score_percentage: number;
  passed: boolean;
  time_spent: number;
  answers: AnswerDetail[];
  created_at: string;
}

const formatTimeSpent = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getPassingScore = (level: string): number => {
  const normalizedLevel = level?.toUpperCase() || "";
  switch (normalizedLevel) {
    case "N1": return 100;
    case "N2": return 90;
    case "N3": return 95;
    case "N4": return 90;
    case "N5": return 80;
    default: return 90;
  }
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();

  const testId = (params?.id || params?.testId) as string;
  const resultId = params?.resultId as string;

  const [result, setResult] = useState<TestResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (!testId || !resultId) return;

    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getTestResult(Number(resultId));
        const data = res.data?.data || res.data;
        if (!data) throw new Error("Natija topilmadi");
        setResult(data);
      } catch (err: any) {
        console.error("Natija yuklashda xatolik:", err);
        toast.error(err?.response?.data?.message || "Natija yuklanmadi");
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId, resultId]);

  const handleDownloadCertificate = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Natijalar hisoblanmoqda...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <p className="text-slate-600 font-medium">Natija topilmadi yoki xatolik yuz berdi</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/jlpt")}>
          Testlarga qaytish
        </Button>
      </div>
    );
  }

  const date = new Date(result.created_at || Date.now()).toLocaleDateString(
    "uz-UZ",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const totalPoints = result.total_points || result.answers.reduce((sum, a) => sum + (a.points || 0), 0);
  const earnedPoints = result.earned_points || result.answers.reduce((sum, a) => sum + (a.is_correct ? (a.points || 0) : 0), 0);
  const jlptScore = result.jlpt_score || (totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 180) : 0);
  const passingScore = getPassingScore(result.level);

  // BO'LIMLAR BO'YICHA BALLARNI HISOBLASH
  const getSectionScore = (type: string) => {
    const sectionAnswers = result.answers.filter((a) => a.type === type);
    const earned = sectionAnswers.reduce((sum, a) => sum + (a.is_correct ? (a.points || 0) : 0), 0);
    // Agar o'sha bo'limda umuman savol bo'lmasa, max ballni 60 deb olamiz (JLPT standarti)
    const total = sectionAnswers.reduce((sum, a) => sum + (a.points || 0), 0) || 60; 
    return { earned, total };
  };

  const vocabScore = getSectionScore("vocabulary");
  const grammarReadingScore = getSectionScore("grammar_reading");
  const listeningScore = getSectionScore("listening");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/jlpt")} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Testlarga qaytish
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" /> Vaqt: {formatTimeSpent(result.time_spent || 0)}
          </div>
        </div>

        {/* SCORE CARD */}
        <Card className="p-8 rounded-3xl border-none shadow-lg relative bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-center md:text-left">
              <Badge
                className={`mb-4 ${
                  result.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                } border-none px-3 py-1 text-sm`}
              >
                {result.passed ? "Tabriklaymiz, testdan o'tdingiz!" : "Afsuski, yetarli ball to'play olmadingiz"}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-2">
                {result.score_percentage}%
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Umumiy natija</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {jlptScore} / 180 ball (JLPT)
              </p>
            </div>

            <div className="flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl min-w-[90px]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{result.correct_count}</span>
                <span className="text-xs font-medium uppercase">To'g'ri</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl min-w-[90px]">
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-2xl font-bold text-red-700 dark:text-red-400">{result.wrong_count}</span>
                <span className="text-xs font-medium uppercase">Noto'g'ri</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl min-w-[90px]">
                <AlertTriangle className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">{result.unanswered_count}</span>
                <span className="text-xs font-medium uppercase">Bo'sh</span>
              </div>
            </div>
          </div>
          <Trophy className={`absolute -right-10 -bottom-10 w-64 h-64 opacity-5 ${result.passed ? "text-emerald-500" : "text-slate-400"}`} />
        </Card>

        {/* BALL TAQSIMOTI */}
        <ScoreBreakdown
          earnedPoints={earnedPoints}
          totalPoints={totalPoints}
          correctCount={result.correct_count}
          wrongCount={result.wrong_count}
          unansweredCount={result.unanswered_count}
          totalQuestions={result.total_questions}
          passingScore={passingScore} 
        />

        {/* SERTIFIKAT TUGMALARI (HAR DOIM KO'RINADI) */}
        <div className="flex justify-center gap-4 print:hidden">
          <Button variant="outline" onClick={() => setShowCertificate(!showCertificate)} className="gap-2">
            <Award className="w-4 h-4" />
            {showCertificate ? "Sertifikatni yashirish" : "Sertifikatni ko'rish"}
          </Button>
          {showCertificate && (
            <Button onClick={handleDownloadCertificate} className="gap-2">
              <Download className="w-4 h-4" /> Yuklab olish
            </Button>
          )}
        </div>

        {/* SERTIFIKAT */}
        {showCertificate && (
          <div id="certificate-print">
            <Certificate
              userName="Foydalanuvchi"
              testTitle={result.test_title}
              level={result.level}
              score={result.score_percentage}
              totalQuestions={result.total_questions}
              correctCount={result.correct_count}
              earnedPoints={earnedPoints}
              totalPoints={totalPoints}
              date={date}
              certificateId={`MINNAUZ-${String(result.id).padStart(6, "0")}`}
              isPassed={result.passed}
              vocabEarned={vocabScore.earned}
              vocabTotal={vocabScore.total}
              grammarReadingEarned={grammarReadingScore.earned}
              grammarReadingTotal={grammarReadingScore.total}
              listeningEarned={listeningScore.earned}
              listeningTotal={listeningScore.total}
            />
          </div>
        )}

        {/* SAVOLLAR TAHLILI */}
        <QuestionReview answers={result.answers} />

        {/* PASTKI TUGMALAR */}
        <div className="flex justify-center gap-4 py-8 print:hidden">
          <Button variant="outline" size="lg" onClick={() => router.push(`/dashboard/jlpt/${testId}`)} className="rounded-full px-8">
            <RotateCcw className="w-4 h-4 mr-2" /> Qaytadan ishlash
          </Button>
          <Button size="lg" onClick={() => router.push("/dashboard/jlpt")} className="rounded-full px-8 bg-slate-800 text-white hover:bg-slate-900">
            <Home className="w-4 h-4 mr-2" /> Bosh sahifaga
          </Button>
        </div>

      </div>
    </div>
  );
}