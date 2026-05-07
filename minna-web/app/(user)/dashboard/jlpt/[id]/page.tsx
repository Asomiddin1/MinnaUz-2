"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { userAPI } from "@/lib/api/user"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Clock,
  Send,
  Save,
  Loader2,
  X,
  CheckCheck,
  Menu,
  LayoutList,
  ChevronRight,
} from "lucide-react"

// ---------- YORDAMCHI FUNKSIYALAR ----------
const formatTotalTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

// Pleyer vaqti uchun (27:16 kabi)
const formatPlayerTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ---------- MAXSUS AUDIO PLEYER (To'g'rilangan) ----------
const CustomAudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause()
      else audioRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  // VAAQTNI ORQAGA/OLDINGA SURISH FUNKSIYASI (To'g'rilangan)
  const skipTime = (amount: number) => {
    if (audioRef.current) {
      let newTime = audioRef.current.currentTime + amount

      // Vaqt noldan pastga tushib ketmasligini ta'minlash
      if (newTime < 0) newTime = 0
      // Vaqt umumiy uzunlikdan oshib ketmasligini ta'minlash
      if (newTime > audioRef.current.duration)
        newTime = audioRef.current.duration

      audioRef.current.currentTime = newTime
      setCurrentTime(newTime) // Vizual o'zgarish darhol sezilishi uchun
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Progress foizini hisoblash
  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="flex w-full items-center gap-4 rounded-[6px] border border-slate-200  px-4 py-3 dark:border-slate-800 "
      onContextMenu={(e) => e.preventDefault()}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        controlsList="nodownload noplaybackrate"
        className="hidden"
      />

      {/* Orqaga 10s */}
      <button
        type="button"
        onClick={() => skipTime(-10)}
        className="relative flex items-center justify-center text-[#555] transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11a9 9 0 0 1 9-9 9.5 9.5 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        <span className="absolute mt-[2px] text-[8px] font-bold">10</span>
      </button>

      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlayPause}
        className="flex h-8 w-8 items-center justify-center text-[#222] transition-colors hover:text-black dark:text-slate-200 dark:hover:text-white"
      >
        {isPlaying ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Oldinga 10s */}
      <button
        type="button"
        onClick={() => skipTime(10)}
        className="relative flex items-center justify-center text-[#555] transition-colors hover:text-black dark:text-slate-400 dark:hover:text-white"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11a9 9 0 0 0-9-9 9.5 9.5 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span className="absolute mt-[2px] text-[8px] font-bold">10</span>
      </button>

      {/* Progress Track */}
      <div className="group relative mx-2 flex h-[5px] flex-1 items-center rounded-full bg-[#CFCFCF] dark:bg-slate-700">
        <div
          className="pointer-events-none absolute left-0 h-full rounded-full bg-[#333] dark:bg-slate-300"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="pointer-events-none absolute h-[14px] w-[14px] rounded-full bg-[#333] transition-all dark:bg-slate-300"
          style={{ left: `calc(${progressPercent}% - 7px)` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            if (audioRef.current) {
              audioRef.current.currentTime = Number(e.target.value)
              setCurrentTime(Number(e.target.value))
            }
          }}
          className="absolute h-full w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Vaqt */}
      <span className="min-w-[40px] text-right text-[14px] font-medium tracking-wide text-[#111] dark:text-slate-300">
        {duration ? formatPlayerTime(duration) : "0:00"}
      </span>
    </div>
  )
}

// ---------- ASOSIY SAHIFA KOMPONENTI ----------
export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = Number(params.id)

  const [test, setTest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<
    { question_id: number; selected_option: string }[]
  >([])
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true)
    }
  }, [])

  const getAudioUrl = (path: string) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
      : "http://127.0.0.1:8000"
    let cleanPath = path.includes("storage/") ? path : `storage/${path}`
    if (cleanPath.includes("audios") && !cleanPath.includes("audios/")) {
      cleanPath = cleanPath.replace("audios", "audios/")
    }
    return `${baseUrl}/${cleanPath.replace(/^\//, "")}`
  }

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true)
      const res = await userAPI.getTestDetails(testId)
      const data = res.data?.data || res.data
      setTest(data)
      setTimeLeft(data.time * 60)
    } catch (err: any) {
      setError("Test yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [testId])

  useEffect(() => {
    fetchTest()
  }, [fetchTest])

  useEffect(() => {
    if (!test || loading || submitting) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [test, loading, submitting])

  useEffect(() => {
    if (timeLeft === 0 && test && !submitting) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const handleSubmit = async () => {
    if (submitting) return

    if (timeLeft > 0) {
      const confirmSubmit = window.confirm("Testni yakunlamoqchimisiz?")
      if (!confirmSubmit) return
    }

    try {
      setSubmitting(true)
      const timeSpent = test.time * 60 - timeLeft
      const response = await userAPI.submitExam(testId, answers, timeSpent)

      const resultId =
        response.data?.result_id || response.data?.id || response.data?.data?.id

      if (resultId) {
        router.push(`/dashboard/jlpt/${testId}/result/${resultId}`)
      } else {
        router.push(`/dashboard/jlpt`)
      }
    } catch (err: any) {
      console.error("Testni topshirishda xatolik:", err)
      alert(
        "Testni yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."
      )
      setSubmitting(false)
    }
  }

  const currentSection = test?.sections?.[currentSectionIndex]

  const groupedQuestions = useMemo(() => {
    if (!currentSection) return {}
    return currentSection.questions.reduce((acc: any, q: any) => {
      if (!acc[q.mondai_number]) acc[q.mondai_number] = []
      acc[q.mondai_number].push(q)
      return acc
    }, {})
  }, [currentSection])

  const handleAnswer = (qId: number, val: string) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.question_id !== qId)
      return [...filtered, { question_id: qId, selected_option: val }]
    })
  }

  const isAnswered = (qId: number) => answers.some((a) => a.question_id === qId)

  const scrollToQuestion = (qId: number) => {
    const element = document.getElementById(`q-${qId}`)
    if (element) {
      const offset = 180
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const renderQuestionNavigator = () => {
    if (!currentSection) return null
    return (
      <div className="space-y-4">
        <p className="text-[13px] font-bold tracking-wide text-[#5C55C4] uppercase">
          {currentSection.name}
        </p>
        <div className="grid grid-cols-4 gap-2.5 xl:grid-cols-5">
          {currentSection.questions.map((q: any) => {
            const answered = isAnswered(q.id)
            return (
              <button
                key={q.id}
                onClick={() => {
                  scrollToQuestion(q.id)
                  if (window.innerWidth < 1024) setIsSidebarOpen(false)
                }}
                className={`h-9 w-full rounded-[8px] border text-[13px] font-bold shadow-sm transition-all ${
                  answered
                    ? "border-[#5C55C4] bg-[#5C55C4] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#5C55C4] hover:text-[#5C55C4] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {q.mondai_number}.{q.question_number}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading)
    return (
      <div className="min-h-screen bg-white p-10">
        <Skeleton className="h-full w-full" />
      </div>
    )
  if (error) return <div className="p-20 text-center text-red-500">{error}</div>

  const formattedTime = formatTotalTime(timeLeft)
  const isLastSection = currentSectionIndex === test.sections.length - 1

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-200">
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
          disabled={submitting}
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
                  setCurrentSectionIndex(idx)
                  window.scrollTo({ top: 0, behavior: "smooth" })
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
            className={`flex h-full items-center justify-center border-l border-slate-100 px-4 py-[14px] transition-colors dark:border-slate-800 ${isSidebarOpen ? "bg-indigo-50 text-[#5C55C4] dark:bg-indigo-900/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"} `}
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
          className={`${isSidebarOpen ? "lg:col-span-8" : "lg:col-span-12"} space-y-10 transition-all duration-300`}
        >
          {/* BIZ YASAGAN MAXSUS AUDIO PLEYER */}
          {currentSection?.type === "listening" && test.audio_url && (
            <div className="sticky top-[110px] z-20 bg-slate-50/90  backdrop-blur-md lg:top-[80px] dark:bg-slate-950/90">
              <audio
                src={getAudioUrl(test.audio_url)}
                controls
                controlsList="nodownload" // Yuklab olish tugmasini yashirishga harakat qiladi (hamma brauzerda ham ishlamaydi)
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
                {qs.map((q: any) => (
                  <div key={q.id} id={`q-${q.id}`} className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-[6px] bg-[#5C55C4] px-2.5 py-1 text-[13px] font-semibold text-white">
                        {q.mondai_number}.{q.question_number}
                      </div>
                      <h3 className="text-[17px] leading-relaxed font-medium text-slate-900 dark:text-slate-100">
                        {q.question_text}
                      </h3>
                    </div>

                    <RadioGroup
                      onValueChange={(val) => handleAnswer(q.id, val)}
                      value={
                        answers.find((a) => a.question_id === q.id)
                          ?.selected_option
                      }
                      className="mt-2 grid grid-cols-1 gap-2.5"
                    >
                      {q.options.map((opt: string, i: number) => {
                        const isSelected =
                          answers.find((a) => a.question_id === q.id)
                            ?.selected_option === opt
                        return (
                          <Label
                            key={i}
                            className={`flex cursor-pointer items-center gap-4 rounded-[14px] border p-4 transition-all select-none ${
                              isSelected
                                ? "border-[#5C55C4] bg-[#F8F8FF] text-[#5C55C4] dark:bg-indigo-500/10 dark:text-indigo-300"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
                            }`}
                          >
                            <RadioGroupItem value={opt} className="sr-only" />
                            <div
                              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${isSelected ? "border-[#5C55C4]" : "border-slate-300 dark:border-slate-600"}`}
                            >
                              {isSelected && (
                                <div className="h-[12px] w-[12px] rounded-full bg-[#5C55C4]" />
                              )}
                            </div>
                            <span className="text-[16px] leading-tight font-normal">
                              {opt}
                            </span>
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>
                ))}
              </div>
              <hr className="mt-8 border-slate-200 dark:border-slate-800/50" />
            </div>
          ))}

          {/* KEYINGI BO'LIMGA O'TISH YOKI YAKUNLASH TUGMASI */}
          <div className="animate-in pt-6 pb-12 duration-500 fade-in">
            {!isLastSection ? (
              <Button
                onClick={() => {
                  setCurrentSectionIndex((prev) => prev + 1)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="w-full rounded-2xl border border-indigo-100 bg-indigo-50 py-7 text-[16px] font-bold text-[#5C55C4] transition-all hover:bg-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
              >
                Keyingi bo'lim: {test.sections[currentSectionIndex + 1]?.name}{" "}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
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
                    disabled={submitting}
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
  )
}
