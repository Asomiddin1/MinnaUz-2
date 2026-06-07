import JapanRPGMap from "@/components/user-components/home-fuctions/games/japan-map-rpg/JapanMap";

export default function MapPage() {
  return (
    /**
     * flex-1: Navbar va Sidebar-dan qolgan bo'shliqni to'ldiradi.
     * h-full: Ota element balandligini oladi.
     * relative: Ichidagi xarita uchun ramka bo'ladi.
     */
    <main className="relative flex-1 w-full h-full overflow-hidden bg-white dark:bg-slate-900 touch-none overscroll-none">
       <JapanRPGMap />
    </main>
  );
}