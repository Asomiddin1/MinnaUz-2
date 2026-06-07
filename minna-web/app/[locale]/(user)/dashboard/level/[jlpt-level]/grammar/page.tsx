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
  Globe,
  FileText,
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

type FormulaFields = {
  affirmative: string
  negative: string
  past: string
  te_form: string
  description: LocaleFields
}

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
  formula?: FormulaFields | null
  meaning: LocaleFields | null
  description: LocaleFields | null
  examples: ExamplesBackend | null
}

const LOCALES = ["jp", "uz", "en", "ru"] as const
type Locale = (typeof LOCALES)[number]

const LOCALE_CONFIG: Record<
  Locale,
  { flag: string; label: string; short: string }
> = {
  jp: { flag: "🇯🇵", label: "日本語", short: "JP" },
  uz: { flag: "🇺🇿", label: "O'zbekcha", short: "UZ" },
  en: { flag: "🇬🇧", label: "English", short: "EN" },
  ru: { flag: "🇷🇺", label: "Русский", short: "RU" },
}

// Yangi qatorlarni <br/> ga o'zgartiruvchi funksiya
const formatTextWithLineBreaks = (text: string) => {
  if (!text) return null

  // \n ni <br/> ga o'zgartirish
  const parts = text.split(/\r?\n|\r|\n/g)

  if (parts.length <= 1) return text

  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 && <br />}
    </span>
  ))
}

export default function GrammarPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const levelSlug = resolvedParams["jlpt-level"].toLowerCase()

  const [grammars, setGrammars] = useState<Grammar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedLocale, setSelectedLocale] = useState<Locale>("uz")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFormula, setShowFormula] = useState(true) // Formula ko'rsatish toggle

  useEffect(() => {
    const fetchGrammars = async () => {
      try {
        const res = await userAPI.getLevelGrammars(levelSlug)
        const fetchedGrammars = res.data?.data || res.data || []
        console.log("Fetched grammars:", fetchedGrammars)
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

  const getLocalized = (
    obj: LocaleFields | null | undefined,
    locale: Locale
  ): string => {
    if (!obj) return ""
    return obj[locale] || ""
  }

  const getExampleCount = (
    examples: ExamplesBackend | null,
    locale: Locale
  ): number => {
    if (!examples) return 0

    const localeExamples = examples[locale]
    if (!localeExamples || !Array.isArray(localeExamples)) return 0

    return localeExamples.length
  }

  const getExamples = (
    examples: ExamplesBackend | null,
    locale: Locale
  ): { jp: string; translation: string }[] => {
    if (!examples) return []

    const localeExamples = examples[locale]
    if (
      !localeExamples ||
      !Array.isArray(localeExamples) ||
      localeExamples.length === 0
    ) {
      return []
    }

    if (typeof localeExamples[0] === "object" && localeExamples[0] !== null) {
      return (localeExamples as ExampleItem[]).map((ex) => ({
        jp: ex.jp || "",
        translation: ex.translation || "",
      }))
    }

    if (typeof localeExamples[0] === "string") {
      const jpExamples = examples.jp || []

      if (jpExamples.length > 0 && typeof jpExamples[0] === "string") {
        return (localeExamples as string[]).map((translation, index) => ({
          jp: (jpExamples as string[])[index] || "",
          translation: translation,
        }))
      }

      if (jpExamples.length > 0 && typeof jpExamples[0] === "object") {
        return (jpExamples as ExampleItem[]).map((ex, index) => ({
          jp: ex.jp || "",
          translation:
            (localeExamples as string[])[index] || ex.translation || "",
        }))
      }

      return (localeExamples as string[]).map((translation) => ({
        jp: "",
        translation: translation,
      }))
    }

    return []
  }

  const filteredGrammars = grammars.filter((g) => {
    const query = searchQuery.toLowerCase()
    const titleText = getLocalized(g.title, selectedLocale).toLowerCase()
    const meaningText = getLocalized(g.meaning, selectedLocale).toLowerCase()
    const descText = getLocalized(g.description, selectedLocale).toLowerCase()
    const jpTitle = (g.title?.jp || "").toLowerCase()

    const examples = getExamples(g.examples, selectedLocale)
    const exampleMatch = examples.some(
      (ex) =>
        ex.jp.toLowerCase().includes(query) ||
        ex.translation.toLowerCase().includes(query)
    )

    return (
      titleText.includes(query) ||
      meaningText.includes(query) ||
      descText.includes(query) ||
      jpTitle.includes(query) ||
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
        <p className="font-medium text-red-500">
          Ma'lumotlarni yuklashda xatolik yuz berdi!
        </p>
      </div>
    )
  }

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
                {levelSlug === "hira-kata" ? "HIRA-KATA" : levelSlug}{" "}
                Grammatikasi
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                Ushbu daraja uchun barcha grammatika qoidalari va namunalar
              </p>
            </div>
          </div>

          {availableLocales.length > 1 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">
                Ko'rish tili:
              </span>
              <div className="flex flex-wrap gap-1">
                {availableLocales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => setSelectedLocale(locale)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedLocale === locale
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    {LOCALE_CONFIG[locale].flag} {LOCALE_CONFIG[locale].short}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {grammars.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Qidirish (${LOCALE_CONFIG[selectedLocale].label} yoki yaponcha)...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pr-4 pl-12 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/20"
              />
            </div>

            {/* Formula ko'rsatish toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowFormula(!showFormula)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                {showFormula
                  ? "Formulalarni yashirish"
                  : "Formulalarni ko'rsatish"}
              </button>
            </div>
          </div>
        )}

        {grammars.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-500">
              Hozircha bu daraja uchun grammatikalar qo'shilmagan.
            </p>
          </div>
        ) : filteredGrammars.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-500">Qidiruv bo'yicha natija topilmadi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGrammars.map((grammar, index) => {
              const localizedTitle = getLocalized(grammar.title, selectedLocale)
              const localizedMeaning = getLocalized(
                grammar.meaning,
                selectedLocale
              )
              const localizedDescription = getLocalized(
                grammar.description,
                selectedLocale
              )
              const localizedExamples = getExamples(
                grammar.examples,
                selectedLocale
              )
              const jpTitle = getLocalized(grammar.title, "jp")
              const exampleCount = getExampleCount(
                grammar.examples,
                selectedLocale
              )

              const displayTitle = localizedTitle || jpTitle || "(bo'sh)"
              const displayMeaning =
                localizedMeaning || getLocalized(grammar.meaning, "jp") || ""

              // Formula ma'lumotlari
              const formula = grammar.formula
              const formulaAffirmative = formula?.affirmative || ""
              const formulaNegative = formula?.negative || ""
              const formulaPast = formula?.past || ""
              const formulaTeForm = formula?.te_form || ""
              const formulaDescription = getLocalized(
                formula?.description || null,
                selectedLocale
              )

              return (
                <div
                  key={grammar.id}
                  className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* HEADER */}
                  <div className="flex flex-col justify-between gap-4 bg-white p-6 md:flex-row md:items-center dark:bg-slate-900">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {index + 1}
                      </span>
                      <div>
                        {jpTitle && jpTitle !== displayTitle && (
                          <p className="mb-0.5 text-sm font-medium text-slate-400">
                            {jpTitle}
                          </p>
                        )}
                        <h2 className="text-xl font-bold text-slate-900 md:text-2xl dark:text-white">
                          {formatTextWithLineBreaks(displayTitle)}
                        </h2>
                      </div>
                    </div>

                    <div className="ml-14 flex flex-wrap items-center gap-4 md:ml-0">
                      {displayMeaning && (
                        <div className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {formatTextWithLineBreaks(displayMeaning)}
                        </div>
                      )}

                      {exampleCount > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {exampleCount} ta misol
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* FORMULA SECTION */}
                  {showFormula &&
                    formula &&
                    (formulaAffirmative ||
                      formulaNegative ||
                      formulaPast ||
                      formulaTeForm) && (
                      <div className="mx-6 mb-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                          <FileText className="h-4 w-4" />
                          Grammatika formulasi
                        </h3>
                        <div className="grid gap-3">
                          {formulaAffirmative && (
                            <div className="rounded-xl border border-blue-100 bg-white/80 p-3 dark:border-blue-900/50 dark:bg-slate-900/80">
                              <span className="mb-1 block text-xs font-medium text-blue-500 dark:text-blue-400">
                                ✓ Ijobiy shakl:
                              </span>
                              <code className="font-mono text-sm text-slate-800 dark:text-slate-200">
                                {formatTextWithLineBreaks(formulaAffirmative)}
                              </code>
                            </div>
                          )}
                          {formulaNegative && (
                            <div className="rounded-xl border border-blue-100 bg-white/80 p-3 dark:border-blue-900/50 dark:bg-slate-900/80">
                              <span className="mb-1 block text-xs font-medium text-red-500 dark:text-red-400">
                                ✗ Bo'lishsiz shakl:
                              </span>
                              <code className="font-mono text-sm text-slate-800 dark:text-slate-200">
                                {formatTextWithLineBreaks(formulaNegative)}
                              </code>
                            </div>
                          )}
                          {formulaPast && (
                            <div className="rounded-xl border border-blue-100 bg-white/80 p-3 dark:border-blue-900/50 dark:bg-slate-900/80">
                              <span className="mb-1 block text-xs font-medium text-purple-500 dark:text-purple-400">
                                🕐 O'tgan zamon:
                              </span>
                              <code className="font-mono text-sm text-slate-800 dark:text-slate-200">
                                {formatTextWithLineBreaks(formulaPast)}
                              </code>
                            </div>
                          )}
                          {formulaTeForm && (
                            <div className="rounded-xl border border-blue-100 bg-white/80 p-3 dark:border-blue-900/50 dark:bg-slate-900/80">
                              <span className="mb-1 block text-xs font-medium text-emerald-500 dark:text-emerald-400">
                                🔗 Bog'lash shakli:
                              </span>
                              <code className="font-mono text-sm text-slate-800 dark:text-slate-200">
                                {formatTextWithLineBreaks(formulaTeForm)}
                              </code>
                            </div>
                          )}
                          {formulaDescription && (
                            <div className="mt-2 rounded-xl border border-blue-100 bg-white/60 p-3 dark:border-blue-900/50 dark:bg-slate-900/60">
                              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                {formatTextWithLineBreaks(formulaDescription)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* BODY */}
                  <div className="border-t border-slate-100 bg-slate-50/30 p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900/50">
                    {localizedDescription && (
                      <div className="mb-8 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-slate-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-slate-300">
                        <Info className="h-6 w-6 shrink-0 text-blue-500" />
                        <p className="text-[15px] leading-relaxed">
                          {formatTextWithLineBreaks(localizedDescription)}
                        </p>
                      </div>
                    )}

                    {localizedExamples.length > 0 && (
                      <div>
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-slate-400 uppercase">
                          <MessageCircle className="h-4 w-4" />
                          Namunalar ({LOCALE_CONFIG[selectedLocale].label})
                        </h3>
                        <div className="grid gap-3">
                          {localizedExamples.map((example, i) => (
                            <div
                              key={i}
                              className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-blue-200 dark:border-slate-800/60 dark:bg-slate-800/40 dark:hover:border-blue-900/50"
                            >
                              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-blue-500" />
                              <div className="flex-1">
                                {example.jp && (
                                  <p className="text-[17px] font-medium text-slate-900 dark:text-white">
                                    {formatTextWithLineBreaks(example.jp)}
                                  </p>
                                )}
                                {example.translation && (
                                  <p
                                    className={`text-[15px] text-slate-500 dark:text-slate-400 ${example.jp ? "mt-1" : ""}`}
                                  >
                                    {formatTextWithLineBreaks(
                                      example.translation
                                    )}
                                  </p>
                                )}
                              </div>
                              {selectedLocale !== "jp" &&
                                example.jp &&
                                example.translation && (
                                  <Badge
                                    variant="outline"
                                    className="mt-0.5 shrink-0 text-[10px]"
                                  >
                                    JP → {LOCALE_CONFIG[selectedLocale].short}
                                  </Badge>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {localizedExamples.length === 0 && (
                      <div className="py-6 text-center text-slate-400 dark:text-slate-500">
                        <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm">
                          {LOCALE_CONFIG[selectedLocale].label} tilida misollar
                          mavjud emas
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
