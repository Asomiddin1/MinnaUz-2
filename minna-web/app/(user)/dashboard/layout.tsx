"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { UserSidebar } from "../../../components/sidebar/user-sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home, PlaySquare, GraduationCap, Gem, Sun, Moon, Globe, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

    const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(path => path !== '')
    
    const breadcrumbs = paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/')
      const label = path
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
      
      return { href, label }
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] w-full bg-[#F8FAFC] dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
        
        {/* ✨ TARQOQ KICHIK DOIRALAR */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[5%] left-[5%] w-[120px] h-[120px] rounded-full bg-[#E0EFFF] dark:bg-blue-900/20 opacity-80 blur-sm" />
          <div className="absolute top-[10%] right-[8%] w-[100px] h-[100px] rounded-full bg-[#F3E8FF] dark:bg-purple-900/20 opacity-90 blur-sm" />
          <div className="absolute top-[2%] left-[45%] w-[70px] h-[70px] rounded-full bg-[#EDE9FE] dark:bg-indigo-900/20 opacity-80 blur-sm" />
          
          <div className="absolute top-[35%] left-[15%] w-[80px] h-[80px] rounded-full bg-[#DBEAFE] dark:bg-blue-800/20 opacity-70 blur-sm" />
          <div className="absolute top-[45%] right-[12%] w-[140px] h-[140px] rounded-full bg-[#EDE9FE] dark:bg-indigo-800/20 opacity-80 blur-sm" />
          <div className="absolute top-[50%] left-[48%] w-[90px] h-[90px] rounded-full bg-[#E0EFFF] dark:bg-sky-900/20 opacity-70 blur-sm" />
          
          <div className="absolute bottom-[15%] left-[20%] w-[110px] h-[110px] rounded-full bg-[#F5F3FF] dark:bg-violet-900/20 opacity-90 blur-sm" />
          <div className="absolute bottom-[10%] right-[25%] w-[130px] h-[130px] rounded-full bg-[#EFF6FF] dark:bg-blue-900/20 opacity-80 blur-sm" />
          <div className="absolute bottom-[5%] left-[55%] w-[85px] h-[85px] rounded-full bg-[#DBEAFE] dark:bg-sky-900/20 opacity-70 blur-sm" />
          <div className="absolute bottom-[25%] right-[5%] w-[60px] h-[60px] rounded-full bg-[#E0EFFF] dark:bg-indigo-900/20 opacity-90 blur-sm" />
        </div>

        {/* Kompyuter uchun Sidebar */}
        <div className="hidden md:block h-full z-20">
          <UserSidebar />
        </div>
        <main className="flex-1 flex flex-col w-full h-full relative z-10 overflow-y-auto pb-[90px] md:pb-0">
          
             <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-[#F8FAFC]/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 mb-3 dark:border-slate-800/60 hidden md:flex">
            
            {/* Qidiruv qismi */}
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"  
                placeholder="Qidirish..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 transition-all shadow-sm"
              />
            </div>

            {/* O'ng tomon: Til va Dark Mode */}
            <div className="flex items-center gap-3">
              
              {/* Til o'zgartirish */}
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-full transition-all shadow-sm hover:shadow">
                <Globe className="w-4 h-4" />
                <span>UZ</span>
              </button>

              {/* Chiziqcha (Separator) */}
              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all flex items-center justify-center w-9 h-9 dark:bg-slate-900"
                aria-label="Toggle Dark Mode"
              >
                {mounted && (
                  theme === "dark" ? (
                    <Sun className="w-4 h-4 text-white" /> 
                  ) : (
                    <Moon className="w-4 h-4 text-black" />
                  )
                )}
              </button>

            </div>
          </header>

        
          <div className="px-4">
            {children}
          </div>

        </main>

        {/* 📱 TELEFON UCHUN PASTKI TAB BAR 📱 */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100/80 dark:border-slate-800/80 rounded-t-[24px] pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-around h-[72px] px-2">
            
            <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/dashboard') ? 'bg-blue-50/80 dark:bg-blue-500/20' : 'bg-transparent'}`}>
                <Home className="w-6 h-6" strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold leading-none">Asosiy</span>
            </Link>

            <Link href="/dashboard/video" className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${isActive('/dashboard/video') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/dashboard/video') ? 'bg-blue-50/80 dark:bg-blue-500/20' : 'bg-transparent'}`}>
                <PlaySquare className="w-6 h-6" strokeWidth={isActive('/dashboard/video') ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold leading-none">Video</span>
            </Link>

            <Link href="/dashboard/jlpt" className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${isActive('/dashboard/jlpt') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/dashboard/jlpt') ? 'bg-blue-50/80 dark:bg-blue-500/20' : 'bg-transparent'}`}>
                <GraduationCap className="w-6 h-6" strokeWidth={isActive('/dashboard/jlpt') ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold leading-none">JLPT</span>
            </Link>

            <Link href="/dashboard/premium" className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${isActive('/dashboard/premium') ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/dashboard/premium') ? 'bg-amber-50/80 dark:bg-amber-500/20' : 'bg-transparent'}`}>
                <Gem className="w-6 h-6" strokeWidth={isActive('/dashboard/premium') ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold leading-none">Premium</span>
            </Link>

          </div>
        </nav>

      </div>
    </SidebarProvider>
  )
}