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

const MENU_ITEMS = [
  { id: "dictionary", label: "Lug'at", icon: Copy, href: "/dashboard/dictionary" },
  { id: "games", label: "O'yinlar", icon: Gamepad2, href: "/dashboard/games" },
  { id: "books", label: "Kitoblar", icon: BookOpen, href: "/dashboard/books" },
  { id: "kanji", label: "Kanji", icon: GraduationCap, href: "/dashboard/kanji" },
  { id: "shop", label: "Do'kon", icon: ShoppingCart, href: "/dashboard/shop" },
  { id: "translator", label: "Tarjimon", icon: Languages, href: "/dashboard/translator" },
  { id: "ai", label: "Sun'iy intellekt", icon: Sparkles, href: "/dashboard/ai" },
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
      {/* 📱 MOBIL KO'RINISh */}
      <div className="space-y-6 md:hidden pt-2">
        <header className="flex items-center justify-between pb-1">
          <Link href={'/dashboard/profile'} className="flex items-center gap-3">
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

        {/* MOBIL UCHUN KARUSEL BANNER */}
        <div className="w-full">
          <BannerCarousel />
        </div>

        {/* MENU */}
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

        {/* MOBIL UCHUN KALENDAR VA JLPT */}
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <h3 className="px-1 mb-3 text-[18px] font-bold text-slate-900 transition-colors dark:text-white">
              Sizning natijalaringiz
            </h3>
            <StreakCalendar />
          </div>

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
      </div>

      {/* 💻 DESKTOP KO'RINISh */}
      <div className="hidden md:block">
        <Tabs defaultValue="jlpt" className="w-full">
          <TabsList className="flex w-full snap-x justify-start overflow-x-auto rounded-xl border border-transparent bg-slate-200/70 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
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

          {/* BANNER VA KALENDAR TAB KONTENTI (Desktop) */}
          <TabsContent value="jlpt" className="w-full mt-4">
            {/* O'zgarish shu yerda: flex-row qat'iy qo'yildi va hech qachon pastga tushmaydi */}
            <div className="flex flex-row items-start gap-4 w-full">
              <div className="flex-1 w-full min-w-0">
                <BannerCarousel />
              </div>
              
              {/* O'zgarish: md (kichik noutbuk) da yashiriladi, lg da 90% kichikroq bo'lib chiqadi, xl da to'liq 100% o'lchamda chiqadi */}
              <div className="hidden lg:block shrink-0 origin-top lg:scale-90 xl:scale-100 transition-transform duration-300">
                <StreakCalendar />
              </div>
            </div>
          </TabsContent>

          {/* QOLGAN TABLAR */}
          {MENU_ITEMS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
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