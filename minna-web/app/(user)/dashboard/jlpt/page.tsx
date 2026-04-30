"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAPI, userAPI } from "@/lib/api"; // userAPI qo'shildi
import { useSession } from "next-auth/react";

import { 
  Lock, Clock, Target, ChevronRight, Image as ImageIcon, Loader2, 
  HelpCircle, Crown 
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const jlptLevels = ["N5", "N4", "N3", "N2", "N1"];

const JlptPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🚀 Premium holatini ishonchli ushlash
  const [isPremium, setIsPremium] = useState<boolean>(false);

  // =====================
  // 1. SESSION VA BAZADAN PREMIUM HOLATINI TEKSHIRISH
  // =====================
  useEffect(() => {
    // 1-qadam: Session'dan darhol olish (tezlik uchun)
    if (session?.user) {
       setIsPremium((session.user as any)?.is_premium === true);
    }

    // 2-qadam: Orqa fonda Bazadan aniq holatni so'rash (is_premium yangilangan bo'lsa darhol sezish uchun)
    if (status === "authenticated") {
        userAPI.getProfile().then(res => {
            const backendUser = res.data.user || res.data;
            if (backendUser && backendUser.is_premium !== undefined) {
               setIsPremium(backendUser.is_premium === true);
            }
        }).catch(err => console.error("Profile o'qishda xatolik:", err));
    }
  }, [session, status]);

  // =====================
  // 2. TESTLARNI OLISH
  // =====================
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getTests();
        setTests(res.data.data || res.data || []);
      } catch (err) {
        console.error("Testlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 w-full font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* CHAP TOMON: TESTLAR */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="N5" className="w-full">
            
            <TabsList className="mb-6 flex gap-3 md:gap-4 bg-transparent border-none justify-start p-0 h-auto overflow-x-auto no-scrollbar">
              {jlptLevels.map((level) => (
                <TabsTrigger
                  key={level}
                  value={level}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full text-base md:text-lg font-medium text-slate-400 
                  data-[state=active]:bg-slate-700 data-[state=active]:text-white 
                  transition-all border-none bg-white shadow-sm hover:text-slate-600"
                >
                  {level}
                </TabsTrigger>
              ))}
            </TabsList>

            {jlptLevels.map((level) => {
              const levelTests = tests.filter((test) => test.level === level);

              return (
                <TabsContent key={level} value={level} className="mt-0 focus-visible:outline-none">
                  
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                      {level} Exam List
                    </h2>
                    <Badge variant="outline" className="text-slate-500">
                      {levelTests.length} ta mavjud
                    </Badge>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                      ))}
                    </div>
                  ) : levelTests.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
                      {levelTests.map((test) => {
                        
                        // 👈 QULFLASH MANTIG'I
                        const isLocked = test.is_premium && !isPremium;

                        return (
                          <div 
                            key={test.id} 
                            className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 md:p-6 flex flex-col justify-between transition-all ${
                              isLocked 
                                ? "border-slate-100 dark:border-slate-700 opacity-90 grayscale-[10%]" 
                                : "border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 pr-2">
                                  {test.title}
                                </h3>
                                {test.is_premium && (
                                  <Badge className="bg-amber-100 text-amber-600 hover:bg-amber-200 border-none px-2 shadow-none shrink-0 flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Premium
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                  <span>{test.time || 105} min</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Target className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                  <span>Min. {test.pass_score || 50}%</span>
                                </div>
                              </div>

                              <Button 
                                onClick={() => {
                                  if (isLocked) {
                                    router.push("/dashboard/premium");
                                  } else {
                                    router.push(`/dashboard/jlpt/${test.id}`);
                                  }
                                }}
                                className={`rounded-xl px-5 h-10 font-medium flex items-center gap-2 transition-all ${
                                  isLocked 
                                    ? "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-700" 
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                              >
                                {isLocked ? (
                                  <>
                                    Qulf <Lock className="w-4 h-4 ml-1 opacity-70" />
                                  </>
                                ) : (
                                  "Start"
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 text-center text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                      <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      Hozircha bu darajada testlar yo'q.
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* O'NG TOMON: REKLAMA */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6 mt-8 lg:mt-[80px]">
          <div className="w-full h-[250px] bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Ad Space</p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default JlptPage;