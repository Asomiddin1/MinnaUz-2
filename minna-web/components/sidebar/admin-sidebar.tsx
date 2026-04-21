import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import Link from "next/link"

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent>

        <SidebarMenu>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/dashboard">Dashboard</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/users">Users</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/settings">Settings</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>

      </SidebarContent>
    </Sidebar>
  )
}