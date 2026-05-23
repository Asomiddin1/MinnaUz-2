'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Copy,
  Gamepad2,
  BookOpen,
  GraduationCap,
  ShoppingCart,
  Languages,
  Sparkles,
  Gem,
  Layers,
} from "lucide-react"
import { useSession } from "next-auth/react"
import JlptLevels from "@/components/user-components/home-fuctions/jlpt-levels/jlpt-levels"
import BannerCarousel from "@/components/user-components/banner/banner-carousel"
import GamesList from "@/components/user-components/home-fuctions/games/games"
import Lugat from "@/components/user-components/home-fuctions/lugat/lugat"
import { useRouter } from "next/navigation"

// isTab xususiyati qo'shildi
const MENU_ITEMS = [
  {
    id: "dictionary",
    label: "Lug'at",
    icon: Copy,
    href: "/dashboard/dictionary",
    isTab: true, // TabsContent ichida bor
  },
  { 
    id: "games", 
    label: "O'yinlar", 
    icon: Gamepad2, 
    href: "/dashboard/games",
    isTab: true, // TabsContent ichida bor
  },
  { 
    id: "dokkay", 
    label: "Dokkay", 
    icon: BookOpen, 
    href: "/dashboard/dokkay",
    isTab: false, // Alohida sahifa qildik
  },
  {
    id: "kanji",
    label: "Kanji",
    icon: GraduationCap,
    href: "/dashboard/kanji",
    isTab: false, 
  },
  { 
    id: "shop", 
    label: "Do'kon", 
    icon: ShoppingCart, 
    href: "/dashboard/shop",
    isTab: false,
  },
  {
    id: "translator",
    label: "Tarjimon",
    icon: Languages,
    href: "/dashboard/translator",
    isTab: false,
  },
  {
    id: "ai",
    label: "Sun'iy intellekt",
    icon: Sparkles,
    href: "/dashboard/ai",
    isTab: false,
  },
  {
    id: "premium",
    label: "Premium",
    icon: Gem,
    href: "/dashboard/premium",
    color: "text-amber-500 dark:text-amber-400",
    isTab: false,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)

  // Asosiy ko'rinib turadigan tabni boshqarish uchun state
  const [activeTab, setActiveTab] = useState("jlpt")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full flex h-[50vh] items-center justify-center">
        <div className="text-slate-500">Yuklanmoqda...</div>
      </div>
    )
  }

  // Menyu tugmasi bosilganda ishlaydigan funksiya
  const handleTabClick = (item: any) => {
    if (item.isTab) {
      // Agar Tab bo'lsa, URL o'zgarmaydi, faqat oyna almashadi
      setActiveTab(item.id)
    } else {
      // Agar alohida sahifa bo'lsa (masalan, Dokkay), boshqa manzilga ketadi
      router.push(item.href)
    }
  }

  return (
    <div className="w-full">
      {/* 📱 MOBIL KO'RINISh */}
      <div className="space-y-6 pt-2 md:hidden">
        <header className="flex items-center justify-between pb-1">
          <Link href={"/dashboard/profile"} className="flex items-center gap-3">
            <div className="h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-blue-100 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-800">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                こんにちは
              </span>
              <span className="text-[15px] leading-tight font-bold text-slate-900 dark:text-white">
                {session?.user?.name || "Foydalanuvchi"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-100/60 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-colors dark:border-slate-700/60 dark:bg-slate-800/80">
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#FFB800] text-[10px] text-white shadow-inner">
              🪙
            </div>
            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
              1000
            </span>
          </div>
        </header>

        <div className="w-full">
          <BannerCarousel />
        </div>

        {/* MOBIL UCHUN MENU (Ular ham logikaga moslandi) */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-5">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className="group flex flex-col items-center gap-2 transition-transform active:scale-95 bg-transparent border-none p-0 cursor-pointer"
            >
              <div className={`flex h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-slate-50 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-colors dark:border-slate-800/80 dark:bg-slate-900 dark:shadow-none ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white'}`}>
                <item.icon
                  className={`h-7 w-7 ${item.color ? item.color : "text-slate-800 dark:text-slate-300"}`}
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-center text-[11px] leading-none font-medium text-slate-700 dark:text-slate-400">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
            <div className="px-4">
               <h1 className="text-[24px] font-semibold">Jlpt darajalari</h1>
            </div>
            {/* Mobil uchun faqat JLPT yoki tanlangan Tab ko'rinishi */}
            {activeTab === 'jlpt' && <JlptLevels />}
            {activeTab === 'games' && <GamesList />}
            {activeTab === 'dictionary' && <Lugat />}
        </div>
      </div>

      {/* 💻 DESKTOP KO'RINISh */}
      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full snap-x justify-start overflow-x-auto rounded-xl border border-transparent bg-slate-200/70 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
            <TabsTrigger
              value="jlpt"
              onClick={() => setActiveTab("jlpt")}
              className="flex shrink-0 snap-start items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
            >
              <Layers className="h-4 w-4" /> JLPT Darajalari
            </TabsTrigger>

            {MENU_ITEMS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                // onClick o'rniga yozilgan funksiya ishlaydi
                onClick={(e) => {
                  e.preventDefault(); 
                  handleTabClick(tab);
                }}
                className="flex shrink-0 snap-start items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
              >
                <tab.icon className={`h-4 w-4 ${tab.color ? tab.color : ""}`} />{" "}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* BANNER VA KALENDAR TAB KONTENTI */}
          <TabsContent value="jlpt" className="mt-4 w-full outline-none">
            <div className="flex w-full flex-row items-start gap-4">
              <div className="w-full min-w-0 flex-1 overflow-hidden">
                <BannerCarousel />
              </div>
            </div>
            <div className="mt-6">
              <JlptLevels />
            </div>
          </TabsContent>

          {/* Qolgan Tablar o'z joyida qoladi */}
          <TabsContent value="games" className="mt-4 w-full outline-none">
            <GamesList />
          </TabsContent>

          <TabsContent value="dictionary" className="mt-4 w-full outline-none">
            <Lugat />
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  )
}