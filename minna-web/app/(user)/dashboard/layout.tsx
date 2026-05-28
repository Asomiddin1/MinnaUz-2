"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { UserSidebar } from "../../../components/sidebar/user-sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  Home,
  PlaySquare,
  GraduationCap,
  Gem,
  Sun,
  Moon,
  Globe,
  Search,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/")

  return (
    <SidebarProvider>
      {/* Asosiy fon rangi dark rejimda navbar bilan bir xil qilindi: dark:bg-slate-900 */}
      <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[#F8FAFC] transition-colors duration-300 dark:bg-slate-900">
        {/* Kompyuter uchun Sidebar */}
        <div className="z-20 hidden h-full md:block">
          <UserSidebar />
        </div>

        <main className="relative z-10 flex h-full w-full flex-1 flex-col overflow-y-auto pb-[90px] md:pb-0">
          {/* HEADER: dark rejimda fon bilan bir xil (slate-900/80) */}
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-md md:flex dark:border-slate-800 dark:bg-slate-900/80">
            {/* Qidiruv qismi */}
            <div className="group relative w-full max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-blue-400" />
              <input
                type="text"
                placeholder="Qidirish..."
                className="w-full rounded-full border border-slate-200 bg-[#F8FAFC] py-2 pr-4 pl-10 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-blue-500/30"
              />
            </div>

            {/* O'ng tomon: Til va Dark Mode */}
            <div className="flex items-center gap-3">
              {/* Til o'zgartirish */}
              <button className="flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800">
                <Globe className="h-4 w-4" />
                <span>UZ</span>
              </button>

              {/* Chiziqcha (Separator) */}
              <div className="mx-1 h-5 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 p-2 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                aria-label="Toggle Dark Mode"
              >
                {mounted &&
                  (theme === "dark" ? (
                    <Sun className="h-4 w-4 text-slate-200" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-400" />
                  ))}
              </button>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </main>

        {/* 📱 TELEFON UCHUN PASTKI TAB BAR 📱 */}
        <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 rounded-t-[24px] border-t border-slate-100/80 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex h-[72px] items-center justify-around px-2">
            <Link
              href="/dashboard"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${isActive("/dashboard") ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
            >
              <div
                className={`rounded-full p-2 transition-all duration-300 ${isActive("/dashboard") ? "bg-blue-50/80 dark:bg-blue-500/20" : "bg-transparent"}`}
              >
                <Home
                  className="h-6 w-6"
                  strokeWidth={isActive("/dashboard") ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px] leading-none font-semibold">
                Asosiy
              </span>
            </Link>

            <Link
              href="/dashboard/video"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${isActive("/dashboard/video") ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
            >
              <div
                className={`rounded-full p-2 transition-all duration-300 ${isActive("/dashboard/video") ? "bg-blue-50/80 dark:bg-blue-500/20" : "bg-transparent"}`}
              >
                <PlaySquare
                  className="h-6 w-6"
                  strokeWidth={isActive("/dashboard/video") ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px] leading-none font-semibold">
                Video
              </span>
            </Link>

            <Link
              href="/dashboard/jlpt"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${isActive("/dashboard/jlpt") ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
            >
              <div
                className={`rounded-full p-2 transition-all duration-300 ${isActive("/dashboard/jlpt") ? "bg-blue-50/80 dark:bg-blue-500/20" : "bg-transparent"}`}
              >
                <GraduationCap
                  className="h-6 w-6"
                  strokeWidth={isActive("/dashboard/jlpt") ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px] leading-none font-semibold">
                JLPT
              </span>
            </Link>

            <Link
              href="/dashboard/premium"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${isActive("/dashboard/premium") ? "text-amber-500 dark:text-amber-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
            >
              <div
                className={`rounded-full p-2 transition-all duration-300 ${isActive("/dashboard/premium") ? "bg-amber-50/80 dark:bg-amber-500/20" : "bg-transparent"}`}
              >
                <Gem
                  className="h-6 w-6"
                  strokeWidth={isActive("/dashboard/premium") ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px] leading-none font-semibold">
                Premium
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </SidebarProvider>
  )
}
