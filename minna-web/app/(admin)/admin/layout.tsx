import { AdminSidebar } from "@/components/sidebar/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Yon panel (Desktopda doim turadi, mobilda yashirinadi) */}
      <AdminSidebar />

      {/* Asosiy qism */}
      <div className="flex w-full flex-1 flex-col">
        
        {/* MOBIL UCHUN HEADER VA OCHISH TUGMASI (Faqat telefonda chiqadi) */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <SidebarTrigger /> {/* <--- Shu tugma yon panelni ochib beradi */}
          <span className="font-semibold">MinnaUz Admin</span>
        </header>

        {/* Asosiy sahifa (Sahifalar shu yerda render bo'ladi) */}
        <main className="flex-1 overflow-auto bg-gray-50/50">
          {children}
        </main>
        
      </div>
    </SidebarProvider>
  );
}