"use client"

import { useEffect, useState, use } from "react"
import BackButton from "@/components/back-button"
import { userAPI } from "@/lib/api/user"
import { Languages, Info, MessageCircle, ArrowRight, Loader2, Search, ChevronDown, ChevronUp } from "lucide-react"

interface PageProps {
  params: Promise<{
    "jlpt-level": string
  }>
}

interface Example {
  japanese: string;
  translation: string;
}

interface Grammar {
  id: number;
  title: string;
  meaning: string;
  description: string;
  examples: Example[] | null;
}

export default function GrammarPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const levelSlug = resolvedParams["jlpt-level"].toLowerCase();

  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Qidiruv va ochilib-yopilish uchun yangi statelar
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchGrammars = async () => {
      try {
        const res = await userAPI.getLevelGrammars(levelSlug);
        const fetchedGrammars = res.data?.data || res.data || [];
        setGrammars(fetchedGrammars);
        
        // Ma'lumot kelganda, birinchi grammatikani avtomatik ochib qo'yish (ixtiyoriy)
        if (fetchedGrammars.length > 0) {
          setExpandedIds([fetchedGrammars[0].id]);
        }
      } catch (err) {
        console.error("Grammatikalarni yuklashda xatolik:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrammars();
  }, [levelSlug]);

  // Qidiruv bo'yicha filterlash logicasi
  const filteredGrammars = grammars.filter((g) => {
    const query = searchQuery.toLowerCase();
    return (
      g.title.toLowerCase().includes(query) ||
      (g.meaning && g.meaning.toLowerCase().includes(query))
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
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <p className="text-red-500 font-medium">Ma'lumotlarni yuklashda xatolik yuz berdi!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <BackButton />

        <div className="mt-8 mb-8 flex items-center gap-4">
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

        {/* QIDIRUV MAYDONI (SEARCH BAR) */}
        {grammars.length > 0 && (
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Qoida yoki o'zbekcha ma'nosi bo'yicha qidiring..."
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
          <div className="space-y-4">
            {filteredGrammars.map((grammar, index) => {
              const isExpanded = expandedIds.includes(grammar.id);

              return (
                <div 
                  key={grammar.id} 
                  className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all duration-200"
                >
                  {/* BOSILADIGAN SARLAVHA (HEADER) */}
                  <div 
                    onClick={() => toggleExpand(grammar.id)}
                    className="cursor-pointer border-b border-transparent bg-white p-5 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {index + 1}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        {grammar.title}
                      </h2>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 ml-14 md:ml-0">
                      {grammar.meaning && (
                        <div className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {grammar.meaning}
                        </div>
                      )}
                      
                      {/* O'q belgisi (Chevron) */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 transition-transform">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* OCHILADIGAN TANA QISMI (BODY) */}
                  {isExpanded && (
                    <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
                      {grammar.description && (
                        <div className="mb-8 flex gap-3 text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                          <Info className="h-6 w-6 shrink-0 text-blue-500" />
                          <p className="text-[15px] leading-relaxed">{grammar.description}</p>
                        </div>
                      )}

                      {grammar.examples && grammar.examples.length > 0 && (
                        <div>
                          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                            <MessageCircle className="h-4 w-4" />
                            Namunalar
                          </h3>
                          <div className="grid gap-3">
                            {grammar.examples.map((example, i) => (
                              <div 
                                key={i} 
                                className="group flex gap-4 rounded-2xl bg-white border border-slate-100 p-4 transition-colors hover:border-blue-200 dark:bg-slate-800/40 dark:border-slate-800/60 dark:hover:border-blue-900/50 shadow-sm"
                              >
                                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                <div>
                                  <p className="text-[17px] font-medium text-slate-900 dark:text-white">
                                    {example.japanese}
                                  </p>
                                  <p className="mt-1 text-[15px] text-slate-500 dark:text-slate-400">
                                    {example.translation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
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