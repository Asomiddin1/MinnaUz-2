"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { userAPI } from "@/lib/api/user"
import {
  Search,
  Eye,
  Clock,
  ChevronRight,
  Loader2,
  BookX,
} from "lucide-react"

const getLevelStyle = (level: string) => {
  const styles: Record<string, { bg: string; text: string }> = {
    N5: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    N4: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-400" },
    N3: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400" },
    N2: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
    N1: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400" },
  }
  return styles[level] || { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300" }
}

export default function DokkaiListComponent() {
  const [activeLevel, setActiveLevel] = useState("Barchasi")
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true)
      try {
        const levelParam = activeLevel === "Barchasi" ? "" : activeLevel
        const response = await userAPI.getArticles(1, searchQuery, levelParam)

        if (response.data && response.data.data) {
          setArticles(response.data.data)
        }
      } catch (error) {
        console.error("Maqolalarni yuklashda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchArticles()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [activeLevel, searchQuery])

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 pb-10 pt-4 sm:px-6 md:px-8 md:pb-12 md:pt-8 lg:px-10">
      
      {/* Qidiruv va Filtrlar qismi */}
      <div className="mb-6 flex flex-col gap-3 md:mb-10 md:gap-6">
        
        {/* Qidiruv Inputi (Telefonda judayam ixcham) */}
        <div className="group relative w-full md:max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Maqola nomini qidiring..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-[13px] font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 md:rounded-2xl md:py-4 md:pl-14 md:pr-5 md:text-[15px] dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500 md:left-5 md:h-[22px] md:w-[22px]" />
        </div>

        {/* Level Filtrlar (Tugmalar telefonda kichraytirildi) */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1.5 md:gap-3 md:pb-2">
          {["Barchasi", "N5", "N4", "N3", "N2", "N1"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition-all duration-200 md:rounded-xl md:px-6 md:py-2.5 md:text-[15px] ${
                activeLevel === lvl
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Maqolalar Ro'yxati */}
      {isLoading ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 border-dashed bg-white/50 md:min-h-[300px] md:rounded-3xl dark:border-slate-800 dark:bg-slate-900/20">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500 md:h-10 md:w-10" />
          <p className="text-[13px] font-medium text-slate-500 md:text-base">Yuklanmoqda...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 border-dashed bg-white/50 md:min-h-[300px] md:rounded-3xl dark:border-slate-800 dark:bg-slate-900/20">
          <div className="rounded-full bg-slate-100 p-3 md:p-5 dark:bg-slate-800">
            <BookX className="h-6 w-6 text-slate-400 md:h-10 md:w-10" />
          </div>
          <p className="text-[14px] font-medium text-slate-600 md:text-lg dark:text-slate-400">
            Hozircha maqolalar topilmadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2 xl:gap-8">
          {articles.map((art) => {
            const style = getLevelStyle(art.level)

            return (
              <Link href={`/dashboard/dokkai/${art.id}`} key={art.id} className="group block h-full">
                {/* Telefonda doim yonda turadi (flex-row), padding kichik (p-3) */}
                <div className="flex h-full flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 md:gap-6 md:rounded-3xl md:p-6 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-800">
                  
                  {/* Rasm qismi (Telefonda kichik to'rtburchak: h-24 w-24) */}
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28 md:h-36 md:w-36 md:rounded-2xl dark:bg-slate-800">
                    <img
                      src={art.imageUrl || "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500"}
                      alt={art.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Ma'lumot qismi (Shriftlar kichraytirildi) */}
                  <div className="flex flex-1 flex-col justify-between py-0.5 md:py-1">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between md:mb-3">
                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest md:rounded-[10px] md:px-3 md:py-1 md:text-xs ${style.bg} ${style.text}`}>
                          {art.level}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 md:gap-1.5 md:text-xs">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" /> {art.date}
                        </span>
                      </div>
                      {/* Telefonda sarlavha kichikroq (text-[14px]) va qatorlar orasi zichroq (leading-snug) */}
                      <h2 className="line-clamp-2 text-[14px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-indigo-600 sm:text-base md:text-[19px] md:leading-relaxed dark:text-slate-100 dark:group-hover:text-indigo-400">
                        {art.title}
                      </h2>
                    </div>

                    {/* Pastki qism */}
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 md:mt-5 md:pt-4 dark:border-slate-800/60">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 md:gap-2 md:text-sm dark:text-slate-400">
                        <Eye className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" /> {art.views} marta
                      </span>
                      <span className="flex items-center text-[12px] font-bold text-indigo-600 transition-transform group-hover:translate-x-1 md:text-[15px] dark:text-indigo-400">
                        O'qish <ChevronRight className="ml-0.5 h-3 w-3 md:ml-1 md:h-4.5 md:w-4.5" />
                      </span>
                    </div>
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}