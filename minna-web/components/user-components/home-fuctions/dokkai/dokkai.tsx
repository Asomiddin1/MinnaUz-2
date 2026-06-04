"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { userAPI } from "@/lib/api/user" // O'zingizning to'g'ri API yo'lingizni ko'rsating
import {
  Search,
  Eye,
  Clock,
  ChevronRight,
  Loader2,
  BookOpen, // Yuklanayotganda aylanadigan ikonka
} from "lucide-react"

// Darajalar uchun chegaralar rangini belgilash
const levelColors: Record<string, string> = {
  N5: "border-emerald-500 text-emerald-600",
  N4: "border-blue-500 text-blue-600",
  N3: "border-purple-500 text-purple-600",
  N2: "border-amber-500 text-amber-600",
  N1: "border-red-500 text-red-600",
}

export default function DokkaiListComponent() {
  const [activeLevel, setActiveLevel] = useState("Barchasi")
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // API dan ma'lumotlarni tortib olish
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true)
      try {
        const levelParam = activeLevel === "Barchasi" ? "" : activeLevel
        const response = await userAPI.getArticles(1, searchQuery, levelParam)

        // Laravel paginate qilingan resource 'data' obyektida keladi
        if (response.data && response.data.data) {
          setArticles(response.data.data)
        }
      } catch (error) {
        console.error("Maqolalarni yuklashda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Qidiruvda har bir harf bosilganda so'rov ketmasligi uchun 500ms kutamiz (Debounce)
    const delayDebounceFn = setTimeout(() => {
      fetchArticles()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [activeLevel, searchQuery])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl p-4 md:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="group relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Matn qidirish..."
              className="w-full rounded-2xl border-2 border-slate-100 bg-white py-3 pr-4 pl-12 shadow-sm transition-all outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
            />
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500" />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-6">
          {["Barchasi", "N5", "N4", "N3", "N2", "N1"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`rounded-xl border-2 px-6 py-2 text-sm font-bold transition-all ${
                activeLevel === lvl
                  ? "scale-105 border-slate-900 bg-slate-900 text-white shadow-lg dark:border-amber-500 dark:bg-amber-500"
                  : "border-slate-100 bg-white text-slate-600 hover:border-amber-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-500">
            <BookOpen className="mb-4 h-12 w-12 opacity-20" />
            <p>Hozircha maqolalar topilmadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {articles.map((art) => {
              const accentColor = levelColors[art.level] || "border-slate-500"

              return (
                <Link href={`/dashboard/dokkai/${art.id}`} key={art.id}>
                  <div
                    className={`group flex cursor-pointer gap-5 rounded-[2rem] border-b-4 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-800 ${accentColor.split(" ")[0]}`}
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl shadow-inner md:h-32 md:w-32">
                      <img
                        src={
                          art.imageUrl ||
                          "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300"
                        }
                        alt={art.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase dark:bg-slate-700 ${accentColor.split(" ")[1]}`}
                          >
                            {art.level}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="h-3 w-3" /> {art.date}
                          </span>
                        </div>
                        <h2 className="line-clamp-2 text-lg leading-snug font-bold text-slate-800 transition-colors group-hover:text-amber-500 dark:text-white">
                          {art.title}
                        </h2>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Eye className="h-3.5 w-3.5" /> {art.views} marta
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-amber-500 group-hover:text-white dark:bg-slate-700">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
