"use client"

import { useEffect, useState, use } from "react"

import { BookMarked, MessageCircle, ArrowRight, Loader2, Search, ChevronDown, ChevronUp } from "lucide-react"
import { userAPI } from "@/lib/api/user"
import BackButton from "@/components/back-button"

interface PageProps {
  params: Promise<{
    "jlpt-level": string
  }>
}

interface Example {
  japanese: string;
  translation: string;
}

interface Vocabulary {
  id: number;
  word: string;
  reading: string | null;
  meaning: string;
  type: string | null;
  examples: Example[] | null;
}

export default function VocabularyPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const levelSlug = resolvedParams["jlpt-level"].toLowerCase();

  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Qidiruv va ochilib-yopilish uchun statelar
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchVocabularies = async () => {
      try {
        const res = await (userAPI as any).getLevelVocabularies(levelSlug);
        const fetchedVocabs = res.data?.data || res.data || [];
        setVocabularies(fetchedVocabs);
        
        // Birinchi lug'atni avtomatik ochib qo'yish
        if (fetchedVocabs.length > 0) {
          setExpandedIds([fetchedVocabs[0].id]);
        }
      } catch (err) {
        console.error("Lug'atlarni yuklashda xatolik:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabularies();
  }, [levelSlug]);

  // Qidiruv bo'yicha filterlash
  const filteredVocabularies = vocabularies.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      v.word.toLowerCase().includes(query) ||
      v.meaning.toLowerCase().includes(query) ||
      (v.reading && v.reading.toLowerCase().includes(query))
    );
  });

  // Ochish va yopish funksiyasi
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 text-center">
        <div>
          <p className="text-red-500 font-medium text-lg">Ma'lumotlarni yuklashda xatolik yuz berdi!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <BackButton />

        <div className="mt-8 mb-10 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <BookMarked className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 uppercase dark:text-white">
              {levelSlug === "hira-kata" ? "HIRA-KATA" : levelSlug} Lug'at Bazasi
            </h1>
            <p className="mt-1 text-slate-500 font-medium">
              Barcha yangi so'zlar, o'qilishlari va misollar
            </p>
          </div>
        </div>

        {/* QIDIRUV MAYDONI (SEARCH BAR) */}
        {vocabularies.length > 0 && (
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Yaponcha so'z, o'qilishi yoki o'zbekcha tarjimasini qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/20 transition-all"
            />
          </div>
        )}

        {vocabularies.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-500">Hozircha bu daraja uchun lug'atlar qo'shilmagan.</p>
          </div>
        ) : filteredVocabularies.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-500">Qidiruv bo'yicha natija topilmadi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVocabularies.map((vocab) => {
              const isExpanded = expandedIds.includes(vocab.id);

              return (
                <div 
                  key={vocab.id} 
                  className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all duration-200"
                >
                  {/* BOSILADIGAN SARLAVHA (HEADER) */}
                  <div 
                    onClick={() => toggleExpand(vocab.id)}
                    className="cursor-pointer p-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {vocab.word}
                        </h2>
                        {vocab.reading && (
                          <span className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                            【{vocab.reading}】
                          </span>
                        )}
                        {vocab.type && (
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider">
                            {vocab.type}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
                        {vocab.meaning}
                      </p>
                    </div>

                    <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 transition-transform md:ml-4">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* OCHILADIGAN TANA QISMI (BODY) - NAMUNALAR */}
                  {isExpanded && (
                    <div className="p-5 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      {vocab.examples && vocab.examples.length > 0 ? (
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <MessageCircle className="h-4 w-4" /> Namunalar
                          </h4>
                          <div className="space-y-3">
                            {vocab.examples.map((example, i) => (
                              <div 
                                key={i} 
                                className="flex gap-3 text-sm bg-white p-3 rounded-xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/60 shadow-sm"
                              >
                                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                                <div>
                                  <p className="font-medium text-slate-900 text-[15px] dark:text-white">
                                    {example.japanese}
                                  </p>
                                  <p className="text-slate-500 mt-1 dark:text-slate-400">
                                    {example.translation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Namunalar kiritilmagan.</p>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}