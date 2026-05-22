'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, Eye, Clock, ChevronRight, Sparkles, 
  Copy, Gamepad2, BookOpen, GraduationCap, ShoppingCart, Languages, Gem, Layers 
} from 'lucide-react';

// Bosh sahifadagi menyu ro'yxati
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

const mockArticles = [
  {
    id: "1",
    title: "コーヒーは体にわるくないです",
    summary: "Qahva ichish sog'liq uchun foydali ekanligi haqida...",
    level: "N5",
    date: "22 May",
    views: "487",
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300",
    accent: "border-emerald-500"
  },
  {
    id: "2",
    title: "新しいロボットが開発されました",
    summary: "Yaponiyalik muhandislar uy ishlarida yordam beradigan...",
    level: "N3",
    date: "21 May",
    views: "1.2k",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300",
    accent: "border-purple-500"
  }
];

export default function DokkayListPage() {
  const [activeLevel, setActiveLevel] = useState("Barchasi");
  const pathname = usePathname(); // Hozir qaysi sahifada ekanligini bilish uchun

  return (
    <div className="w-full">
      {/* TEPADAGI GORIZONTAL MENU (Desktop uchun) */}
      <div className="hidden md:block mb-8 px-4 md:px-8 pt-4">
        <div className="flex w-full snap-x justify-start overflow-x-auto rounded-xl border border-transparent bg-slate-200/70 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.id === "jlpt" && pathname === "/dashboard");
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

      <div className="p-4 md:px-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="relative group w-full md:w-80">
            <input 
              type="text" 
              placeholder="Matn qidirish..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-amber-400 outline-none transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500" />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {["Barchasi", "N5", "N4", "N3", "N2", "N1"].map(lvl => (
            <button 
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                activeLevel === lvl 
                ? "bg-slate-900 dark:bg-amber-500 text-white border-slate-900 dark:border-amber-500 shadow-lg scale-105" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:border-amber-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockArticles.map((art) => (
            <Link href={`/dashboard/dokkay/${art.id}`} key={art.id}>
              <div className={`bg-white dark:bg-slate-800 rounded-[2rem] p-5 flex gap-5 border-b-4 ${art.accent} hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group`}>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                  <img src={art.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-lg uppercase tracking-wider">{art.level}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {art.date}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
                      {art.title}
                    </h2>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                     <span className="text-xs text-slate-400 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {art.views} marta</span>
                     <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}