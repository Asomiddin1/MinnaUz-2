"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Gamepad2, BookOpen, GraduationCap, ShoppingCart, Languages, Sparkles, Gem, Layers } from "lucide-react"
import { useSession } from "next-auth/react"

// Ma'lumotlarni bitta joyda saqlaymiz
const MENU_ITEMS = [
  { id: "dictionary", label: "Lug'at", icon: Copy, href: "/dashboard/dictionary" },
  { id: "games", label: "O'yinlar", icon: Gamepad2, href: "/dashboard/games" },
  { id: "books", label: "Kitoblar", icon: BookOpen, href: "/dashboard/books" },
  { id: "kanji", label: "Kanji", icon: GraduationCap, href: "/dashboard/kanji" },
  { id: "shop", label: "Do'kon", icon: ShoppingCart, href: "/dashboard/shop" },
  { id: "translator", label: "Tarjimon", icon: Languages, href: "/dashboard/translator" },
  { id: "ai", label: "Sun'iy intellekt", icon: Sparkles, href: "/dashboard/ai" },
  { id: "premium", label: "Premium", icon: Gem, href: "/dashboard/premium", color: "text-amber-500 dark:text-amber-400" },
]

export default function DashboardPage() {
   const { data: session, status } = useSession()
  return (
    <div className="w-full">
      
      {/* ========================================================= */}
      {/* 📱 MOBILE VIEW: XUDDI RASMDAGI KABI (md:hidden)           */}
      {/* ========================================================= */}
      <div className="md:hidden space-y-6">
        
        {/* 0. PROFIL VA TANGALAR */}
        <header className="flex items-center justify-between pb-1">
          {/* Chap tomon: Avatar va Ism */}
          <div className="flex items-center gap-3">
            <div className="w-[46px] h-[46px] rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-blue-100 dark:bg-slate-800 flex-shrink-0 transition-colors">
              {/* O'zingizning haqiqiy rasmingiz yoki avatarni shu yerga qo'yasiz */}
              {session?.user?.image && <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">こんにちは</span>
              <span className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">{session?.user?.name }</span>
            </div>
          </div>
          
          {/* O'ng tomon: Tangalar */}
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-100/60 dark:border-slate-700/60 transition-colors">
            <div className="w-[18px] h-[18px] rounded-full bg-[#FFB800] flex items-center justify-center text-white text-[10px] shadow-inner">
              🪙
            </div>
            <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200">1000</span>
          </div>
        </header>

        {/* 1. YUQORI BANNER */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-full h-[150px] rounded-[24px] overflow-hidden shadow-sm bg-slate-900 group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-800/80 dark:from-red-900/90 to-slate-900/90 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000&auto=format&fit=crop" 
              alt="Japan Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-40"
            />
            
            <div className="relative z-20 p-5 flex flex-col justify-end h-full text-white">
              <h2 className="text-[22px] font-bold mb-1 tracking-wide text-white">New users</h2>
              <p className="text-[12px] text-white/90 font-medium leading-snug w-[80%]">
                Foydalanuvchilarni soni sekin asta ko'paymoqda!
              </p>
            </div>
          </div>
          
          {/* Banner ostidagi nuqtalar */}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-1.5 rounded-full bg-blue-500 dark:bg-blue-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors" />
          </div>
        </div>

        {/* 2. ASOSIY MENYU GRID (8 ta tugma) */}
        <div className="grid grid-cols-4 gap-y-5 gap-x-2">
          {MENU_ITEMS.map((item) => (
            <Link 
              key={item.id} 
              href={item.href}
              className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
            >
              <div className="flex items-center justify-center w-[68px] h-[68px] rounded-[20px] bg-white dark:bg-slate-900 shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-50 dark:border-slate-800/80 transition-colors">
                <item.icon 
                  className={`w-7 h-7 ${item.color ? item.color : 'text-slate-800 dark:text-slate-300'}`} 
                  strokeWidth={1.5} 
                />
              </div>
              <span className="text-[11px] text-center font-medium text-slate-700 dark:text-slate-400 leading-none">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* 3. JLPT DARAJALARI KARTASI */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[18px] font-bold text-slate-900 dark:text-white px-1 transition-colors">JLPT darajalari</h3>
          
          <div className="relative w-full h-[180px] rounded-[28px] overflow-hidden bg-gradient-to-br from-blue-100 via-teal-50 to-indigo-100 dark:from-blue-900/30 dark:via-teal-900/20 dark:to-indigo-900/30 shadow-sm border border-white dark:border-slate-800 transition-colors">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-indigo-500 dark:text-indigo-300 mb-2 transition-colors">Minna.uz</span>
                <h4 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 leading-tight transition-colors">Hiragana<br/>Katakana</h4>
             </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 💻 DESKTOP VIEW: KOMPYUTER UCHUN TABS (hidden md:block)   */}
      {/* ========================================================= */}
      <div className="hidden md:block space-y-6">
        <Tabs defaultValue="jlpt" className="w-full">
          
          <TabsList className="flex w-full justify-start bg-slate-200/70 dark:bg-slate-800/50 py-1.5 px-2 rounded-xl overflow-x-auto snap-x mb-6 border border-transparent dark:border-slate-800">
            <TabsTrigger 
              value="jlpt" 
              className="py-2 px-4 shrink-0 snap-start rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> JLPT Darajalari
            </TabsTrigger>
            
            {MENU_ITEMS.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="py-2 px-4 shrink-0 snap-start rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 transition-all flex items-center gap-2"
              >
                <tab.icon className={`w-4 h-4 ${tab.color ? tab.color : ''}`} /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* TAB KONTENTLARI */}
          <TabsContent value="jlpt">
            <Card className="border-none shadow-sm dark:bg-slate-900 dark:text-white transition-colors">
              <CardHeader>
                <CardTitle>JLPT Darajalari</CardTitle>
                <CardDescription className="dark:text-slate-400">N5 dan N1 gacha bo'lgan darajalar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">JLPT bo'yicha to'liq darslar kontenti bu yerda joylashadi.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {MENU_ITEMS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card className="border-none shadow-sm dark:bg-slate-900 dark:text-white transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon className={`w-6 h-6 ${tab.color ? tab.color : 'text-blue-600 dark:text-blue-400'}`} />
                    {tab.label}
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">Ushbu bo'lim {tab.label.toLowerCase()} uchun ajratilgan.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300">{tab.label} bo'limi kontenti shu yerda shakllantiriladi.</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

        </Tabs>
      </div>

    </div>
  )
}