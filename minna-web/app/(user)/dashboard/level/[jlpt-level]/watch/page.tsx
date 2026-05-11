import BackButton from "@/components/back-button"
import { Play, Lock, CheckCircle2, FileText, ChevronRight, Video } from "lucide-react"

interface WatchPageProps {
  params: Promise<{
    "jlpt-level": string
  }>
}

const MOCK_VIDEOS = [
  { id: 1, title: "1. Kirish va tanishuv", duration: "05:20", isFree: true, active: true },
  { id: 2, title: "2. Asosiy grammatika qoidalari", duration: "12:45", isFree: false, active: false },
  { id: 3, title: "3. Lug'at boyligini oshirish", duration: "10:10", isFree: false, active: false },
  { id: 4, title: "4. Eshitish mashqlari #1", duration: "15:30", isFree: false, active: false },
  { id: 5, title: "5. Kanji yozish sirlari", duration: "08:15", isFree: false, active: false },
]

const WatchLevelPage = async ({ params }: WatchPageProps) => {
  const resolvedParams = await params
  const level = resolvedParams["jlpt-level"]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      
      {/* HEADER: Sticky va Z-index olib tashlandi, shunda Navbar ustiga chiqmaydi */}
      <div className="border-b bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 h-14 md:h-16 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-widest">{level}</span>
            <ChevronRight className="h-3 w-3 md:h-4 text-slate-400" />
            <span className="text-[10px] md:text-sm font-bold text-slate-900 dark:text-white">Video Darslar</span>
          </div>
          <div className="hidden md:block w-10" /> 
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CHAP TOMON: Video Player */}
          <div className="flex-1 space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-[24px] md:rounded-[32px] bg-[#0F172A] shadow-2xl">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-blue-600 flex items-center justify-center shadow-3xl shadow-blue-500/50 cursor-pointer">
                  <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
                </div>
                <p className="mt-4 text-slate-400 text-xs md:text-sm">Videoni yuklash uchun bosing...</p>
              </div>
            </div>

            {/* Video Haqida Ma'lumot */}
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                1. Kirish va tanishuv
              </h1>
              
              <div className="mt-4 flex items-center gap-3">
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Video className="h-3.5 w-3.5 text-blue-500" /> 12 dars
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                  <FileText className="h-3.5 w-3.5 text-blue-500" /> 4 PDF material
                </span>
              </div>

              <div className="mt-8 border-t pt-6 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Ushbu darsda biz {level} darajasining asosiy talablari va o'qish rejasini ko'rib chiqamiz. 
                Backenddan keladigan dars tavsifi shu yerda chiqadi.
              </div>
            </div>
          </div>

          {/* O'NG TOMON: Playlist */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Kurs mazmuni</h3>
                <p className="text-xs text-slate-500 mt-1">5% bajarildi • 1/12 dars</p>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                {MOCK_VIDEOS.map((video, index) => (
                  <div 
                    key={video.id}
                    className={`flex items-center justify-between p-4 border-b last:border-0 dark:border-slate-800 cursor-pointer transition-colors ${
                      video.active ? 'bg-blue-50/50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        video.active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${video.active ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">{video.duration}</span>
                      </div>
                    </div>
                    {video.isFree || video.active ? (
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                       <Lock className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4">
                <button className="w-full flex items-center justify-center gap-2 border dark:border-slate-700 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Materiallarni yuklab olish
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default WatchLevelPage