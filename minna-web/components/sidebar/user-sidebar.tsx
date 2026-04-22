"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Home,
  GraduationCap,
  MonitorPlay,
  Gem,
  User,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { ModeToggle } from "../mode-toggle"
import { useTheme } from "next-themes"

export function UserSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const { theme, setTheme } = useTheme()

  const menuItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Videolar", href: "/dashboard/video", icon: MonitorPlay },
    { name: "Jlpt", href: "/dashboard/jlpt", icon: GraduationCap },
    { name: "Premium", href: "/dashboard/premium", icon: Gem },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ]

  return (
    <Sidebar
      collapsible="icon"
      // Yorug' rejim uchun gradient, Dark mode uchun esa Telegram-style slate-900 foni
      className="border-r border-slate-200 bg-gradient-to-b from-[#f5f7fa] to-[#e0e4ea] dark:border-slate-800 dark:bg-slate-900 dark:bg-none"
    >
      <SidebarContent className="flex h-full flex-col overflow-hidden">
        {/* LOGO VA TOGGLE (to‘liq holat) */}
        <div
          className={`mb-2 flex items-center p-6 ${
            collapsed ? "justify-center px-2" : "justify-between"
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-400 text-lg font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                🐱
              </div>
              <span className="text-sm font-bold tracking-widest text-slate-900 transition-opacity dark:text-slate-100">
                MinnaUz
              </span>
            </div>
          ) : (
            <div className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              🐱
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 ${
              collapsed ? "hidden" : "block"
            }`}
          >
            <PanelLeftClose size={20} />
          </button>
        </div>


        {/* YIG‘ILGAN HOLATDA OCHISH TUGMASI (MARKAZDA) */}
        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mb-4 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <PanelLeft size={20} />
          </button>
        )}

        {/* ASOSIY MENYU */}
        <SidebarMenu
          className={`flex-1 space-y-2 px-4 ${
            collapsed ? "items-center px-2" : ""
          }`}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.name} className="w-full">
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link
                    href={item.href}
                    className={`relative flex h-11 items-center rounded-xl transition-all duration-200 ${
                      collapsed
                        ? "w-11 justify-center px-0"
                        : "w-full gap-3 px-4"
                    } ${
                      isActive
                        // Faol holat uchun ranglar (Light va Dark)
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:shadow-none"
                        // Faol bo'lmagan holat hover effektlari
                        : "text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon
                      className={`shrink-0 transition-colors ${
                        collapsed ? "h-6 w-6" : "h-5 w-5"
                      } ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    />
                    {!collapsed && (
                      <span
                        className={`font-medium ${
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) 
          })}
         {collapsed && <ModeToggle />}
         {!collapsed && <div className="px-2 flex items-center gap-1">
            <ModeToggle />
            <span onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-[14px] cursor-pointer">
              {theme === "dark" ? "Tungi rejim":"Kundizgi rejim"}
            </span>
          </div>}
        </SidebarMenu>

        {/* PASTKI PROFIL */}
        <div className=" mb-4 mt-auto border-t border-slate-200/60 p-4 transition-all dark:border-slate-800/80">
          <div
            className={`flex items-center pt-4 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-300 dark:border-slate-700 dark:bg-slate-800" />
            {!collapsed && (
              <span className="whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-200">
                Asomiddin Qarshiyev
              </span>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}