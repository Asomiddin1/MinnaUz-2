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
// Checkbox komponentini qo'shib qo'ying (agar bo'lsa, bo'lmasa oddiy <input type="checkbox" /> ham ishlaydi)
import { Checkbox } from "@/components/ui/checkbox" 
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
  FileText,
  Languages,
  Search
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
  transcript: Record<string, TranscriptRow[]>;
}

const CATEGORIES = ["Anime tili", "Yaponiyada hayot", "Vloglar", "Madaniyat", "Qiziqarli faktlar", "Shorts"];

const AVAILABLE_LANGUAGES = [
  { code: "uz", label: "O'zbekcha" },
  { code: "ja", label: "Yaponcha" },
  { code: "en", label: "Inglizcha" },
  { code: "ru", label: "Ruscha" }
];

export default function AdminVideoPage() {
  const { status } = useSession()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modallar va yuklanish statelari
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false)
  const [activeLang, setActiveLang] = useState<string>("uz")

  // Izlash va Tanlab o'chirish statelari
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, (number | string)[]>>({
    uz: [], ja: [], en: [], ru: []
  })

  // Youtube va Form statelari
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [formData, setFormData] = useState({
    category: "Yaponiyada hayot",
    title: "",
    thumbnail: "",
    description: "",
    youtube_id: "",
    transcript: { uz: [], ja: [], en: [], ru: [] } as Record<string, TranscriptRow[]>
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

      const timeRegex = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;

      lines.forEach((line, index) => {
        if (timeRegex.test(line)) {
          lastTime = line;
        } else if (lastTime !== "") {
          if (!line.startsWith('[') && !line.endsWith(']')) {
            newTranscript.push({
              id: `raw-${Date.now()}-${index}`,
              time: lastTime,
              text: line
            });
            lastTime = "";
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        transcript: {
          ...prev.transcript,
          [activeLang]: [...(prev.transcript[activeLang] || []), ...newTranscript]
        }
      }));
      toast.success(`${AVAILABLE_LANGUAGES.find(l => l.code === activeLang)?.label} tiliga ${newTranscript.length} qator qo'shildi`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // =====================
  // TRANSCRIPT HANDLERS
  // =====================
  const addTranscriptRow = () => {
    setFormData(p => ({
      ...p, 
      transcript: {
        ...p.transcript,
        [activeLang]: [...(p.transcript[activeLang] || []), { id: Date.now(), time: "", text: "" }]
      }
    }))
  }

  const removeTranscriptRow = (id: number | string) => {
    setFormData(p => ({
      ...p,
      transcript: {
        ...p.transcript,
        [activeLang]: (p.transcript[activeLang] || []).filter(r => r.id !== id)
      }
    }))
    // Tanlanganlar ro'yxatidan ham olib tashlaymiz
    setSelectedRowIds(prev => ({
      ...prev,
      [activeLang]: prev[activeLang].filter(rowId => rowId !== id)
    }))
  }

  // Ommaviy o'chirish (Bulk Delete)
  const removeSelectedRows = () => {
    const currentSelected = selectedRowIds[activeLang] || []
    if (currentSelected.length === 0) return

    setFormData(p => ({
      ...p,
      transcript: {
        ...p.transcript,
        [activeLang]: (p.transcript[activeLang] || []).filter(r => !currentSelected.includes(r.id))
      }
    }))

    toast.success(`${currentSelected.length} ta qator o'chirildi`)
    setSelectedRowIds(prev => ({ ...prev, [activeLang]: [] }))
  }

  // Barchasini tanlash/bekor qilish (Select All)
  const toggleSelectAll = (filteredRows: TranscriptRow[]) => {
    const currentSelected = selectedRowIds[activeLang] || []
    const filteredIds = filteredRows.map(r => r.id)
    
    const isAllFilteredSelected = filteredIds.every(id => currentSelected.includes(id))

    if (isAllFilteredSelected) {
      // Agar hammasi tanlangan bo'lsa, filtrlanganni o'chiramiz
      setSelectedRowIds(prev => ({
        ...prev,
        [activeLang]: prev[activeLang].filter(id => !filteredIds.includes(id))
      }))
    } else {
      // Aks holda ro'yxatga qo'shamiz (dublikat bo'lmasligi uchun Set orqali)
      setSelectedRowIds(prev => ({
        ...prev,
        [activeLang]: Array.from(new Set([...prev[activeLang], ...filteredIds]))
      }))
    }
  }

  const toggleSelectRow = (id: number | string) => {
    setSelectedRowIds(prev => {
      const current = prev[activeLang] || []
      const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id]
      return { ...prev, [activeLang]: updated }
    })
  }

  const updateTranscriptRow = (id: number | string, field: "time" | "text", value: string) => {
    setFormData(p => ({
      ...p,
      transcript: {
        ...p.transcript,
        [activeLang]: (p.transcript[activeLang] || []).map(r => r.id === id ? { ...r, [field]: value } : r)
      }
    }))
  }

  // =====================
  // CRUD ACTIONS
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setYoutubeUrl("")
    setSearchQuery("")
    setSelectedRowIds({ uz: [], ja: [], en: [], ru: [] })
    setFormData({ 
      category: "Yaponiyada hayot", 
      title: "", 
      thumbnail: "", 
      description: "", 
      youtube_id: "", 
      transcript: { uz: [], ja: [], en: [], ru: [] } 
    })
    setActiveLang("uz")
    setIsModalOpen(true)
  }

  const openEditModal = (video: Video) => {
    setEditingId(video.id)
    setSearchQuery("")
    setSelectedRowIds({ uz: [], ja: [], en: [], ru: [] })
    
    const incomingTranscript = video.transcript && typeof video.transcript === 'object' && !Array.isArray(video.transcript)
      ? video.transcript
      : { uz: Array.isArray(video.transcript) ? video.transcript : [], ja: [], en: [], ru: [] };

    setFormData({
      category: video.category,
      title: video.title,
      thumbnail: video.thumbnail,
      description: video.description || "",
      youtube_id: video.youtube_id,
      transcript: {
        uz: incomingTranscript.uz || [],
        ja: incomingTranscript.ja || [],
        en: incomingTranscript.en || [],
        ru: incomingTranscript.ru || [],
      }
    })
    setActiveLang("uz")
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

  const getTotalTranscriptLines = (transcriptObj: Record<string, TranscriptRow[]>) => {
    if (!transcriptObj || typeof transcriptObj !== 'object' || Array.isArray(transcriptObj)) return 0;
    return Object.values(transcriptObj).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  }

  // Filtrangan transkript qatorlari (Izlash uchun)
  const filteredTranscriptRows = (formData.transcript[activeLang] || []).filter(row => 
    row.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    row.time.includes(searchQuery)
  )

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <PlayCircle className="h-6 w-6 text-blue-500" />
            Video Darslar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Video kutubxonasi va ko'p tilli transkriptlarni boshqarish.</p>
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
                    <div className="text-[10px] text-slate-400 mt-1">{getTotalTranscriptLines(video.transcript)} qator (jami)</div>
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
        <DialogContent className="sm:max-w-[1050px] max-h-[95vh] overflow-y-auto p-0 border-none rounded-3xl">
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Video Matni (Transkript)</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
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

              {/* TABS & SEARCH/DELETE TOOLS */}
              <div className="flex flex-row sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                {/* DYNAMIC LANGUAGE SELECTION TABS */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-700">
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <Button
                      key={lang.code}
                      type="button"
                      variant={activeLang === lang.code ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setActiveLang(lang.code)
                        setSearchQuery("") // Til almashganda qidiruvni tozalash
                      }}
                      className={`gap-1.5 px-4 h-9 rounded-lg font-medium transition-all ${
                        activeLang === lang.code 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <Languages className="h-3.5 w-3.5 opacity-70" />
                      {lang.label}
                      <Badge className={`ml-1 px-1.5 py-0 text-[10px] ${activeLang === lang.code ? "bg-white text-blue-600" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"}`}>
                        {formData.transcript[lang.code]?.length || 0}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {/* SEARCH INPUT */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Matn yoki vaqt bo'yicha qidirish..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white dark:bg-slate-950 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* BULK ACTIONS BAR (Faqat biror narsa tanlansa chiqadi) */}
              {filteredTranscriptRows.length > 0 && (
                <div className="flex items-center justify-between px-3 py-2 mb-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="select-all-rows"
                        checked={
                          filteredTranscriptRows.length > 0 && 
                          filteredTranscriptRows.every(r => (selectedRowIds[activeLang] || []).includes(r.id))
                        }
                        onCheckedChange={() => toggleSelectAll(filteredTranscriptRows)}
                      />
                      <label htmlFor="select-all-rows" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                        Hammasini tanlash ({filteredTranscriptRows.length})
                      </label>
                    </div>
                    
                    {(selectedRowIds[activeLang] || []).length > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px]">
                        {(selectedRowIds[activeLang] || []).length} ta tanlandi
                      </Badge>
                    )}
                  </div>

                  {(selectedRowIds[activeLang] || []).length > 0 && (
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={removeSelectedRows} 
                      className="h-8 px-3 rounded-lg text-xs gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Tanlanganlarni o'chirish
                    </Button>
                  )}
                </div>
              )}

              {/* TRANSCRIPT ROWS (FOR ACTIVE LANGUAGE ONLY) */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {filteredTranscriptRows.map((row) => {
                  const isChecked = (selectedRowIds[activeLang] || []).includes(row.id);
                  return (
                    <div 
                      key={row.id} 
                      className={`flex gap-3 items-start group p-3 rounded-2xl border transition-colors ${
                        isChecked 
                          ? "bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50" 
                          : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      {/* Checkbox for selection */}
                      <div className="pt-2.5 pl-1">
                        <Checkbox 
                          checked={isChecked} 
                          onCheckedChange={() => toggleSelectRow(row.id)} 
                        />
                      </div>

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
                          placeholder={`${AVAILABLE_LANGUAGES.find(l => l.code === activeLang)?.label} matnni yozing...`} 
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
                  )
                })}
                
                {/* Agar qidiruv natija bermasa yoki transkript bo'lmasa */}
                {filteredTranscriptRows.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400">
                    <Type className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">
                      {searchQuery 
                        ? "Qidiruv bo'yicha hech qanday mos keladigan matn topilmadi."
                        : `${AVAILABLE_LANGUAGES.find(l => l.code === activeLang)?.label} tiliga transkript qo'shilmagan.`
                      }
                    </p>
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