"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { UserSidebar } from "../../../components/sidebar/user-sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home, PlaySquare, GraduationCap, Gem } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
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
          
          {/* 🍞 BREADCRUMBS */}
          <div className="px-6 pt-4 pb-2 hidden md:block">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                <span>Bosh sahifa</span>
              </Link>
              
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-slate-900 dark:text-slate-200 font-medium">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 🖥️ ASOSIY SAHIFA KONTENTI */}
          <div className="p-4 md:p-6 pt-2">
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