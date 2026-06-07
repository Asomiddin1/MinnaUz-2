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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, RefreshCcw, PlayCircle, Plus, Trash2, Filter, Link as LinkIcon, Clock } from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPES
// =====================
type Level = {
  id: number
  title: string
}

type Module = {
  id: number
  title: string
  level?: Level
}

type Lesson = {
  id: number
  module_id: number
  title: string
  video_url: string
  content?: string
  duration?: string
  module?: Module
}

const LessonsPage = () => {
  const { status } = useSession()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [modules, setModules] = useState<Module[]>([])
  
  const [loading, setLoading] = useState(true)
  const [filterModuleId, setFilterModuleId] = useState<string>("all")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    module_id: "",
    title: "",
    video_url: "",
    duration: "",
    content: "",
  })

  // =====================
  // FETCH MODULES (Dropdown uchun)
  // =====================
  const fetchModules = useCallback(async () => {
    try {
      const res = await adminAPI.getModules()
      const data = Array.isArray(res.data) ? res.data : res.data?.data || []
      setModules(data)
    } catch (error) {
      console.error("Modullarni yuklashda xatolik:", error)
    }
  }, [])

  // =====================
  // FETCH LESSONS
  // =====================
  const fetchLessons = useCallback(async (moduleId?: string) => {
    try {
      setLoading(true)
      const parsedModuleId = moduleId !== "all" && moduleId ? Number(moduleId) : undefined
      const response = await adminAPI.getLessons(parsedModuleId)

      if (Array.isArray(response.data)) {
        setLessons(response.data)
      } else if (response.data && response.data.data) {
        setLessons(response.data.data)
      } else {
        setLessons([])
      }
    } catch (error) {
      console.error("API xatosi:", error)
      toast.error("Darslarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (status === "authenticated") {
      fetchModules()
      fetchLessons(filterModuleId)
    }
  }, [status, fetchModules, fetchLessons, filterModuleId])

  // =====================
  // MODAL ACTIONS
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ 
      module_id: filterModuleId !== "all" ? filterModuleId : "", 
      title: "", 
      video_url: "",
      duration: "",
      content: ""
    })
    setIsModalOpen(true)
  }

  const openEditModal = (lesson: Lesson) => {
    setEditingId(lesson.id)
    setFormData({
      module_id: String(lesson.module_id),
      title: lesson.title,
      video_url: lesson.video_url,
      duration: lesson.duration || "",
      content: lesson.content || "",
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.module_id || !formData.video_url) {
        toast.error("Modul, sarlavha va video link kiritilishi shart!")
        return
      }

      const payload = {
        module_id: Number(formData.module_id),
        title: formData.title,
        video_url: formData.video_url,
        duration: formData.duration,
        content: formData.content,
      }

      if (editingId) {
        await adminAPI.updateLesson(editingId, payload)
        toast.success("Video dars muvaffaqiyatli yangilandi")
      } else {
        await adminAPI.createLesson(payload)
        toast.success("Yangi video dars qo'shildi")
      }

      setIsModalOpen(false)
      fetchLessons(filterModuleId)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu darsni o'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteLesson(id)
      toast.success("Dars o'chirildi")
      fetchLessons(filterModuleId)
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi")
    }
  }

  // =====================
  // SKELETON
  // =====================
  const renderSkeletons = () => (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-slate-900">
      <Table>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i} className="border-b">
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-8 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-red-500" />
            Video Darslar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platformadagi barcha video darslar va materiallarni boshqarish.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">
            Jami: {lessons.length}
          </Badge>
          <Button variant="outline" size="icon" onClick={() => fetchLessons(filterModuleId)}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Filter className="h-4 w-4" /> Filtr:
        </div>
        <Select 
          value={filterModuleId} 
          onValueChange={(val) => setFilterModuleId(val)}
        >
          <SelectTrigger className="w-[300px] bg-white dark:bg-slate-900">
            <SelectValue placeholder="Barcha bo'limlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha bo'limlar</SelectItem>
            {modules.map((mod) => (
              <SelectItem key={mod.id} value={String(mod.id)}>
                {mod.level ? `${mod.level.title} - ` : ""}{mod.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      {loading ? (
        renderSkeletons()
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-slate-900">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Sarlavha</TableHead>
                <TableHead>Modul (Bo'lim)</TableHead>
                <TableHead>Video Link</TableHead>
                <TableHead className="text-center">Vaqt</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="text-slate-500 font-medium">#{lesson.id}</TableCell>
                    <TableCell className="font-semibold">{lesson.title}</TableCell>
                    <TableCell>
                      {lesson.module ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {lesson.module.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {lesson.module.level?.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Topilmadi</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={lesson.video_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                      >
                        <LinkIcon className="h-3 w-3" /> Ko'rish
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      {lesson.duration ? (
                        <Badge variant="secondary" className="font-mono bg-slate-100 dark:bg-slate-800">
                          <Clock className="mr-1 h-3 w-3" /> {lesson.duration}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(lesson)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(lesson.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Hozircha darslar topilmadi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Darsni tahrirlash" : "Yangi video dars qo'shish"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Qaysi bo'limga? <span className="text-red-500">*</span></label>
              <Select 
                value={formData.module_id} 
                onValueChange={(val) => setFormData({ ...formData, module_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modulni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((mod) => (
                    <SelectItem key={mod.id} value={String(mod.id)}>
                      {mod.level ? `${mod.level.title} - ` : ""}{mod.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dars sarlavhasi <span className="text-red-500">*</span></label>
              <Input
                placeholder="Masalan: 1-dars: Fe'l negizlari"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL (Youtube, Vimeo) <span className="text-red-500">*</span></label>
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Davomiyligi (Vaqti)</label>
              <Input
                placeholder="Masalan: 12:30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dars matni / Qo'shimcha (Ixtiyoriy)</label>
              {/* Textarea o'rniga oddiy html textarea, agar shadcn dagi Textarea o'rnatilmagan bo'lsa xato bermasligi uchun */}
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Dars haqida qisqacha ma'lumot yoki qoidalar..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Saqlash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LessonsPage