'use client'
import React, { useState, use } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // <-- usePathname qo'shildi
import Link from 'next/link'; // <-- Link qo'shildi
import { 
  ArrowLeft, Play, Volume2, Settings, Eye, Plus, BookOpen, ALargeSmall, SplitSquareHorizontal,
  Copy, Gamepad2, GraduationCap, ShoppingCart, Languages, Sparkles, Gem, Layers // <-- Navbar ikonkalari qo'shildi
} from 'lucide-react';

// BOSH SAHIFA MENYUSI
const MENU_ITEMS = [
  { id: "jlpt", label: "JLPT Darajalari", icon: Layers, href: "/dashboard" },
  { id: "dictionary", label: "Lug'at", icon: Copy, href: "/dashboard/dictionary" },
  { id: "games", label: "O'yinlar", icon: Gamepad2, href: "/dashboard/games" },
  { id: "dokkay", label: "Dokkay", icon: BookOpen, href: "/dashboard/dokkay" },
  { id: "kanji", label: "Kanji", icon: GraduationCap, href: "/dashboard/kanji" },
  { id: "shop", label: "Do'kon", icon: ShoppingCart, href: "/dashboard/shop" },
  { id: "translator", label: "Tarjimon", icon: Languages, href: "/dashboard/translator" },
  { id: "ai", label: "Sun'iy intellekt", icon: Sparkles, href: "/dashboard/ai" },
  { id: "premium", label: "Premium", icon: Gem, href: "/dashboard/premium", color: "text-amber-500 dark:text-amber-400" },
];

// 1. Kichik "Baza"
const mockDatabase: Record<string, any> = {
  "1": {
    id: "1",
    title: "コーヒーは体にわるくないです (Qahva tana uchun zararsiz)",
    level: "N5",
    date: "22/05/2026",
    views: 487,
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop",
    stats: [
      { level: "N5", percent: 53, color: "bg-[#3B704E]" },
      { level: "N4", percent: 21, color: "bg-[#3366B8]" },
      { level: "N3", percent: 16, color: "bg-[#8A56D7]" },
      { level: "N2", percent: 0,  color: "bg-[#F4C43D]" },
      { level: "N1", percent: 11, color: "bg-[#B72C25]" },
    ],
    content: [
      { word: "コーヒー", furigana: "", translation: "Qahva", grammar: "Ot", level: "N5" },
      { word: "は", furigana: "", translation: "Yuklama", grammar: "Yuklama", level: "" },
      { word: "健康", furigana: "けんこう", translation: "Sog'liq", grammar: "Ot", level: "N4" },
      { word: "に", furigana: "", translation: "ga (kelishik)", grammar: "Yuklama", level: "" },
      { word: "良い", furigana: "よ", translation: "Yaxshi", grammar: "Sifat", level: "N5" },
      { word: "です", furigana: "", translation: "dir", grammar: "Qo'shimcha", level: "" },
      { word: "。", furigana: "", translation: "", grammar: "Tinish belgisi", level: "" },
    ],
    vocabulary: [
      { id: 1, kanji: "コーヒー", furigana: "", meaning: "Coffee / Qahva", type: "Noun", level: "N5" },
      { id: 2, kanji: "健康", furigana: "けんこう", meaning: "Health / Sog'liq", type: "Noun", level: "N4" },
      { id: 3, kanji: "良い", furigana: "よい", meaning: "Good / Yaxshi", type: "Adjective", level: "N5" },
    ]
  },
  "2": {
    id: "2",
    title: "新しいロボットが開発されました (Yangi robot ishlab chiqildi)",
    level: "N3",
    date: "21/05/2026",
    views: 1205,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop",
    stats: [
      { level: "N5", percent: 20, color: "bg-[#3B704E]" },
      { level: "N4", percent: 30, color: "bg-[#3366B8]" },
      { level: "N3", percent: 50, color: "bg-[#8A56D7]" },
      { level: "N2", percent: 0,  color: "bg-[#F4C43D]" },
      { level: "N1", percent: 0, color: "bg-[#B72C25]" },
    ],
    content: [
      { word: "新", furigana: "あたら", translation: "Yangi", grammar: "Sifat", level: "N5" },
      { word: "しい", furigana: "", translation: "", grammar: "Qo'shimcha", level: "" },
      { word: "ロボット", furigana: "", translation: "Robot", grammar: "Ot", level: "N3" },
      { word: "が", furigana: "", translation: "Ega kelishigi", grammar: "Yuklama", level: "" },
      { word: "開発", furigana: "かいはつ", translation: "Ishlab chiqish", grammar: "Ot", level: "N3" },
      { word: "されました", furigana: "", translation: "Qilindi", grammar: "Fe'l", level: "N4" },
      { word: "。", furigana: "", translation: "", grammar: "Tinish belgisi", level: "" },
    ],
    vocabulary: [
      { id: 1, kanji: "新しい", furigana: "あたらしい", meaning: "New / Yangi", type: "Adjective", level: "N5" },
      { id: 2, kanji: "開発", furigana: "かいはつ", meaning: "Development / Ishlab chiqish", type: "Noun", level: "N3" },
    ]
  },
  "3": {
    id: "3",
    title: "東京で桜が咲き始めました (Tokioda sakuralar gullashni boshladi)",
    level: "N4",
    date: "20/05/2026",
    views: 892,
    imageUrl: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?q=80&w=1000&auto=format&fit=crop",
    stats: [
      { level: "N5", percent: 40, color: "bg-[#3B704E]" },
      { level: "N4", percent: 60, color: "bg-[#3366B8]" },
      { level: "N3", percent: 0, color: "bg-[#8A56D7]" },
      { level: "N2", percent: 0,  color: "bg-[#F4C43D]" },
      { level: "N1", percent: 0, color: "bg-[#B72C25]" },
    ],
    content: [
      { word: "東京", furigana: "とうきょう", translation: "Tokio", grammar: "Ot", level: "N5" },
      { word: "で", furigana: "", translation: "da (O'rin-payt)", grammar: "Yuklama", level: "" },
      { word: "桜", furigana: "さくら", translation: "Sakura", grammar: "Ot", level: "N4" },
      { word: "が", furigana: "", translation: "Ega kelishigi", grammar: "Yuklama", level: "" },
      { word: "咲き", furigana: "さ", translation: "Gullash", grammar: "Fe'l", level: "N4" },
      { word: "始めました", furigana: "はじ", translation: "Boshladi", grammar: "Fe'l", level: "N5" },
      { word: "。", furigana: "", translation: "", grammar: "Tinish belgisi", level: "" },
    ],
    vocabulary: [
      { id: 1, kanji: "東京", furigana: "とうきょう", meaning: "Tokyo", type: "Noun", level: "N5" },
      { id: 2, kanji: "桜", furigana: "さくら", meaning: "Cherry blossom / Sakura", type: "Noun", level: "N4" },
      { id: 3, kanji: "咲く", furigana: "さく", meaning: "Bloom / Gullamoq", type: "Verb", level: "N4" },
    ]
  }
};

// 2. Interaktiv so'z komponenti (Furigana va Probel propslarini qabul qiladi)
const InteractiveWord = ({ item, showFurigana, addSpace }: { item: any, showFurigana: boolean, addSpace: boolean }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!item.translation) {
    return (
      <span className="text-gray-800 dark:text-gray-200 text-lg md:text-xl leading-[2.5]">
        {item.word}
        {addSpace && item.word !== "。" && item.word !== "、" ? "\u00A0" : ""}
      </span>
    );
  }

  return (
    <span className={`relative inline-block cursor-pointer ${addSpace ? 'mr-1.5' : 'mx-[2px]'}`}>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-lg z-10 text-left text-sm">
          <p className="font-bold text-blue-600 dark:text-blue-400 mb-1">{item.word} {item.furigana && `(${item.furigana})`}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-1">{item.translation}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{item.grammar}</span>
            {item.level && <span className="text-[10px] font-bold text-white bg-[#3B704E] px-1.5 py-0.5 rounded">{item.level}</span>}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      )}

      <ruby 
        className={`text-lg md:text-xl leading-[2.5] hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded px-0.5 transition-colors ${showTooltip ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {item.word}
        {showFurigana && item.furigana && <rt className="text-gray-500 text-xs">{item.furigana}</rt>}
        {!showFurigana && item.furigana && <rt className="text-transparent text-xs opacity-0">_</rt>}
      </ruby>
    </span>
  );
};

// 3. Asosiy Sahifa
export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const pathname = usePathname(); // Navbar aktivligini bilish uchun
  const resolvedParams = use(params);
  const article = mockDatabase[resolvedParams.id];
  
  const [showFurigana, setShowFurigana] = useState(true);
  const [addSpace, setAddSpace] = useState(false);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Maqola topilmadi 😕</h1>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">Orqaga qaytish</button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 min-h-screen">
      {/* 🆕 TEPADAGI GORIZONTAL MENU (Desktop uchun responsiv qilib qo'shildi) */}
      <div className="hidden md:block mb-4 px-4 md:px-8 pt-4 max-w-6xl mx-auto">
        <div className="flex w-full snap-x justify-start overflow-x-auto rounded-xl border border-transparent bg-slate-200/70 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
          {MENU_ITEMS.map((item) => {
            // Biz maqola ichida bo'lsak ham Dokkay bo'limi aktiv turishi kerak
            const isActive = item.id === "dokkay"; 
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex shrink-0 snap-start items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive 
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" 
                  : "text-slate-600 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
              >
                <item.icon className={`h-4 w-4 ${item.color || ""}`} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ASOSIY QISM (O'zgartirilmadi) */}
      <div className="max-w-4xl mx-auto pb-20">
        <div className="p-4 md:p-6">
          
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6 w-fit">
            <ArrowLeft className="w-4 h-4" /> Ortga qaytish
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{article.title}</h1>
          
          <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4 mb-6">
            <span className="px-2 py-0.5 text-xs font-bold rounded text-white bg-[#3B704E]">{article.level}</span>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4"/> {article.views}</span>
              <span>{article.date}</span>
            </div>
          </div>

          <div className="w-full aspect-video md:aspect-[21/9] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
            <img src={article.imageUrl} alt="Article cover" className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg mb-6 border dark:border-gray-800">
            <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition">
              <Play className="w-5 h-5 ml-0.5" />
            </button>
            <div className="flex-1 mx-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-blue-500"></div>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <span className="text-xs font-medium">0:00 / 1:12</span>
              <Volume2 className="w-4 h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
              <Settings className="w-4 h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 py-2 border dark:border-gray-700 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition">
              <BookOpen className="w-4 h-4" /> Bilingual Translation
            </button>
            <button className="flex items-center justify-center gap-2 py-2 border dark:border-gray-700 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <Plus className="w-4 h-4" /> Add Translation
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-auto">O'qishni sozlash:</h3>
            
            <button 
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showFurigana ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <ALargeSmall className="w-4 h-4" />
              Furigana
              <div className={`w-8 h-4 rounded-full p-0.5 ml-2 transition-colors ${showFurigana ? 'bg-blue-500' : 'bg-gray-400'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${showFurigana ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </button>

            <button 
              onClick={() => setAddSpace(!addSpace)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                addSpace ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              So'z oralig'i
              <div className={`w-8 h-4 rounded-full p-0.5 ml-2 transition-colors ${addSpace ? 'bg-green-500' : 'bg-gray-400'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${addSpace ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </button>
          </div>

          <div className="mb-8 border-b dark:border-gray-800 pb-8">
            <div className="flex flex-wrap items-end bg-gray-50/50 dark:bg-gray-800/20 p-4 md:p-6 rounded-xl border dark:border-gray-800">
              {article.content.map((item: any, index: number) => (
                <InteractiveWord 
                  key={index} 
                  item={item} 
                  showFurigana={showFurigana} 
                  addSpace={addSpace} 
                />
              ))}
            </div>
          </div>

          <div className="mb-12 border dark:border-gray-700 rounded-xl p-4 md:p-6 bg-white dark:bg-gray-800 flex flex-wrap gap-y-4 items-center justify-between shadow-sm">
            {article.stats.map((stat: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 min-w-[80px]">
                <span className={`px-2.5 py-1 text-sm font-bold text-white rounded-md ${stat.color}`}>
                  {stat.level}
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {stat.percent}%
                </span>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vocabulary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.vocabulary.map((vocab: any) => (
                <div key={vocab.id} className="flex flex-col p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-0.5">{vocab.furigana || " "}</span>
                      <span className="text-lg font-bold dark:text-white">{vocab.kanji}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded text-white bg-[#3B704E]`}>{vocab.level}</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{vocab.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}