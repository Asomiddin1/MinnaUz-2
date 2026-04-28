"use client";

import { 
  Lock, Clock, Target, ChevronRight, Image as ImageIcon
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// =====================
// MOCK DATA
// =====================
const jlptLevels = ["N5", "N4", "N3", "N2", "N1"];

const mockTests = [
  { id: 1, level: "N5", title: "Test 1", questions: 80, time: 105, isLocked: false },
  { id: 2, level: "N5", title: "Test 2", questions: 80, time: 105, isLocked: false },
  { id: 3, level: "N5", title: "Test 3 - New", questions: 80, time: 105, isLocked: true },
  { id: 4, level: "N5", title: "Test 4 - New", questions: 80, time: 105, isLocked: true },
  { id: 5, level: "N5", title: "Test 5 - New", questions: 80, time: 105, isLocked: true },
  { id: 6, level: "N5", title: "Test 6 - New", questions: 80, time: 105, isLocked: true },
];

const JlptPage = () => {
  return (
    // Orqa fon rasmingizdagi kabi juda och kulrang (#F8F9FA yoki slate-50)
    <div className="min-h-screen   p-4 md:p-6 lg:p-8 w-full font-sans transition-colors duration-200">
      
      {/* Asosiy Grid Konteyner */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* ================================== */}
        {/* CHAP TOMON: ASOSIY KONTENT (TESTLAR) */}
        {/* ================================== */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="N5" className="w-full">
            
            {/* TABS (Darajalar) */}
            <TabsList className="mb-6 flex gap-3 md:gap-4 bg-transparent border-none justify-start p-0 h-auto">
              {jlptLevels.map((level) => (
                <TabsTrigger
                  key={level}
                  value={level}
                  // Qop-qora o'rniga slate-700 (to'q kulrang) ishlatildi
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full text-base md:text-lg font-medium text-slate-400 dark:text-slate-400 
                  data-[state=active]:bg-slate-700 dark:data-[state=active]:bg-slate-200 
                  data-[state=active]:text-white dark:data-[state=active]:text-slate-800 
                  data-[state=active]:shadow-sm transition-all border-none bg-transparent hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {level}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* TAB MAZMUNI */}
            {jlptLevels.map((level) => {
              const levelTests = mockTests.filter((test) => test.level === level);

              return (
                <TabsContent key={level} value={level} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  
                  {/* Sarlavha (Exam List) */}
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Exam List</h2>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-100 dark:border-slate-700">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {levelTests.length > 0 ? (
                    // KARDLAR GRIDI
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
                      {levelTests.map((test) => (
                        <div 
                          key={test.id} 
                          // Rasmdagidek juda yumshoq shadow va border
                          className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] dark:shadow-none transition-all"
                        >
                          {/* Test Nomi */}
                          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6">
                            {test.title}
                          </h3>

                          {/* Ma'lumot va Tugma qismi */}
                          <div className="flex items-center justify-between">
                            
                            {/* Vaqt va Savollar */}
                            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-400 text-sm md:text-base font-medium">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                <span>{test.time} minutes</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Target className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                <span>{test.questions}</span>
                              </div>
                            </div>

                            {/* Boshlash tugmasi (qop-qora o'rniga slate-700) */}
                            <Button 
                              className="bg-slate-700 hover:bg-slate-600 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-800 rounded-xl px-4 md:px-5 h-9 md:h-10 font-medium flex items-center gap-2 transition-colors shadow-sm"
                            >
                              Start
                              {test.isLocked && <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1 opacity-80" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Testlar yo'q bo'lsa
                    <div className="py-20 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
                      {level} darajasi uchun testlar tez orada qo'shiladi.
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* ================================== */}
        {/* O'NG TOMON: REKLAMA UCHUN JOY */}
        {/* ================================== */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4 md:gap-6 mt-8 lg:mt-[80px]">
          {/* 1-Reklama bloki */}
          <div className="w-full h-[250px] bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
            <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">Ad Space (320x250)</p>
          </div>

          {/* 2-Reklama bloki */}
          <div className="w-full h-[400px] hidden md:flex bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
            <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">Ad Space (320x400)</p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default JlptPage;