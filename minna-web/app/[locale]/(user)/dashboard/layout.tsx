"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/sidebar/user-sidebar"
import { Link, usePathname } from "@/src/i18n/navigation"
import {
  Home,
  PlaySquare,
  GraduationCap,
  Gem,
  Sun,
  Moon,
  Monitor,
  Search,
  Check,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import LanguageSwitcher from "@/components/minna-uz/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const t = useTranslations("Dashboard") // Dashboard tarjimalarini yuklaymiz

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/")

  // Tema variantlari
  const themeOptions = [
    { value: "light", label: t("light"), icon: Sun },
    { value: "dark", label: t("dark"), icon: Moon },
    { value: "system", label: t("system"), icon: Monitor },
  ]

  return (
    <SidebarProvider>
      <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[#F8FAFC] transition-colors duration-300 dark:bg-slate-900">
        <div className="z-20 hidden h-full md:block">
          <UserSidebar />
        </div>

        <main className="relative z-10 flex h-full w-full flex-1 flex-col overflow-y-auto pb-[90px] md:pb-0">
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-md md:flex dark:border-slate-800 dark:bg-slate-900/80">
            <div className="group relative w-full max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-blue-400" />
              <input
                type="text"
                placeholder={t("search")} // Dinamik tarjima
                className="w-full rounded-full border border-slate-200 bg-[#F8FAFC] py-2 pr-4 pl-10 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              <div className="mx-1 h-5 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

              {/* TEMA TANLASH (shadcn DropdownMenu) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                    aria-label="Toggle theme"
                  >
                    {mounted &&
                      (theme === "dark" ? (
                        <Sun className="h-4 w-4 text-slate-200" />
                      ) : (
                        <Moon className="h-4 w-4 text-slate-500" />
                      ))}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setTheme(value)}
                      className="flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      {mounted && theme === value && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </main>

        {/* MOBIL TAB BAR */}
        <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 rounded-t-[24px] border-t border-slate-100/80 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex h-[72px] items-center justify-around px-2">

            {/* Home */}
            <Link
              href="/dashboard"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${
                isActive("/dashboard") ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
              }`}
            >
              <div
                className={`rounded-full p-2 ${
                  isActive("/dashboard") ? "bg-blue-50/80 dark:bg-blue-500/20" : ""
                }`}
              >
                <Home className="h-6 w-6" strokeWidth={isActive("/dashboard") ? 2.5 : 2} />
              </div>
              <span className="text-[10px] leading-none font-semibold">{t("home")}</span>
            </Link>

            {/* Video */}
            <Link
              href="/dashboard/video"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${
                isActive("/dashboard/video") ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
              }`}
            >
              <div
                className={`rounded-full p-2 ${
                  isActive("/dashboard/video") ? "bg-blue-50/80 dark:bg-blue-500/20" : ""
                }`}
              >
                <PlaySquare className="h-6 w-6" strokeWidth={isActive("/dashboard/video") ? 2.5 : 2} />
              </div>
              <span className="text-[10px] leading-none font-semibold">{t("video")}</span>
            </Link>

            {/* JLPT */}
            <Link
              href="/dashboard/jlpt"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${
                isActive("/dashboard/jlpt") ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
              }`}
            >
              <div
                className={`rounded-full p-2 ${
                  isActive("/dashboard/jlpt") ? "bg-blue-50/80 dark:bg-blue-500/20" : ""
                }`}
              >
                <GraduationCap className="h-6 w-6" strokeWidth={isActive("/dashboard/jlpt") ? 2.5 : 2} />
              </div>
              <span className="text-[10px] leading-none font-semibold">{t("jlpt")}</span>
            </Link>

            {/* Premium */}
            <Link
              href="/dashboard/premium"
              className={`flex w-full flex-col items-center justify-center gap-1 transition-all ${
                isActive("/dashboard/premium") ? "text-amber-500 dark:text-amber-400" : "text-slate-400"
              }`}
            >
              <div
                className={`rounded-full p-2 ${
                  isActive("/dashboard/premium") ? "bg-amber-50/80 dark:bg-amber-500/20" : ""
                }`}
              >
                <Gem className="h-6 w-6" strokeWidth={isActive("/dashboard/premium") ? 2.5 : 2} />
              </div>
              <span className="text-[10px] leading-none font-semibold">{t("premium")}</span>
            </Link>

          </div>
        </nav>
      </div>
    </SidebarProvider>
  )
}
