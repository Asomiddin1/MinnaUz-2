import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/sidebar/admin-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>

      <AdminSidebar />

      <SidebarInset>

        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
        </header>

        <main className="p-6">
          {children}
        </main>

      </SidebarInset>

    </SidebarProvider>
  )
}