import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>

      <AdminSidebar />

      <SidebarInset>
        <main className="p-6">
          {children}
        </main>
      </SidebarInset>

    </SidebarProvider>
  )
}