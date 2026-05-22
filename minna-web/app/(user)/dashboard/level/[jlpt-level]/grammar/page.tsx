"use client"

import { useEffect, useState, use } from "react"
import BackButton from "@/components/back-button"
import { userAPI } from "@/lib/api/user"
import { 
  Languages, 
  Info, 
  MessageCircle, 
  ArrowRight, 
  Loader2, 
  Search, 
  Globe 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  params: Promise<{
    "jlpt-level": string
  }>
}

// =====================
// TYPES (Ko'p tilli)
// =====================
type LocaleFields = {
  jp: string
  uz: string
  en: string
  ru: string
}

// Example ikki xil formatda kelishi mumkin
type ExampleItem = {
  id?: string | number
  jp: string
  translation: string
}

type ExamplesBackend = {
  jp?: ExampleItem[] | string[]
  uz?: ExampleItem[] | string[]
  en?: ExampleItem[] | string[]
  ru?: ExampleItem[] | string[]
}

interface Grammar {
  id: number
  title: LocaleFields
  meaning: LocaleFields | null
  description: LocaleFields | null
  examples: ExamplesBackend | null
}

const LOCALES = ["jp", "uz", "en", "ru"] as const
type Locale = (typeof LOCALES)[number]

const LOCALE_CONFIG: Record<Locale, { flag: string; label: string; short: string }> = {
  jp: { flag: "🇯🇵", label: "日本語", short: "JP" },
  uz: { flag: "🇺🇿", label: "O'zbekcha", short: "UZ" },
  en: { flag: "🇬🇧", label: "English", short: "EN" },
  ru: { flag: "🇷🇺", label: "Русский", short: "RU" },
}

export default function GrammarPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const levelSlug = resolvedParams["jlpt-level"].toLowerCase()

  const [grammars, setGrammars] = useState<Grammar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedLocale, setSelectedLocale] = useState<Locale>("uz")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchGrammars = async () => {
      try {
        const res = await userAPI.getLevelGrammars(levelSlug)
        const fetchedGrammars = res.data?.data || res.data || []
        console.log("Fetched grammars:", fetchedGrammars) // Debug uchun
        setGrammars(fetchedGrammars)
      } catch (err) {
        console.error("Grammatikalarni yuklashda xatolik:", err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrammars()
  }, [levelSlug])

  // Localized qiymat olish
  const getLocalized = (obj: LocaleFields | null | undefined, locale: Locale): string => {
    if (!obj) return ""
    return obj[locale] || ""
  }

  // Examples soni - HAR IKKI FORMATNI HAM QO'LLAB-QUVVATLAYDI
  const getExampleCount = (examples: ExamplesBackend | null, locale: Locale): number => {
    if (!examples) return 0
    
    const localeExamples = examples[locale]
    if (!localeExamples || !Array.isArray(localeExamples)) return 0
    
    return localeExamples.length
  }

  // Examples olish - HAR IKKI FORMATNI HAM QO'LLAB-QUVVATLAYDI
  const getExamples = (examples: ExamplesBackend | null, locale: Locale): { jp: string; translation: string }[] => {
    if (!examples) return []
    
    const localeExamples = examples[locale]
    if (!localeExamples || !Array.isArray(localeExamples) || localeExamples.length === 0) {
      return []
    }

    // Yangi format: [{ id, jp, translation }] - ExampleItem[]
    if (typeof localeExamples[0] === 'object' && localeExamples[0] !== null) {
      return (localeExamples as ExampleItem[]).map(ex => ({
        jp: ex.jp || "",
        translation: ex.translation || ""
      }))
    }

    // Eski format: string[]
    if (typeof localeExamples[0] === 'string') {
      const jpExamples = examples.jp || []
      
      // Agar jp ham string[] bo'lsa
      if (jpExamples.length > 0 && typeof jpExamples[0] === 'string') {
        return (localeExamples as string[]).map((translation, index) => ({
          jp: (jpExamples as string[])[index] || "",
          translation: translation
        }))
      }
      
      // Agar jp ExampleItem[] bo'lsa, lekin locale string[] bo'lsa
      if (jpExamples.length > 0 && typeof jpExamples[0] === 'object') {
        return (jpExamples as ExampleItem[]).map((ex, index) => ({
          jp: ex.jp || "",
          translation: (localeExamples as string[])[index] || ex.translation || ""
        }))
      }
      
      // Faqat translation string[] bo'lsa (jp yo'q)
      return (localeExamples as string[]).map(translation => ({
        jp: "",
        translation: translation
      }))
    }

    return []
  }

  // Qidiruv bo'yicha filterlash
  const filteredGrammars = grammars.filter((g) => {
    const query = searchQuery.toLowerCase()
    const titleText = getLocalized(g.title, selectedLocale).toLowerCase()
    const meaningText = getLocalized(g.meaning, selectedLocale).toLowerCase()
    const descText = getLocalized(g.description, selectedLocale).toLowerCase()
    const jpTitle = (g.title?.jp || "").toLowerCase()
    const jpMeaning = (g.meaning?.jp || "").toLowerCase()

    // Misollar ichidan ham qidirish
    const examples = getExamples(g.examples, selectedLocale)
    const exampleMatch = examples.some(ex => 
      ex.jp.toLowerCase().includes(query) || 
      ex.translation.toLowerCase().includes(query)
    )

    return (
      titleText.includes(query) ||
      meaningText.includes(query) ||
      descText.includes(query) ||
      jpTitle.includes(query) ||
      jpMeaning.includes(query) ||
      exampleMatch
    )
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <p className="text-red-500 font-medium">Ma'lumotlarni yuklashda xatolik yuz berdi!</p>
      </div>
    )
  }

  // Mavjud tillarni aniqlash
  const availableLocales = LOCALES.filter((locale) =>
    grammars.some(
      (g) =>
        getLocalized(g.title, locale) ||
        getLocalized(g.meaning, locale) ||
        getExampleCount(g.examples, locale) > 0
    )
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <BackButton />

        <div className="mt-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <Languages className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 uppercase dark:text-white">
                {levelSlug === "hira-kata" ? "HIRA-KATA" : levelSlug} Grammatikasi
              </h1>
              <p className="mt-1 text-slate-500 font-medium">
                Ushbu daraja uchun barcha grammatika qoidalari va namunalar
              </p>
            </div>
          </div>

          {/* TIL TANLASH */}
          {availableLocales.length > 1 && (
            <div className="mt-6 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Ko'rish tili:</span>
              <div className="flex gap-1">
                {availableLocales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => setSelectedLocale(locale)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLocale === locale
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    {LOCALE_CONFIG[locale].flag} {LOCALE_CONFIG[locale].short}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QIDIRUV MAYDONI */}
        {grammars.length > 0 && (
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={`Qidirish (${LOCALE_CONFIG[selectedLocale].label} yoki yaponcha)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/20 transition-all"
            />
          </div>
        )}

        {/* GRAMMATIKALAR RO'YXATI */}
        {grammars.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-500">Hozircha bu daraja uchun grammatikalar qo'shilmagan.</p>
          </div>
        ) : filteredGrammars.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-500">Qidiruv bo'yicha natija topilmadi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGrammars.map((grammar, index) => {
              const localizedTitle = getLocalized(grammar.title, selectedLocale)
              const localizedMeaning = getLocalized(grammar.meaning, selectedLocale)
              const localizedDescription = getLocalized(grammar.description, selectedLocale)
              const localizedExamples = getExamples(grammar.examples, selectedLocale)
              const jpTitle = getLocalized(grammar.title, "jp")
              const exampleCount = getExampleCount(grammar.examples, selectedLocale)

              const displayTitle = localizedTitle || jpTitle || "(bo'sh)"
              const displayMeaning = localizedMeaning || getLocalized(grammar.meaning, "jp") || ""

              return (
                <div
                  key={grammar.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all duration-200"
                >
                  {/* HEADER */}
                  <div className="bg-white p-6 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {index + 1}
                      </span>
                      <div>
                        {jpTitle && jpTitle !== displayTitle && (
                          <p className="text-sm text-slate-400 font-medium mb-0.5">
                            {jpTitle}
                          </p>
                        )}
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                          {displayTitle}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-14 md:ml-0">
                      {displayMeaning && (
                        <div className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {displayMeaning}
                        </div>
                      )}

                      {exampleCount > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {exampleCount} ta misol
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
                    {localizedDescription && (
                      <div className="mb-8 flex gap-3 text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <Info className="h-6 w-6 shrink-0 text-blue-500" />
                        <p className="text-[15px] leading-relaxed">{localizedDescription}</p>
                      </div>
                    )}

                    {localizedExamples.length > 0 && (
                      <div>
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                          <MessageCircle className="h-4 w-4" />
                          Namunalar ({LOCALE_CONFIG[selectedLocale].label})
                        </h3>
                        <div className="grid gap-3">
                          {localizedExamples.map((example, i) => (
                            <div
                              key={i}
                              className="group flex gap-4 rounded-2xl bg-white border border-slate-100 p-4 transition-colors hover:border-blue-200 dark:bg-slate-800/40 dark:border-slate-800/60 dark:hover:border-blue-900/50 shadow-sm"
                            >
                              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors" />
                              <div className="flex-1">
                                {example.jp && (
                                  <p className="text-[17px] font-medium text-slate-900 dark:text-white">
                                    {example.jp}
                                  </p>
                                )}
                                {example.translation && (
                                  <p className={`text-[15px] text-slate-500 dark:text-slate-400 ${example.jp ? "mt-1" : ""}`}>
                                    {example.translation}
                                  </p>
                                )}
                              </div>
                              {selectedLocale !== "jp" && example.jp && example.translation && (
                                <Badge variant="outline" className="shrink-0 text-[10px] mt-0.5">
                                  JP → {LOCALE_CONFIG[selectedLocale].short}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {localizedExamples.length === 0 && (
                      <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {LOCALE_CONFIG[selectedLocale].label} tilida misollar mavjud emas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}