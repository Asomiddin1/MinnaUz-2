"use client";

import { 
  Lock, PlayCircle, Clock, FileText, GraduationCap, Unlock, Crown 
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// =====================
// MOCK DATA (Testlar)
// =====================
const jlptLevels = ["N5", "N4", "N3", "N2", "N1"];

const mockTests = [
  { id: 1, level: "N5", title: "Asosiy So'zlar - 1", desc: "Kunlik hayotda eng ko'p ishlatiladigan so'zlar", questions: 20, time: 15, isLocked: false },
  { id: 2, level: "N5", title: "Grammatika qoidalari", desc: "Zamonlar va asosiy qo'shimchalar", questions: 25, time: 20, isLocked: false },
  { id: 3, level: "N5", title: "Ierogliflar (Kanji) - 1", desc: "Raqamlar, kunlar va tabiat so'zlari", questions: 15, time: 10, isLocked: true },
  { id: 4, level: "N5", title: "O'qib tushunish (Reading)", desc: "Kichik matnlarni tahlil qilish", questions: 10, time: 30, isLocked: true },
  
  { id: 5, level: "N4", title: "O'rta daraja so'zlar", desc: "Ish va o'qishga oid so'z boyligi", questions: 30, time: 25, isLocked: false },
  { id: 6, level: "N4", title: "Murakkab grammatika", desc: "Natija va sabab bog'lovchilari", questions: 25, time: 25, isLocked: true },
  
  { id: 7, level: "N3", title: "Kundalik Kanji - N3", desc: "Gazeta va jurnallardagi kanjilar", questions: 20, time: 20, isLocked: true },
];

const JlptPage = () => {
  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8 text-slate-900 dark:text-slate-100 max-w-7xl mx-auto w-full">
      
      {/* HEADER */}
      <div className="mb-6 md:mb-8 space-y-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
          <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-500" />
          JLPT Testlari
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base lg:text-lg max-w-3xl">
          Yapon tilini bilish darajangizni oshiring. O'zingizga mos darajani tanlang va mavzulashtirilgan testlarni yechishni boshlang.
        </p>
      </div>

      {/* TABS (Darajalar) */}
      <Tabs defaultValue="N5" className="w-full">
        
        <TabsList className="mb-6 flex flex-wrap h-auto p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl justify-start w-fit">
          {jlptLevels.map((level) => (
            <TabsTrigger
              key={level}
              value={level}
              className="px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-sm md:text-base font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all"
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
              {levelTests.length > 0 ? (
                <>
                  {/* ======================================= */}
                  {/* 📱 MOBILE VIEW: CARDS (faqat md dan kichik ekranlarda ko'rinadi) */}
                  {/* ======================================= */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {levelTests.map((test) => (
                      <Card 
                        key={test.id} 
                        className={`relative flex flex-col overflow-hidden transition-all ${
                          test.isLocked 
                            ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800" 
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {/* Qulf/Unlock Icon */}
                        <div className="absolute top-4 right-4 z-10">
                          {test.isLocked ? (
                            <div className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                              <Lock className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <Unlock className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-3 pt-5">
                          <Badge 
                            variant={test.isLocked ? "secondary" : "default"} 
                            className={`w-fit mb-2 ${test.isLocked ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300" : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-none"}`}
                          >
                            {test.level}
                          </Badge>
                          <CardTitle className={`text-lg pr-8 leading-tight ${test.isLocked ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                            {test.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {test.desc}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-4">
                          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{test.questions} savol</span>
                            </div>
                            <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700"></div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{test.time} daq</span>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter>
                          {test.isLocked ? (
                            <Button 
                              variant="outline"
                              className="w-full h-10 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 font-medium"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Premium Olish
                            </Button>
                          ) : (
                            <Button 
                              className="w-full h-10 bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 font-medium"
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Boshlash
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {/* ======================================= */}
                  {/* 💻 DESKTOP VIEW: TABLE (faqat md dan katta ekranlarda ko'rinadi) */}
                  {/* ======================================= */}
                  <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="border-b-slate-200 dark:border-b-slate-800 hover:bg-transparent">
                          <TableHead className="w-[60px] text-center text-slate-500 dark:text-slate-400">Holat</TableHead>
                          <TableHead className="w-[100px] text-slate-500 dark:text-slate-400">Daraja</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Test Nomi</TableHead>
                          <TableHead className="w-[150px] text-slate-500 dark:text-slate-400">Ma'lumot</TableHead>
                          <TableHead className="w-[180px] text-right text-slate-500 dark:text-slate-400">Harakat</TableHead>
                        </TableRow>
                      </TableHeader>
                      
                      <TableBody>
                        {levelTests.map((test) => (
                          <TableRow 
                            key={`desktop-${test.id}`} 
                            className={`border-b-slate-200 dark:border-b-slate-800 transition-colors ${
                              test.isLocked 
                                ? "bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100/50 dark:hover:bg-slate-900/40" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
                            }`}
                          >
                            {/* HOLAT */}
                            <TableCell className="text-center">
                              {test.isLocked ? (
                                <div className="inline-flex p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                  <Lock className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="inline-flex p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400">
                                  <Unlock className="w-4 h-4" />
                                </div>
                              )}
                            </TableCell>

                            {/* DARAJA */}
                            <TableCell>
                              <Badge 
                                variant={test.isLocked ? "secondary" : "default"} 
                                className={test.isLocked ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-none"}
                              >
                                {test.level}
                              </Badge>
                            </TableCell>

                            {/* NOMI VA TA'RIF */}
                            <TableCell>
                              <div className="flex flex-col">
                                <span className={`font-semibold text-base ${test.isLocked ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                                  {test.title}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-500 line-clamp-1 mt-0.5">
                                  {test.desc}
                                </span>
                              </div>
                            </TableCell>

                            {/* SAVOL VA VAQT */}
                            <TableCell>
                              <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{test.questions} ta savol</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{test.time} daqiqa</span>
                                </div>
                              </div>
                            </TableCell>

                            {/* HARAKAT TUGMASI */}
                            <TableCell className="text-right">
                              {test.isLocked ? (
                                <Button 
                                  variant="outline"
                                  className="w-[160px] bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                                >
                                  <Crown className="w-4 h-4 mr-2" />
                                  Premium Olish
                                </Button>
                              ) : (
                                <Button 
                                  className="w-[160px] bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 font-medium shadow-sm"
                                >
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Boshlash
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                // Testlar yo'q bo'lsa
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {level} darajasi uchun testlar yo'q
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md px-4">
                    Hozircha bu bo'limda testlar mavjud emas. Tez orada yangi savollar qo'shiladi.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      
    </div>
  );
};

export default JlptPage;