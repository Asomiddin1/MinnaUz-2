"use client"

import { useEffect, useState, useCallback } from "react"
import { adminAPI } from "@/lib/api/admin"
import { useSession } from "next-auth/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { 
  Edit, 
  RefreshCcw, 
  PlayCircle, 
  Plus, 
  Trash2, 
  Zap, 
  X, 
  Loader2,
  Clock,
  Type,
  Upload,
  FileText
} from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPES
// =====================
interface TranscriptRow {
  id: number | string;
  time: string;
  text: string;
}

interface Video {
  id: number;
  category: string;
  title: string;
  thumbnail: string;
  description: string;
  youtube_id: string;
  views: number;
  transcript: TranscriptRow[];
}

const CATEGORIES = ["Anime tili", "Yaponiyada hayot", "Vloglar", "Madaniyat", "Qiziqarli faktlar", "Shorts"];

export default function AdminVideoPage() {
  const { status } = useSession()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modallar va yuklanish statelari
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false)

  // Youtube va Form statelari
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [formData, setFormData] = useState({
    category: "Yaponiyada hayot",
    title: "",
    thumbnail: "",
    description: "",
    youtube_id: "",
    transcript: [] as TranscriptRow[]
  })

  // =====================
  // DATA FETCHING
  // =====================
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getVideos()
      setVideos(res.data?.data || res.data || [])
    } catch (error) {
      toast.error("Videolarni yuklashda xatolik!")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") fetchVideos()
  }, [status, fetchVideos])

  // =====================
  // YOUTUBE AUTO-FETCH
  // =====================
  const handleYoutubeFetch = async () => {
    if (!youtubeUrl) return toast.error("YouTube linkini kiriting!")
    try {
      setIsFetchingYoutube(true)
      const res = await adminAPI.fetchYoutubeData(youtubeUrl)
      setFormData(prev => ({
        ...prev,
        title: res.data.title,
        thumbnail: res.data.thumbnail,
        youtube_id: res.data.youtube_id
      }))
      toast.success("Ma'lumotlar tortildi!")
    } catch (error: any) {
      toast.error("Ma'lumot olishda xatolik yuz berdi")
    } finally {
      setIsFetchingYoutube(false)
    }
  }

  // =====================
  // TXT TRANSCRIPT PARSER
  // =====================
  const handleTranscriptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').map(l => l.trim()).filter(l => l !== "");
      
      const newTranscript: TranscriptRow[] = [];
      let lastTime = "";

      // Vaqtni aniqlash uchun Regex: 0:00, 12:34, 1:23:45 formatlari uchun
      const timeRegex = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;

      lines.forEach((line, index) => {
        if (timeRegex.test(line)) {
          lastTime = line; // Bu qator vaqt bo'lsa, eslab qolamiz
        } else if (lastTime !== "") {
          // Bu qator matn bo'lsa va undan oldin vaqt kelgan bo'lsa
          if (!line.startsWith('[') && !line.endsWith(']')) { // [音楽] kabilarni tashlaymiz
            newTranscript.push({
              id: `raw-${Date.now()}-${index}`,
              time: lastTime,
              text: line
            });
            lastTime = ""; // Juftlik topilgach, vaqtni tozalaymiz
          }
        }
      });

      setFormData(prev => ({ ...prev, transcript: [...prev.transcript, ...newTranscript] }));
      toast.success(`${newTranscript.length} qator matn qo'shildi`);
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  // =====================
  // TRANSCRIPT HANDLERS
  // =====================
  const addTranscriptRow = () => {
    setFormData(p => ({
      ...p, 
      transcript: [...p.transcript, { id: Date.now(), time: "", text: "" }]
    }))
  }

  const removeTranscriptRow = (id: number | string) => {
    setFormData(p => ({ ...p, transcript: p.transcript.filter(r => r.id !== id) }))
  }

  const updateTranscriptRow = (id: number | string, field: "time" | "text", value: string) => {
    setFormData(p => ({
      ...p,
      transcript: p.transcript.map(r => r.id === id ? { ...r, [field]: value } : r)
    }))
  }

  // =====================
  // CRUD ACTIONS
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setYoutubeUrl("")
    setFormData({ category: "Yaponiyada hayot", title: "", thumbnail: "", description: "", youtube_id: "", transcript: [] })
    setIsModalOpen(true)
  }

  const openEditModal = (video: Video) => {
    setEditingId(video.id)
    setFormData({
      category: video.category,
      title: video.title,
      thumbnail: video.thumbnail,
      description: video.description || "",
      youtube_id: video.youtube_id,
      transcript: video.transcript || []
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.youtube_id) return toast.error("Majburiy maydonlarni to'ldiring!")
    try {
      if (editingId) {
        await adminAPI.updateVideo(editingId, formData)
        toast.success("Yangilandi")
      } else {
        await adminAPI.createVideo(formData)
        toast.success("Qo'shildi")
      }
      setIsModalOpen(false)
      fetchVideos()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteVideo(id)
      toast.success("O'chirildi")
      fetchVideos()
    } catch (error) {
      toast.error("O'chirishda xatolik")
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <PlayCircle className="h-6 w-6 text-blue-500" />
            Video Darslar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Video kutubxonasi va transkriptlarni boshqarish.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchVideos}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none">
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="space-y-4"><Skeleton className="h-40 w-full rounded-2xl" /><Skeleton className="h-40 w-full rounded-2xl" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="w-[180px]">Preview</TableHead>
                <TableHead>Ma'lumotlar</TableHead>
                <TableHead className="text-center">Statistika</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length > 0 ? videos.map((video) => (
                <TableRow key={video.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <img src={video.thumbnail} alt="thumb" className="object-cover w-full h-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-white text-base">{video.title}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20">{video.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{video.youtube_id}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400">{video.views} ko'rish</div>
                    <div className="text-[10px] text-slate-400 mt-1">{video.transcript?.length || 0} qator matn</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(video)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(video.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-slate-400">Hozircha videolar yo'q.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[95vh] overflow-y-auto p-0 border-none rounded-3xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold">{editingId ? "Videoni tahrirlash" : "Yangi video qo'shish"}</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-8">
            {/* YOUTUBE SMART IMPORT */}
            {!editingId && (
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-slate-900 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap className="h-3 w-3" /> YouTube orqali avtomat to'ldirish
                </h4>
                <div className="flex gap-3">
                  <Input 
                    placeholder="YouTube video linkini tashlang..." 
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm border-blue-200 focus:ring-blue-500"
                  />
                  <Button onClick={handleYoutubeFetch} disabled={isFetchingYoutube} className="bg-blue-600 hover:bg-blue-700 px-6 shadow-md shadow-blue-200 dark:shadow-none">
                    {isFetchingYoutube ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ma'lumotlarni olish"}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sarlavha *</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Kategoriya</label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">YouTube ID *</label>
                <Input value={formData.youtube_id} onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Thumbnail URL</label>
                <Input value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tavsif (Description)</label>
              <Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="resize-none" />
            </div>

            {/* TRANSCRIPT SECTION */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Video Matni (Transkript)</h3>
                </div>
                
                <div className="flex gap-2">
                  <input type="file" id="bulk-txt" className="hidden" accept=".txt" onChange={handleTranscriptFileUpload} />
                  <Button 
                    variant="outline" 
                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => document.getElementById('bulk-txt')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> TXT Yuklash
                  </Button>
                  <Button variant="outline" className="border-slate-200 dark:border-slate-800" onClick={addTranscriptRow}>
                    <Plus className="h-4 w-4 mr-2" /> Qator qo'shish
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {formData.transcript.map((row) => (
                  <div key={row.id} className="flex gap-3 items-start group bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-28 shrink-0">
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input 
                          placeholder="00:00" 
                          className="pl-8 h-10 text-sm bg-white dark:bg-slate-950 font-mono" 
                          value={row.time} 
                          onChange={(e) => updateTranscriptRow(row.id, "time", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Input 
                        placeholder="Matnni yozing..." 
                        className="h-10 text-sm bg-white dark:bg-slate-950" 
                        value={row.text}
                        onChange={(e) => updateTranscriptRow(row.id, "text", e.target.value)}
                      />
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                      onClick={() => removeTranscriptRow(row.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.transcript.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400">
                    <Type className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">Hali transkript qo'shilmadi. TXT orqali yoki qo'lda qo'shing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
            <Button className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-lg shadow-blue-200 dark:shadow-none" onClick={handleSubmit}>
              {editingId ? "Yangilash" : "Videoni saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}