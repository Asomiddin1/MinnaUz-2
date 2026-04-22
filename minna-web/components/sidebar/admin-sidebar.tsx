"use client" // usePathname ishlatganimiz uchun bu shart

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menyular ro'yxati (kodni toza saqlash uchun alohida yozamiz)
const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Foydalanuvchilar",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Sozlamalar",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      {/* 1. Sidebar Tepa qismi (Logotip yoki Sarlavha) */}
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
      </SidebarHeader>

      {/* 2. Asosiy Menyular */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Asosiy menyu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Hozirgi URL menyu URL iga tengmi yoki yo'qmi tekshiramiz
                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4 mr-2" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Sidebar Pastki qismi (Chiqib ketish tugmasi) */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Tizimdan chiqish</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}