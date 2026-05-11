"use client"

import { useState } from "react"
import BackButton from "@/components/back-button"
import { Type, PenTool, Volume2, Languages, Sparkles } from "lucide-react"

// Alifbo ma'lumotlari
const HIRAGANA_DATA = [
  { jpn: "あ", rom: "a" }, { jpn: "い", rom: "i" }, { jpn: "う", rom: "u" }, { jpn: "え", rom: "e" }, { jpn: "お", rom: "o" },
  { jpn: "か", rom: "ka" }, { jpn: "き", rom: "ki" }, { jpn: "く", rom: "ku" }, { jpn: "け", rom: "ke" }, { jpn: "こ", rom: "ko" },
  { jpn: "さ", rom: "sa" }, { jpn: "し", rom: "shi" }, { jpn: "す", rom: "su" }, { jpn: "せ", rom: "se" }, { jpn: "そ", rom: "so" },
  { jpn: "た", rom: "ta" }, { jpn: "ち", rom: "chi" }, { jpn: "つ", rom: "tsu" }, { jpn: "て", rom: "te" }, { jpn: "と", rom: "to" },
  { jpn: "な", rom: "na" }, { jpn: "に", rom: "ni" }, { jpn: "ぬ", rom: "nu" }, { jpn: "ね", rom: "ne" }, { jpn: "の", rom: "no" },
  { jpn: "は", rom: "ha" }, { jpn: "ひ", rom: "hi" }, { jpn: "ふ", rom: "fu" }, { jpn: "へ", rom: "he" }, { jpn: "ほ", rom: "ho" },
  { jpn: "ま", rom: "ma" }, { jpn: "み", rom: "mi" }, { jpn: "む", rom: "mu" }, { jpn: "め", rom: "me" }, { jpn: "も", rom: "mo" },
  { jpn: "や", rom: "ya" }, { jpn: "", rom: "" }, { jpn: "ゆ", rom: "yu" }, { jpn: "", rom: "" }, { jpn: "よ", rom: "yo" },
  { jpn: "ら", rom: "ra" }, { jpn: "り", rom: "ri" }, { jpn: "る", rom: "ru" }, { jpn: "れ", rom: "re" }, { jpn: "ろ", rom: "ro" },
  { jpn: "わ", rom: "wa" }, { jpn: "", rom: "" }, { jpn: "", rom: "" }, { jpn: "", rom: "" }, { jpn: "を", rom: "wo" },
  { jpn: "ん", rom: "n" },
]

const KATAKANA_DATA = [
  { jpn: "ア", rom: "a" }, { jpn: "イ", rom: "i" }, { jpn: "ウ", rom: "u" }, { jpn: "エ", rom: "e" }, { jpn: "オ", rom: "o" },
  { jpn: "カ", rom: "ka" }, { jpn: "キ", rom: "ki" }, { jpn: "ク", rom: "ku" }, { jpn: "ケ", rom: "ke" }, { jpn: "コ", rom: "ko" },
  { jpn: "サ", rom: "sa" }, { jpn: "シ", rom: "shi" }, { jpn: "ス", rom: "su" }, { jpn: "セ", rom: "se" }, { jpn: "ソ", rom: "so" },
  { jpn: "タ", rom: "ta" }, { jpn: "チ", rom: "chi" }, { jpn: "ツ", rom: "tsu" }, { jpn: "テ", rom: "te" }, { jpn: "ト", rom: "to" },
  { jpn: "ナ", rom: "na" }, { jpn: "ニ", rom: "ni" }, { jpn: "ヌ", rom: "nu" }, { jpn: "ネ", rom: "ne" }, { jpn: "ノ", rom: "no" },
  { jpn: "ハ", rom: "ha" }, { jpn: "ヒ", rom: "hi" }, { jpn: "フ", rom: "fu" }, { jpn: "ヘ", rom: "he" }, { jpn: "ホ", rom: "ho" },
  { jpn: "マ", rom: "ma" }, { jpn: "ミ", rom: "ni" }, { jpn: "ム", rom: "mu" }, { jpn: "メ", rom: "me" }, { jpn: "モ", rom: "mo" },
  { jpn: "ヤ", rom: "ya" }, { jpn: "", rom: "" }, { jpn: "ユ", rom: "yu" }, { jpn: "", rom: "" }, { jpn: "ヨ", rom: "yo" },
  { jpn: "ラ", rom: "ra" }, { jpn: "リ", rom: "ri" }, { jpn: "ル", rom: "ru" }, { jpn: "レ", rom: "re" }, { jpn: "ロ", rom: "ro" },
  { jpn: "ワ", rom: "wa" }, { jpn: "", rom: "" }, { jpn: "", rom: "" }, { jpn: "", rom: "" }, { jpn: "ヲ", rom: "wo" },
  { jpn: "ン", rom: "n" },
]

const AlphabetPage = () => {
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana")
  const currentData = activeTab === "hiragana" ? HIRAGANA_DATA : KATAKANA_DATA

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-10">
      <div className="mx-auto max-w-7xl">
        <BackButton />
        
        <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-blue-600 p-2 rounded-lg text-white">
                 <Languages className="h-5 w-5" />
               </div>
               <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Alifbo bo'limi</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              {activeTab === "hiragana" ? "Hiragana" : "Katakana"} Alifbosi
            </h1>
            <p className="text-slate-500 mt-2">Harflarni tanlang va ularning talaffuzi hamda yozilishini o'rganing</p>
          </div>
          
          {/* Switcher */}
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border shadow-sm dark:border-slate-800">
             <button 
                onClick={() => setActiveTab("hiragana")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "hiragana" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-slate-500 hover:text-blue-600"
                }`}
             >
                Hiragana
             </button>
             <button 
                onClick={() => setActiveTab("katakana")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "katakana" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-slate-500 hover:text-blue-600"
                }`}
             >
                Katakana
             </button>
          </div>
        </div>

        {/* Interaktiv Jadval */}
        <div className="mt-10 grid grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-3 md:gap-4">
          {currentData.map((char, i) => (
            char.jpn ? (
              <div 
                key={i} 
                className="group relative aspect-square bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all active:scale-95 shadow-sm"
              >
                <span className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                  {char.jpn}
                </span>
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-1 group-hover:text-blue-400">
                  {char.rom}
                </span>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Volume2 className="h-3.5 w-3.5 text-blue-500" />
                </div>
              </div>
            ) : (
              <div key={i} className="aspect-square hidden md:block" /> // Bo'sh joylar uchun
            )
          ))}
        </div>

        {/* Pastki bo'limlar */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Yozish mashqi */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-shadow">
             <div className="h-14 w-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <PenTool className="h-7 w-7 text-blue-600" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Yozish mashqlari</h3>
             <p className="text-slate-500 mt-3 leading-relaxed">
               Har bir harfning yozilish tartibini (Stroke order) bosqichma-bosqich o'rganing va ekran ustida mashq qiling.
             </p>
             <button className="mt-8 flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                Mashqni boshlash
             </button>
          </div>
          
          {/* Test bo'limi */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-shadow">
             <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Type className="h-7 w-7 text-emerald-600" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white">O'qish testi</h3>
             <p className="text-slate-500 mt-3 leading-relaxed">
               O'rgangan harflaringizni tezlik va aniqlik bo'yicha sinovdan o'tkazing. O'zingizni imtihonga tayyorlang!
             </p>
             <button className="mt-8 flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-black dark:hover:bg-slate-700 transition-colors">
                Testga o'tish
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlphabetPage