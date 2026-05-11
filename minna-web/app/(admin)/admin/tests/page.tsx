"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { adminAPI } from "@/lib/api/admin"
import { toast } from "sonner"

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
  DialogDescription,
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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Edit,
  Search,
  Trash2,
  FileText,
  Music,
  Crown,
  Clock,
  Target,
  Plus,
} from "lucide-react"

type Test = {
  id: number
  title: string
  level: string
  type: string
  audio_url?: string
  is_premium: boolean
  time: number
  pass_score: number
  created_at: string
}

const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const

// Level ranglari
const levelColors: Record<
  string,
  { text: string; border: string; active: string;  }
> = {
  N5: {
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    active: "bg-green-600 text-white",
  },
  N4: {
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    active: "bg-blue-600 text-white"
  },
  N3: {
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    active: "bg-yellow-600 text-white"
  },
  N2: {
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    active: "bg-orange-600 text-white"
  },
  N1: {
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    active: "bg-red-600 text-white",
  },
}

const TestsPage = () => {
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("N5") // ✅ Faol tab

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  // Default qiymatlar
  const defaultForm = {
    title: "",
    level: "N5",
    type: "jlpt",
    is_premium: false,
    time: 105,
    pass_score: 80,
    audio_file: null as File | null,
  }

  const [form, setForm] = useState(defaultForm)

  // =====================
  // FETCH DATA
  // =====================
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getTests()
      setTests(res.data.data || res.data)
    } catch (err) {
      toast.error("Testlarni yuklashda xatolik yuz berdi!")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  // ✅ Filter: qidiruv + activeTab bo'yicha
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesLevel = test.level === activeTab
    return matchesSearch && matchesLevel
  })

  // Har bir tabda nechta test borligini hisoblash
  const getTestCount = (level: string) => {
    return tests.filter((test) => test.level === level).length
  }

  // =====================
  // MODAL LOGIC
  // =====================
  const handleOpenCreate = () => {
    setEditId(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (test: Test) => {
    setEditId(test.id)
    setForm({
      title: test.title,
      level: test.level,
      type: test.type,
      is_premium: !!test.is_premium,
      time: test.time || 105,
      pass_score: test.pass_score || 80,
      audio_file: null,
    })
    setIsModalOpen(true)
  }

  const handleChange = (key: string, value: any) => {
    setForm((prev) => {
      const newData = { ...prev }
      // @ts-ignore
      newData[key] = value

      if (key === "level") {
        const standards: Record<string, { t: number; p: number }> = {
          N5: { t: 105, p: 80 },
          N4: { t: 125, p: 90 },
          N3: { t: 140, p: 95 },
          N2: { t: 155, p: 90 },
          N1: { t: 170, p: 100 },
        }
        if (standards[value]) {
          newData.time = standards[value].t
          newData.pass_score = standards[value].p
        }
      }
      return newData
    })
  }

  // =====================
  // SUBMIT
  // =====================
  const handleSubmit = async () => {
    if (!form.title) return toast.warning("Test nomini kiriting!")
    if (!form.level) return toast.warning("Darajani (Level) tanlang!")
    if (!form.time || form.time < 1)
      return toast.warning("Vaqt kamida 1 daqiqa bo'lishi kerak!")
    if (!form.pass_score || form.pass_score < 1)
      return toast.warning("O'tish balli kamida 1 bo'lishi kerak!")

    try {
      setSubmitting(true)
      const formData = new FormData()

      formData.append("title", form.title)
      formData.append("level", form.level)
      formData.append("is_premium", form.is_premium ? "1" : "0")
      formData.append("time", form.time.toString())
      formData.append("pass_score", form.pass_score.toString())

      if (form.audio_file instanceof File) {
        formData.append("audio_file", form.audio_file)
      }

      if (editId) {
        formData.append("_method", "PUT")
        await adminAPI.updateTest(editId, formData)
        toast.success("Test muvaffaqiyatli yangilandi")
      } else {
        await adminAPI.createTest(formData)
        toast.success("Yangi test muvaffaqiyatli yaratildi")
      }

      setIsModalOpen(false)
      fetchTests()
    } catch (err: any) {
      console.error("LARAVEL XATOSI:", err.response?.data?.errors)

      const validationErrors = err.response?.data?.errors
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors)[0] as string
        toast.error(
          Array.isArray(firstMessage) ? firstMessage[0] : firstMessage
        )
      } else {
        toast.error(
          err.response?.data?.message || "Saqlashda xatolik yuz berdi"
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Ushbu testni o'chirmoqchimisiz?")) {
      try {
        await adminAPI.deleteTest(id)
        toast.success("Test o'chirildi")
        fetchTests()
      } catch {
        toast.error("O'chirishda xatolik yuz berdi!")
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-7 w-7 text-slate-600" /> JLPT Test Boshqaruvi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Testlar ro'yxati va umumiy sozlamalar.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="gap-2 bg-slate-600 text-white hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" /> Yangi Test
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
        <Input
          className="pl-10"
          placeholder="Test nomi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-6 flex w-fit gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800">
        {LEVELS.map((level) => {
          const count = getTestCount(level)
          const isActive = activeTab === level

          return (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-slate-700 text-white shadow-md dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              } `}
            >
              <span>{level}</span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                  isActive
                    ? "bg-white/15 text-white dark:bg-slate-900/10 dark:text-slate-900"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                } `}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ✅ ACTIVE TAB CONTENT */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Test Nomi</TableHead>
              <TableHead>Daraja</TableHead>
              <TableHead>Vaqt/Ball</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <TableRow key={test.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs text-slate-500">
                    #{test.id}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer font-semibold hover:text-blue-600"
                    onClick={() => router.push(`/admin/tests/${test.id}`)}
                  >
                    {test.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {test.time} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> Pass: {test.pass_score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.is_premium ? (
                      <Badge className="border-amber-200 bg-amber-100 text-amber-700">
                        <Crown className="mr-1 h-3 w-3" /> Premium
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEdit(test)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => handleDelete(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-20 text-center text-sm text-slate-400"
                >
                  {searchQuery
                    ? "Qidiruv bo'yicha testlar topilmadi."
                    : `${activeTab} darajasida testlar mavjud emas.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Testni tahrirlash" : "Yangi Test yaratish"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              JLPT imtihoni uchun asosiy ma'lumotlarni kiriting.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Test Nomi</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Masalan: 2024 N5 Practice Test"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Daraja</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => handleChange("level", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Turi</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleChange("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jlpt">Real JLPT</SelectItem>
                    <SelectItem value="practice">Mashq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Vaqt (min)
                </Label>
                <Input
                  type="number"
                  value={isNaN(form.time) ? "" : form.time}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    handleChange("time", isNaN(val) ? 0 : val)
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" /> O'tish balli
                </Label>
                <Input
                  type="number"
                  value={isNaN(form.pass_score) ? "" : form.pass_score}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    handleChange("pass_score", isNaN(val) ? 0 : val)
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Ruxsat</Label>
              <Select
                value={form.is_premium ? "true" : "false"}
                onValueChange={(v) => handleChange("is_premium", v === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Bepul</SelectItem>
                  <SelectItem value="true">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 rounded-xl border border-dashed bg-slate-50 p-4 dark:bg-slate-800/40">
              <Label className="flex items-center gap-2">
                <Music className="h-4 w-4 text-slate-500" /> Audio fayl
              </Label>
              <Input
                type="file"
                accept=".mp3,.wav"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleChange("audio_file", file)
                  } else {
                    handleChange("audio_file", null)
                  }
                }}
                className="cursor-pointer bg-white"
              />
              <p className="text-[10px] text-slate-500">
                MP3 yoki WAV fayl yuklang. Maksimal 40MB.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="min-w-[100px] bg-slate-600 text-white"
            >
              {submitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TestsPage
