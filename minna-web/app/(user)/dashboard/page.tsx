"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { BannerCarousel } from "@/components/user-components/banner-carousel"
import { StreakCalendar } from "@/components/user-components/streak-calendar"

// Ma'lumotlarni bitta joyda saqlaymiz
const MENU_ITEMS = [
  {
    id: "dictionary",
    label: "Lug'at",
    icon: Copy,
    href: "/dashboard/dictionary",
  },
  { id: "games", label: "O'yinlar", icon: Gamepad2, href: "/dashboard/games" },
  { id: "books", label: "Kitoblar", icon: BookOpen, href: "/dashboard/books" },
  {
    id: "kanji",
    label: "Kanji",
    icon: GraduationCap,
    href: "/dashboard/kanji",
  },
  { id: "shop", label: "Do'kon", icon: ShoppingCart, href: "/dashboard/shop" },
  {
    id: "translator",
    label: "Tarjimon",
    icon: Languages,
    href: "/dashboard/translator",
  },
  {
    id: "ai",
    label: "Sun'iy intellekt",
    icon: Sparkles,
    href: "/dashboard/ai",
  },
  {
    id: "premium",
    label: "Premium",
    icon: Gem,
    href: "/dashboard/premium",
    color: "text-amber-500 dark:text-amber-400",
  },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  return (
    <div className="w-full">
      <div className="space-y-6 md:hidden">
        {/* 0. PROFIL VA TANGALAR */}
        <header className="flex items-center justify-between pb-1">
          {/* Chap tomon: Avatar va Ism */}
          <div className="flex items-center gap-3">
            <div className="h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-blue-100 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-800">
              {/* O'zingizning haqiqiy rasmingiz yoki avatarni shu yerga qo'yasiz */}
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
                {session?.user?.name}
              </span>
            </div>
          </div>

          {/* O'ng tomon: Tangalar */}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-100/60 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-colors dark:border-slate-700/60 dark:bg-slate-800/80">
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#FFB800] text-[10px] text-white shadow-inner">
              🪙
            </div>
            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
              1000
            </span>
          </div>
        </header>

        {/* 1. YUQORI BANNER */}
        <div className="flex flex-col items-center gap-3">
          <div className="group relative h-[150px] w-full overflow-hidden rounded-[24px] bg-slate-900 shadow-sm">
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-red-800/80 to-slate-900/90 dark:from-red-900/90" />
            <img
              src="https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000&auto=format&fit=crop"
              alt="Japan Background"
              className="absolute inset-0 h-full w-full object-cover opacity-60 dark:opacity-40"
            />

            <div className="relative z-20 flex h-full flex-col justify-end p-5 text-white">
              <h2 className="mb-1 text-[22px] font-bold tracking-wide text-white">
                New users
              </h2>
              <p className="w-[80%] text-[12px] leading-snug font-medium text-white/90">
                Foydalanuvchilarni soni sekin asta ko'paymoqda!
              </p>
            </div>
          </div>

          {/* Banner ostidagi nuqtalar */}
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-4 rounded-full bg-blue-500 dark:bg-blue-600" />
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 transition-colors dark:bg-slate-700" />
          </div>
        </div>

        {/* 2. ASOSIY MENYU GRID (8 ta tugma) */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-5">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
            >
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-slate-50 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-colors dark:border-slate-800/80 dark:bg-slate-900 dark:shadow-none">
                <item.icon
                  className={`h-7 w-7 ${item.color ? item.color : "text-slate-800 dark:text-slate-300"}`}
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-center text-[11px] leading-none font-medium text-slate-700 dark:text-slate-400">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* 3. JLPT DARAJALARI KARTASI */}
        <div className="space-y-3 pt-2">
          <h3 className="px-1 text-[18px] font-bold text-slate-900 transition-colors dark:text-white">
            JLPT darajalari
          </h3>

          <div className="relative h-[180px] w-full overflow-hidden rounded-[28px] border border-white bg-gradient-to-br from-blue-100 via-teal-50 to-indigo-100 shadow-sm transition-colors dark:border-slate-800 dark:from-blue-900/30 dark:via-teal-900/20 dark:to-indigo-900/30">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <span className="mb-2 rounded-full bg-white/60 px-4 py-1.5 text-xs font-bold text-indigo-500 backdrop-blur-sm transition-colors dark:bg-slate-900/60 dark:text-indigo-300">
                Minna.uz
              </span>
              <h4 className="text-2xl leading-tight font-black text-indigo-900 transition-colors dark:text-indigo-100">
                Hiragana
                <br />
                Katakana
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden  md:block">
        <Tabs defaultValue="jlpt" className="w-full">
          <TabsList className="mb-6 flex w-full snap-x justify-start overflow-x-auto rounded-xl border border-transparent bg-slate-200/70 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
            <TabsTrigger
              value="jlpt"
              className="flex shrink-0 snap-start items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
            >
              <Layers className="h-4 w-4" /> JLPT Darajalari
            </TabsTrigger>

            {MENU_ITEMS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex shrink-0 snap-start items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
              >
                <tab.icon className={`h-4 w-4 ${tab.color ? tab.color : ""}`} />{" "}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* TAB KONTENTLARI */}
          <TabsContent value="jlpt" className=" w-full">
            {/* flex-col - kichik ekranda ketma-ket, lg:flex-row - katta ekranda yonma-yon. gap-6 orasidagi ochiq joy */}
            <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
              {/* Banner qismi asosan kattaroq joyni egallashi uchun flex-1 beramiz */}
              <div className="w-full flex-1 overflow-hidden">
                <BannerCarousel />
              </div>

              {/* Kalendar qismi o'zining asl o'lchamini saqlab qolishi uchun */}
              <div className="flex w-full shrink-0 justify-center lg:w-auto">
                <StreakCalendar />
              </div>
            </div>
          </TabsContent>
          {MENU_ITEMS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card className="border-none shadow-sm transition-colors dark:bg-slate-900 dark:text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon
                      className={`h-6 w-6 ${tab.color ? tab.color : "text-blue-600 dark:text-blue-400"}`}
                    />
                    {tab.label}
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Ushbu bo'lim {tab.label.toLowerCase()} uchun ajratilgan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300">
                    {tab.label} bo'limi kontenti shu yerda shakllantiriladi.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
