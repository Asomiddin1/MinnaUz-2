"use client"

import { useEffect, useState, use } from "react"

import { Layers, MessageCircle, ArrowRight, Loader2, Search, ChevronDown, ChevronUp } from "lucide-react"
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

interface Kanji {
  id: number;
  character: string;
  meaning: string;
  kunyomi: string | null;
  onyomi: string | null;
  examples: Example[] | null;
}

export default function KanjiPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const levelSlug = resolvedParams["jlpt-level"].toLowerCase();

  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Qidiruv va ochilib-yopilish uchun statelar
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchKanjis = async () => {
      try {
        const res = await (userAPI as any).getLevelKanjis(levelSlug);
        const fetchedKanjis = res.data?.data || res.data || [];
        setKanjis(fetchedKanjis);

        // Birinchi kanjini avtomatik ochib qo'yish
        if (fetchedKanjis.length > 0) {
          setExpandedIds([fetchedKanjis[0].id]);
        }
      } catch (err) {
        console.error("Kanjilarni yuklashda xatolik:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKanjis();
  }, [levelSlug]);

  // Qidiruv bo'yicha filterlash
  const filteredKanjis = kanjis.filter((k) => {
    const query = searchQuery.toLowerCase();
    return (
      k.character.toLowerCase().includes(query) ||
      k.meaning.toLowerCase().includes(query) ||
      (k.kunyomi && k.kunyomi.toLowerCase().includes(query)) ||
      (k.onyomi && k.onyomi.toLowerCase().includes(query))
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
            <Layers className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 uppercase dark:text-white">
              {levelSlug === "hira-kata" ? "HIRA-KATA" : levelSlug} Kanji
            </h1>
            <p className="mt-1 text-slate-500 font-medium">
              Iyerogliflar, o'qilish tartibi va namunalar
            </p>
          </div>
        </div>

        {/* QIDIRUV MAYDONI (SEARCH BAR) */}
        {kanjis.length > 0 && (
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Kanji, ma'nosi, onyomi yoki kunyomi bo'yicha qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900/20 transition-all"
            />
          </div>
        )}

        {kanjis.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-500">Hozircha bu daraja uchun kanjilar qo'shilmagan.</p>
          </div>
        ) : filteredKanjis.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-slate-500">Qidiruv bo'yicha natija topilmadi.</p>
          </div>
        ) : (
          // items-start qo'shdik, shunda bitta kanji ochilganda ikkinchisi ham keraksiz cho'zilib ketmaydi
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {filteredKanjis.map((kanji) => {
              const isExpanded = expandedIds.includes(kanji.id);

              return (
                <div 
                  key={kanji.id} 
                  className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-all duration-200"
                >
                  {/* BOSILADIGAN SARLAVHA QISMI */}
                  <div 
                    onClick={() => toggleExpand(kanji.id)}
                    className="cursor-pointer flex p-5 gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors select-none items-center"
                  >
                    {/* Iyeroglif */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-4xl font-medium text-slate-900 dark:text-white">
                      {kanji.character}
                    </div>
                    
                    {/* O'qilishlari */}
                    <div className="flex-1 flex flex-col justify-center space-y-1.5">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                        {kanji.meaning}
                      </h3>
                      {kanji.onyomi && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-slate-400 w-10">ON:</span>
                          <span className="text-slate-700 dark:text-slate-300 line-clamp-1">{kanji.onyomi}</span>
                        </div>
                      )}
                      {kanji.kunyomi && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-slate-400 w-10">KUN:</span>
                          <span className="text-slate-700 dark:text-slate-300 line-clamp-1">{kanji.kunyomi}</span>
                        </div>
                      )}
                    </div>

                    {/* O'q belgisi */}
                    <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 transition-transform">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* OCHILADIGAN TANA QISMI - NAMUNALAR */}
                  {isExpanded && (
                    <div className="p-5 md:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex-1">
                      {kanji.examples && kanji.examples.length > 0 ? (
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <MessageCircle className="h-4 w-4" /> Namunalar
                          </h4>
                          <div className="space-y-3">
                            {kanji.examples.map((example, i) => (
                              <div key={i} className="flex gap-3 text-sm bg-white p-3 rounded-xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/60 shadow-sm">
                                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                                <div>
                                  <p className="font-medium text-[15px] text-slate-900 dark:text-white">
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