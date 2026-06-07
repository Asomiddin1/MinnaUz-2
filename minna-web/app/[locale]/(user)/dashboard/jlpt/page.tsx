"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { userAPI } from "@/lib/api/user"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Clock,
  BookOpen,
  AlertCircle,
  History,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lock,
} from "lucide-react"

interface Test {
  id: number
  title: string
  level: string
  time: number
  pass_score: number
  is_premium: boolean
  sections_count?: number
}

interface ExamResultSummary {
  id: number
  test_id: number
  test_title: string
  level: string
  score: number
  passed: boolean
  created_at: string
}

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"]

export default function JlptPage() {
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>("N5")
  const [results, setResults] = useState<ExamResultSummary[]>([])
  const [isFetchingResults, setIsFetchingResults] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isCheckingPremium, setIsCheckingPremium] = useState(true)

  // 🔥 Backenddan premium statusni tekshirish
  const checkPremiumStatus = async () => {
    try {
      setIsCheckingPremium(true)
      const response = await userAPI.getProfile()
      const userData = response.data.user || response.data
      setIsPremium(userData.is_premium || false)
    } catch (err) {
      console.error("Premium status tekshirishda xato:", err)
      // Agar xato bo'lsa, session dan o'qib ko'ramiz
      try {
        const session = await import("next-auth/react").then((m) =>
          m.getSession()
        )
        setIsPremium((session?.user as any)?.is_premium || false)
      } catch {
        setIsPremium(false)
      }
    } finally {
      setIsCheckingPremium(false)
    }
  }

  const fetchTests = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await userAPI.getTests()

      const responseData = res.data?.data || res.data
      const testsList = responseData?.data || responseData
      const allTests = Array.isArray(testsList) ? testsList : []

      const filteredTests = allTests.filter(
        (test) => test.level === selectedLevel
      )

      const sortedTests = filteredTests.sort((a, b) => {
        if (a.is_premium === b.is_premium) return 0
        return a.is_premium ? 1 : -1
      })

      setTests(sortedTests)
    } catch (err: any) {
      console.error("Testlarni yuklashda xato:", err)
      setError("Testlarni yuklab bo'lmadi")
      toast.error("Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    try {
      setIsFetchingResults(true)
      const res = await userAPI.getMyResults()
      setResults(res.data || res.data?.data || [])
    } catch (err) {
      console.error("Natijalarni olishda xatolik:", err)
    } finally {
      setIsFetchingResults(false)
    }
  }

  useEffect(() => {
    checkPremiumStatus() // Sahifa yuklanganda premium statusni tekshirish
    fetchResults()
  }, [])

  useEffect(() => {
    fetchTests()
  }, [selectedLevel])

  const handleTestClick = (test: Test) => {
    // Premium status tekshirilayotgan bo'lsa, kutish
    if (isCheckingPremium) {
      toast.info("Iltimos, biroz kuting...")
      return
    }

    // Agar test premium bo'lsa va foydalanuvchi premium emas bo'lsa
    if (test.is_premium && !isPremium) {
      router.push("/dashboard/premium")
      toast.info("Bu test faqat premium foydalanuvchilar uchun")
    } else {
      router.push(`/dashboard/jlpt/${test.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      {/* Sarlavha va Navbar ko'rinishidagi daraja tugmalari */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
  
  {/* Title */}
  <div className="space-y-1">
    <h1 className="text-3xl font-bold tracking-tight">
      JLPT Testlar
    </h1>

    <p className="text-sm text-muted-foreground">
      O'z darajangizga mos testni tanlang
    </p>
  </div>

  {/* Level Selector */}
  <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-2 shadow-sm">
    
    {JLPT_LEVELS.map((level) => (
      <Button
        key={level}
        variant="ghost"
        onClick={() => setSelectedLevel(level)}
        className={`
          h-9  min-w-[64px] rounded-xl px-5 text-sm font-medium
          transition-all duration-200
          
          ${
            selectedLevel === level
              ? "bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-white dark:text-black"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }
        `}
      >
        {level}
      </Button>
    ))}
  </div>
</div>

      {/* Asosiy kontent: Testlar (chap) + History (o'ng) */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ===================== */}
        {/* CHAP TOMON - TESTLAR (2 qatorli grid) */}
        {/* ===================== */}
        <div className="min-w-0 flex-1">
          {/* Yuklanmoqda */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-2 h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Xatolik */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
              <p className="font-medium text-red-600">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchTests()}
                className="mt-4"
              >
                Qayta urinish
              </Button>
            </div>
          )}

          {/* Bo'sh ro'yxat */}
          {!loading && !error && tests.length === 0 && (
            <div className="rounded-xl border border-dashed bg-gray-50 py-16 text-center dark:bg-gray-900">
              <p className="text-lg text-muted-foreground">
                Hozircha testlar mavjud emas
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedLevel} darajasida test topilmadi yoki hali qo'shilmagan
              </p>
            </div>
          )}

          {!loading && !error && tests.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {tests.map((test) => (
                <Card
                  key={test.id}
                  className={`relative cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${test.is_premium && !isPremium ? "opacity-90" : ""} `}
                  onClick={() => handleTestClick(test)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={test.is_premium ? "default" : "outline"}
                        className={
                          test.is_premium
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                            : ""
                        }
                      >
                        {test.is_premium ? "Premium" : "Bepul"}
                      </Badge>

                      <Badge className="bg-indigo-500 text-white">
                        {test.level}
                      </Badge>
                    </div>

                    <CardTitle className="mt-3 line-clamp-2 text-xl">
                      {test.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{test.time} daqiqa</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>O'tish ball: {test.pass_score}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Bo'limlar:</span>
                      <span>{test.sections_count ?? 3} ta</span>
                    </div>
                  </CardContent>

                  {/* Premium lock icon */}
                  {test.is_premium && !isPremium && !isCheckingPremium && (
                    <div className="pointer-events-none absolute right-4 bottom-4">
                      <div className="rounded-full border border-amber-500/20 bg-amber-500/10 p-2 backdrop-blur-sm">
                        <Lock className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ===================== */}
        {/* O'NG TOMON - HISTORY (Test yechganlar tarixi) */}
        {/* ===================== */}
        <div className="w-full shrink-0 lg:w-96">
          <div className="sticky top-24 rounded-[28px] border border-slate-50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <History className="h-5 w-5 text-[#8B5CF6]" />
                O'tgan test natijalari
              </h2>
              <button
                onClick={fetchResults}
                disabled={isFetchingResults}
                className="text-sm text-[#8B5CF6] hover:underline disabled:opacity-50"
              >
                {isFetchingResults ? "Yuklanmoqda..." : "Yangilash"}
              </button>
            </div>

            {results.length === 0 && !isFetchingResults ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                <History className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>Hali birorta test ishlanmagan.</p>
              </div>
            ) : (
              <div className="custom-scrollbar max-h-[600px] space-y-3 overflow-y-auto pr-1">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                    onClick={() =>
                      (window.location.href = `/dashboard/jlpt/${result.test_id}/result/${result.id}`)
                    }
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${result.passed ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
                        {result.passed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {result.test_title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 dark:bg-slate-700">
                            {result.level}
                          </span>
                          <span>
                            {new Date(result.created_at).toLocaleDateString(
                              "uz-UZ"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`text-sm font-bold ${result.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {result.score}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
