"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
} from "lucide-react";

// ---------- TYPELAR ----------
interface Question {
  id: number;
  mondai_number: number;
  question_number: number;
  type: string;
  question_text: string;
  passage?: string;
  options: string[];
  points: number;
}

interface Section {
  id: number;
  name: string;
  type: string;
  time_limit: number | null;
  questions: Question[];
}

interface Test {
  id: number;
  title: string;
  level: string;
  time: number;
  pass_score: number;
  sections: Section[];
  is_premium?: boolean;
  locked?: boolean;
}

interface UserAnswer {
  question_id: number;
  selected_option: string;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function TestPageOnly() {
  const params = useParams();
  const router = useRouter();
  const testId = Number(params.id);

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSection = test?.sections?.[currentSectionIndex];
  const currentQuestion = currentSection?.questions?.[currentQuestionIndex];
  const totalQuestions =
    test?.sections?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0;
  const answeredCount = answers.length;

  // ========== TESTNI YUKLASH ==========
  const fetchTest = useCallback(async () => {
    if (!testId || isNaN(testId)) return;
    try {
      setLoading(true);
      setError(null);
      const res = await userAPI.getTestDetails(testId);
      const testData = res.data?.data || res.data;
      if (!testData) throw new Error("Test topilmadi");

      if (testData.locked) {
        setError("Bu test faqat premium foydalanuvchilar uchun.");
        return;
      }

      setTest(testData);
      setTimeLeft(testData.time * 60);
    } catch (err: any) {
      console.error("Test yuklashda xatolik:", err);
      const msg =
        err?.response?.data?.message || "Testni yuklab bo‘lmadi";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // ========== TIMER ==========
  useEffect(() => {
    if (!test || loading || error) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [test, loading, error]);

  // ========== NAVIGATION ==========
  const goToNext = () => {
    if (!currentSection) return;
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentSectionIndex < test!.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      const prevSection = test!.sections[currentSectionIndex - 1];
      setCurrentQuestionIndex(prevSection.questions.length - 1);
    }
  };

  // ========== JAVOBLARNI SAQLASH ==========
  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const exists = prev.find((a) => a.question_id === currentQuestion.id);
      if (exists) {
        return prev.map((a) =>
          a.question_id === currentQuestion.id
            ? { ...a, selected_option: value }
            : a
        );
      }
      return [...prev, { question_id: currentQuestion.id, selected_option: value }];
    });
  };

  const currentAnswer =
    answers.find((a) => a.question_id === currentQuestion?.id)?.selected_option || "";

  // ========== TESTNI YUBORISH ==========
  const handleSubmit = async (autoSubmit = false) => {
    if (!test) return;

    if (!autoSubmit) {
      const unanswered = totalQuestions - answeredCount;
      if (unanswered > 0) {
        const ans = window.confirm(
          `${unanswered} ta savolga javob bermadingiz. Haqiqatdan yakunlamoqchimisiz?`
        );
        if (!ans) return;
      }
    }

    setSubmitting(true);
    try {
      const timeSpent = test.time * 60 - timeLeft;
      const res = await userAPI.submitExam(test.id, answers, timeSpent);
      const resultData = res.data?.data || res.data;

      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("Test muvaffaqiyatli yakunlandi!");

      const resultId = resultData?.id || resultData?.result_id;
      // Asosiy yo‘naltirish shu yerda
      router.push(
        resultId
          ? `/dashboard/jlpt/${test.id}/result/${resultId}`
          : "/dashboard/jlpt"
      );
    } catch (err: any) {
      console.error("Natija yuborilmadi:", err);
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  // ========== UI HOLATLAR ==========
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        {error.includes("premium") ? (
          <Lock className="h-12 w-12 text-amber-500" />
        ) : (
          <AlertCircle className="h-12 w-12 text-red-500" />
        )}
        <p className="text-lg font-medium text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/jlpt")}>
          Testlarga qaytish
        </Button>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-600 font-medium">Test topilmadi</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/jlpt")}>
          Testlarga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge className="bg-blue-600">{test.level}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {test.time} daqiqa
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Qolgan vaqt</p>
            <p
              className={`text-xl font-mono font-bold ${
                timeLeft < 60 ? "text-red-600 animate-pulse" : ""
              }`}
            >
              {formatTime(timeLeft)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            <Send className="w-4 h-4 mr-2" /> Yakunlash
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {currentSectionIndex + 1}-bo‘lim, {currentQuestionIndex + 1}/
            {currentSection?.questions.length || 0} savol
          </span>
          <span>
            Jami javob berilgan: {answeredCount}/{totalQuestions}
          </span>
        </div>
        <Progress value={(answeredCount / totalQuestions) * 100} />
      </div>

      {/* Savol */}
      {currentQuestion ? (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mondai {currentQuestion.mondai_number}</span>
            <span>•</span>
            <span>Savol {currentQuestion.question_number}</span>
          </div>

          {currentQuestion.passage && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border whitespace-pre-wrap text-sm leading-relaxed">
              {currentQuestion.passage}
            </div>
          )}

          <h3 className="text-lg font-semibold">{currentQuestion.question_text}</h3>

          <RadioGroup
            value={currentAnswer}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <RadioGroupItem value={opt} id={`opt-${idx}`} />
                <Label
                  htmlFor={`opt-${idx}`}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Oldingi
            </Button>
            <Button
              onClick={goToNext}
              disabled={
                currentSectionIndex === test.sections.length - 1 &&
                currentQuestionIndex === (currentSection?.questions?.length || 1) - 1
              }
            >
              Keyingi <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Savollar topilmadi
        </div>
      )}

      {/* Bo‘lim tanlash tugmalari */}
      {test.sections.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {test.sections.map((sec, idx) => (
            <Button
              key={sec.id}
              variant={idx === currentSectionIndex ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCurrentSectionIndex(idx);
                setCurrentQuestionIndex(0);
              }}
            >
              {sec.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}