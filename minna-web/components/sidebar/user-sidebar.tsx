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
import { Skeleton } from "@/components/ui/skeleton"

import {
  Home,
  GraduationCap,
  MonitorPlay,
  Gem,
  User,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react"

import { useTheme } from "next-themes"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

export function UserSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  const { data: session, status } = useSession()

  const menuItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Videolar", href: "/dashboard/video", icon: MonitorPlay },
    { name: "Jlpt", href: "/dashboard/jlpt", icon: GraduationCap },
    { name: "Premium", href: "/dashboard/premium", icon: Gem },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ]

  const userName = session?.user?.name || "Guest User"
  const userEmail = session?.user?.email || ""

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 bg-gradient-to-b from-[#f5f7fa] to-[#e0e4ea] dark:border-slate-800 dark:bg-slate-900 dark:bg-none"
    >
      <SidebarContent className="flex h-full flex-col overflow-hidden">
        {/* LOGO */}
        <div
          className={`mb-2 flex items-center p-6 ${collapsed ? "justify-center px-2" : "justify-between"}`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Image src={require("./logo.png")} alt="Logo" width={32} height={32} />
              <span className="text-sm font-bold tracking-widest text-slate-900 dark:text-slate-100">
                MinnaUz
              </span>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Image src={require("./logo.png")} alt="Logo" width={32} height={32} />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`text-slate-400 hover:text-slate-600 dark:text-slate-500 ${collapsed ? "hidden" : "block"}`}
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        {/* COLLAPSED TOGGLE */}
        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mb-4 text-slate-400 hover:text-slate-600"
          >
            <PanelLeft size={20} />
          </button>
        )}

        {/* MENU */}
        <SidebarMenu
          className={`flex-1 space-y-2 px-4 ${collapsed ? "items-center px-2" : ""}`}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link
                    href={item.href}
                    className={`flex h-11 items-center rounded-xl transition-all ${collapsed ? "w-11 justify-center" : "w-full gap-3 px-4"} ${
                      isActive
                        ? "border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {/* ADMIN PANEL BUTTON - ROLE ORQALI TEKSHIRISH */}
        {session?.user?.role === "admin" && (
          <Link href={"/admin"} className="flex justify-center px-4 py-2">
            <button className="w-full cursor-pointer rounded-2xl bg-[#4b4b4b] hover:bg-gray-700 transition-colors py-1.5 text-white text-sm font-medium">
              {collapsed ? "A" : "Admin Panel"}
            </button>
          </Link>
        )}

        {/* USER INFO */}
        <div className="mt-auto border-t border-slate-200/60 p-4 dark:border-slate-800/80">
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            {/* Loading holatida avatar skeleton */}
            {status === "loading" ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : // Avatar (yuklanganda)
            session?.user?.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                className="h-9 w-9 rounded-full border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 font-bold text-white">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {!collapsed && (
              <div className="flex flex-col space-y-1.5">
                {status === "loading" ? (
                  // Skeleton matnlar
                  <>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </>
                ) : (
                  // Haqiqiy ma'lumotlar
                  <>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {userName}
                    </span>
                    {userEmail && (
                      <span className="text-xs text-slate-500">
                        {userEmail}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="border-t border-slate-200/60 px-2 pb-3 dark:border-slate-800/80">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className={`flex h-10 w-full items-center rounded-xl text-red-500 hover:bg-red-500/10 dark:text-red-400 ${collapsed ? "justify-center" : "gap-3 px-4"}`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}