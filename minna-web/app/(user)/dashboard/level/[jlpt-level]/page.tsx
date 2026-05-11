import BackButton from "@/components/back-button"
import { 
  PlayCircle, 
  Code2, 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Languages,
  BookMarked,
  Layers
} from "lucide-react"
import { JLPT_DATA } from "@/app/constants/jlpt-data"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    "jlpt-level": string
  }>
}

const JlptLevelsPage = async ({ params }: PageProps) => {
  const resolvedParams = await params
  const level = resolvedParams["jlpt-level"].toLowerCase()
  const content = JLPT_DATA[level] || JLPT_DATA["n5"]

  // Modul nomiga qarab qaysi sahifaga o'tishni aniqlash
 // Bo'lim nomiga qarab yo'nalishni aniqlash
  const getRoute = (moduleName: string) => {
    const name = moduleName.toLowerCase();
    
    // Alifbo bo'limlari (Hiragana yoki Katakana)
    if (name.includes("hiragana") || name.includes("katakana") || name.includes("alifbo")) {
      return "alphabet";
    }
    
    // Boshqa bo'limlar
    if (name.includes("grammatika")) return "grammar";
    if (name.includes("lug'at")) return "vocabulary";
    if (name.includes("kanji")) return "kanji";
    if (name.includes("listening") || name.includes("eshitish")) return "listening";
    
    return "watch"; // Default holatda video pleyer
  }

  // Ikonalarni tanlash
  const getIcon = (moduleName: string) => {
    const name = moduleName.toLowerCase();
    if (name.includes("grammatika")) return <Languages className="h-5 w-5" />;
    if (name.includes("lug'at")) return <BookMarked className="h-5 w-5" />;
    if (name.includes("kanji")) return <Layers className="h-5 w-5" />;
    return <PlayCircle className="h-5 w-5" />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <BackButton />

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          
          {/* CHAP TOMON */}
          <div className="flex-1">
            <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-[#0F172A] shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl font-bold text-sky-500/20 uppercase tracking-widest">
                  {level === "hira-kata" ? "HIRA-KATA" : level}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yo'nalishni tanlang</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {content.tags.map((tag: string) => (
                  <span key={tag} className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* O'QUV DASTURI - YO'NALISHLAR KESIMIDA */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">O'quv bo'limlari</h2>
                <span className="rounded-full bg-slate-200/50 px-3 py-1 text-xs font-semibold text-slate-500">
                  {content.modules.length} ta yo'nalish
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.modules.map((item: string, index: number) => {
                  const route = getRoute(item);
                  return (
                    <Link 
                      key={index} 
                      href={`/dashboard/level/${level}/${route}`} 
                      className="group"
                    >
                      <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-50 dark:bg-slate-900 dark:border-slate-800 transition-all hover:border-blue-500 hover:shadow-xl active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             {getIcon(item)}
                           </div>
                           <div>
                             <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors block">
                               {item}
                             </span>
                             <span className="text-[10px] uppercase tracking-tighter text-slate-400">
                               {route} bo'limiga o'tish
                             </span>
                           </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-[380px]">
            <div className="sticky top-6 rounded-[32px] bg-white p-8 shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kurs Narxi</span>
              <div className="mt-1 text-4xl font-extrabold text-slate-900 dark:text-white">Bepul</div>

              <Link href={`/dashboard/level/${level}/watch`} className="block">
                <button className="mt-6 md:mt-8 w-full rounded-2xl bg-[#0047FF] py-3 md:py-4 font-bold text-white shadow-lg shadow-blue-200 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  O'rganishni boshlash →
                </button>
              </Link>

              <div className="mt-10 space-y-5 border-t pt-8">
                <p className="flex items-center gap-3 text-[15px] font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Kurs nimalarni o'z ichiga oladi:
                </p>
                
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-3 text-sm">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    <span>Video darslar va tushuntirishlar</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookMarked className="h-5 w-5 text-blue-600" />
                    <span>Dinamik lug'at bazasi</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Layers className="h-5 w-5 text-blue-600" />
                    <span>Kanji chizish mashqlari</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Code2 className="h-5 w-5 text-blue-600" />
                    <span>Barcha PDF materiallar</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Cheksiz umrbod ruxsat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default JlptLevelsPage