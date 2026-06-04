"use client"
import React, { useState, useEffect, use } from "react"
import { useRouter, usePathname } from "next/navigation"
import { userAPI } from "@/lib/api/user" // <-- API ulangan joy
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
  Loader2, // <-- Yuklanish animatsiyasi uchun
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
      }, 3000) // 3000 millisekund = 3 soniya
    }
    // Komponent unmount bo'lsa yoki qayta ishlaganda taymerni tozalash
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
  const pathname = usePathname()
  const resolvedParams = use(params)

  // State'lar
  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFurigana, setShowFurigana] = useState(true)
  const [addSpace, setAddSpace] = useState(false)

  // API dan ma'lumotni olish
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

  // Yuklanayotgan holat
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    )
  }

  // Topilmagan holat
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
          {/* Orqaga qaytish */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Ortga qaytish
          </button>

          {/* Sarlavha va statistika */}
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

          {/* Rasm */}
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

          {/* Audio Player */}
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

          {/* <div className="mb-8 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <BookOpen className="h-4 w-4" /> Bilingual Translation
            </button>
            <button className="flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              <Plus className="h-4 w-4" /> Add Translation
            </button>
          </div> */}

          {/* Sozlamalar */}
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
              <ALargeSmall className="h-4 w-4" />
              Furigana
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
              <SplitSquareHorizontal className="h-4 w-4" />
              So'z oralig'i
              <div
                className={`ml-2 h-4 w-8 rounded-full p-0.5 transition-colors ${addSpace ? "bg-green-500" : "bg-gray-400"}`}
              >
                <div
                  className={`h-3 w-3 rounded-full bg-white transition-transform ${addSpace ? "translate-x-4" : "translate-x-0"}`}
                ></div>
              </div>
            </button>
          </div>

          {/* MATN */}
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

          {/* Statistika (Grammatika darajasi) */}
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

          {/* LUG'AT */}
          {article.vocabulary && article.vocabulary.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Vocabulary (Lug'at)
                </h3>
              </div>
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
                      <span
                        className={`rounded bg-[#3B704E] px-2 py-0.5 text-xs font-bold text-white`}
                      >
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
