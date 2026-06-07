"use client"
import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { userAPI } from "@/lib/api/user"
import {
  ArrowLeft,
  Play,
  Volume2,
  Settings,
  Eye,
  Plus,
  BookOpen,
  ALargeSmall,
  SplitSquareHorizontal,
  Loader2,
  CheckCircle2,
  XCircle,
  BrainCircuit,
} from "lucide-react"

// 1. Interaktiv so'z komponenti
const InteractiveWord = ({
  item,
  showFurigana,
  addSpace,
}: {
  item: any
  showFurigana: boolean
  addSpace: boolean
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  // 3 SONIYADA AVTOMAT YOPISH LOGIKASI
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showTooltip) {
      timer = setTimeout(() => {
        setShowTooltip(false)
      }, 3000)
    }
    return () => clearTimeout(timer)
  }, [showTooltip])

  if (!item.translation) {
    return (
      <span className="text-lg leading-[2.5] text-gray-800 md:text-xl dark:text-gray-200">
        {item.word}
        {addSpace && item.word !== "。" && item.word !== "、" ? "\u00A0" : ""}
      </span>
    )
  }

  return (
    <span
      className={`relative inline-block cursor-pointer ${addSpace ? "mr-1.5" : "mx-[2px]"}`}
    >
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg border bg-white p-3 text-left text-sm shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-1 font-bold text-blue-600 dark:text-blue-400">
            {item.word} {item.furigana && `(${item.furigana})`}
          </p>
          <p className="mb-1 text-gray-700 dark:text-gray-300">
            {item.translation}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400 dark:bg-gray-700">
              {item.grammar}
            </span>
            {item.level && (
              <span className="rounded bg-[#3B704E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {item.level}
              </span>
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      )}

      <ruby
        className={`rounded px-0.5 text-lg leading-[2.5] transition-colors hover:bg-blue-100 md:text-xl dark:hover:bg-blue-900/30 ${showTooltip ? "bg-blue-100 dark:bg-blue-900/50" : ""}`}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {item.word}
        {showFurigana && item.furigana && (
          <rt className="text-xs text-gray-500">{item.furigana}</rt>
        )}
        {!showFurigana && item.furigana && (
          <rt className="text-xs text-transparent opacity-0">_</rt>
        )}
      </ruby>
    </span>
  )
}

// 2. Asosiy Sahifa
export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)

  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFurigana, setShowFurigana] = useState(true)
  const [addSpace, setAddSpace] = useState(false)

  // Lug'at <-> Test almashtirish
  const [activeSection, setActiveSection] = useState<"vocab" | "quiz">("vocab")

  // Test javoblari uchun state: { quizId: optionId }
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({})
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await userAPI.getArticleById(resolvedParams.id)
        if (response.data && response.data.data) {
          setArticle(response.data.data)
        }
      } catch (error) {
        console.error("Maqolani yuklashda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [resolvedParams.id])

  // Test variantini tanlash
  const handleOptionSelect = (quizId: number, optionId: number) => {
    if (isQuizSubmitted) return
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: optionId }))
  }

  // Test natijalarini saqlash va tekshirish
  const handleQuizSubmit = async () => {
    const total = article.quizzes?.length ?? 0
    if (Object.keys(selectedAnswers).length < total) {
      return alert("Iltimos, barcha savollarga javob bering.")
    }

    setIsQuizSubmitted(true)

    try {
      const answersArray = Object.entries(selectedAnswers).map(
        ([quizId, optionId]) => ({ quizId: Number(quizId), optionId })
      )

      await userAPI.submitArticleQuiz(resolvedParams.id, {
        answers: answersArray,
      })
    } catch (error) {
      console.error("Test yuborishda xatolik:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
        <h1 className="mb-4 text-2xl font-bold dark:text-white">
          Maqola topilmadi 😕
        </h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          Orqaga qaytish
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl pb-20">
        <div className="p-4 md:p-6">
          <button
            onClick={() => router.back()}
            className="mb-6 flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Ortga qaytish
          </button>

          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
            {article.title}
          </h1>

          <div className="mb-6 flex items-center justify-between border-b pb-4 dark:border-gray-800">
            <span className="rounded bg-[#3B704E] px-2 py-0.5 text-xs font-bold text-white">
              {article.level}
            </span>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {article.views}
              </span>
              <span>{article.date}</span>
            </div>
          </div>

          <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 md:aspect-[21/9] dark:bg-gray-800">
            <img
              src={
                article.imageUrl ||
                "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1000"
              }
              alt="Article cover"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mb-6 flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-800/50">
            <button className="rounded-full bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200">
              <Play className="ml-0.5 h-5 w-5" />
            </button>
            <div className="mx-4 h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-full w-1/3 bg-blue-500"></div>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <span className="text-xs font-medium">0:00 / 1:12</span>
              <Volume2 className="h-4 w-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
              <Settings className="h-4 w-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <h3 className="mr-auto text-sm font-bold text-gray-700 dark:text-gray-300">
              O'qishni sozlash:
            </h3>

            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                showFurigana
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              <ALargeSmall className="h-4 w-4" /> Furigana
              <div
                className={`ml-2 h-4 w-8 rounded-full p-0.5 transition-colors ${showFurigana ? "bg-blue-500" : "bg-gray-400"}`}
              >
                <div
                  className={`h-3 w-3 rounded-full bg-white transition-transform ${showFurigana ? "translate-x-4" : "translate-x-0"}`}
                ></div>
              </div>
            </button>

            <button
              onClick={() => setAddSpace(!addSpace)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                addSpace
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              <SplitSquareHorizontal className="h-4 w-4" /> So'z oralig'i
              <div
                className={`ml-2 h-4 w-8 rounded-full p-0.5 transition-colors ${addSpace ? "bg-green-500" : "bg-gray-400"}`}
              >
                <div
                  className={`h-3 w-3 rounded-full bg-white transition-transform ${addSpace ? "translate-x-4" : "translate-x-0"}`}
                ></div>
              </div>
            </button>
          </div>

          <div className="mb-8 border-b pb-8 dark:border-gray-800">
            <div className="flex flex-wrap items-end rounded-xl border bg-gray-50/50 p-4 md:p-6 dark:border-gray-800 dark:bg-gray-800/20">
              {article.content?.map((item: any, index: number) => (
                <InteractiveWord
                  key={index}
                  item={item}
                  showFurigana={showFurigana}
                  addSpace={addSpace}
                />
              ))}
            </div>
          </div>

          {article.stats && article.stats.length > 0 && (
            <div className="mb-12 flex flex-wrap items-center justify-between gap-y-4 rounded-xl border bg-white p-4 shadow-sm md:p-6 dark:border-gray-700 dark:bg-gray-800">
              {article.stats.map((stat: any, idx: number) => (
                <div key={idx} className="flex min-w-[80px] items-center gap-3">
                  <span
                    className={`rounded-md px-2.5 py-1 text-sm font-bold text-white ${stat.color || "bg-gray-500"}`}
                  >
                    {stat.level}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {stat.percent}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* LUG'AT / TEST ALMASHTIRGICH */}
          {((article.vocabulary?.length ?? 0) > 0 ||
            (article.quizzes?.length ?? 0) > 0) && (
            <div>
              {/* Toggle tugmalar */}
              <div className="mb-6 flex gap-2 border-b dark:border-gray-800">
                {article.vocabulary?.length > 0 && (
                  <button
                    onClick={() => setActiveSection("vocab")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors ${
                      activeSection === "vocab"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" /> Vocabulary (Lug'at)
                  </button>
                )}
                {article.quizzes?.length > 0 && (
                  <button
                    onClick={() => setActiveSection("quiz")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors ${
                      activeSection === "quiz"
                        ? "border-b-2 border-indigo-600 text-indigo-600"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                  >
                    <BrainCircuit className="h-4 w-4" /> Test
                  </button>
                )}
              </div>

              {/* LUG'AT */}
              {activeSection === "vocab" && article.vocabulary?.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {article.vocabulary.map((vocab: any) => (
                    <div
                      key={vocab.id}
                      className="flex flex-col rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="mb-0.5 text-xs text-gray-500">
                            {vocab.furigana || " "}
                          </span>
                          <span className="text-lg font-bold dark:text-white">
                            {vocab.kanji}
                          </span>
                        </div>
                        <span className="rounded bg-[#3B704E] px-2 py-0.5 text-xs font-bold text-white">
                          {vocab.level}
                        </span>
                      </div>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {vocab.meaning}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TEST (QUIZ) */}
              {activeSection === "quiz" && article.quizzes?.length > 0 && (
                <div className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 p-6 dark:border-indigo-900/50 dark:bg-indigo-900/10">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-500 p-2 text-white shadow-lg">
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Matnni tushunish testi
                      </h3>
                      <p className="text-sm text-gray-500">
                        Matnni qanchalik yaxshi tushunganingizni tekshiring.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {article.quizzes.map((quiz: any, index: number) => (
                      <div
                        key={quiz.id}
                        className="rounded-xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                      >
                        <h4 className="mb-4 text-base font-medium text-gray-800 dark:text-gray-200">
                          <span className="mr-2 text-indigo-500">
                            {index + 1}.
                          </span>{" "}
                          {quiz.question}
                        </h4>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {quiz.options.map((option: any) => {
                            const isSelected =
                              selectedAnswers[quiz.id] === option.id
                            let optionStyle =
                              "border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800"

                            if (isSelected && !isQuizSubmitted) {
                              optionStyle =
                                "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                            } else if (isQuizSubmitted) {
                              if (option.isCorrect) {
                                optionStyle =
                                  "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              } else if (isSelected && !option.isCorrect) {
                                optionStyle =
                                  "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              } else {
                                optionStyle =
                                  "border-gray-200 bg-gray-50 text-gray-400 opacity-60 dark:border-gray-700 dark:bg-gray-900"
                              }
                            }

                            return (
                              <button
                                key={option.id}
                                onClick={() =>
                                  handleOptionSelect(quiz.id, option.id)
                                }
                                disabled={isQuizSubmitted}
                                className={`flex items-center justify-between rounded-lg border-2 p-3 text-left transition-all ${optionStyle}`}
                              >
                                <span className="text-sm font-medium">
                                  {option.text}
                                </span>

                                {isQuizSubmitted && option.isCorrect && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                                {isQuizSubmitted &&
                                  isSelected &&
                                  !option.isCorrect && (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )}
                              </button>
                            )
                          })}
                        </div>
                        {isQuizSubmitted && quiz.explanation && (
                          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <span className="font-bold">Izoh: </span>{" "}
                            {quiz.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!isQuizSubmitted && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleQuizSubmit}
                        className="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
                      >
                        Natijani tekshirish
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
