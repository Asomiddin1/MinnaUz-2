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
  Languages,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPES
// =====================
type Level = {
  id: number
  title: string
  slug: string
}

type Example = {
  japanese: string
  translation: string
}

type Grammar = {
  id: number
  level_id: number
  title: string
  meaning: string | null
  description: string | null
  examples: Example[] | null
  level?: Level
}

const AdminGrammarPage = () => {
  const { status } = useSession()
  const [grammars, setGrammars] = useState<Grammar[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)

  // Modallar holati
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTxtModalOpen, setIsTxtModalOpen] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    level_id: "",
    title: "",
    meaning: "",
    description: "",
    examples: [] as Example[],
  })

  const [txtFile, setTxtFile] = useState<File | null>(null)
  const [selectedLevelForTxt, setSelectedLevelForTxt] = useState("")

  // =====================
  // FETCH DATA
  // =====================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [levelsRes, grammarsRes] = await Promise.all([
        adminAPI.getLevels(),
        adminAPI.getGrammars(),
      ])

      setLevels(levelsRes.data?.data || levelsRes.data || [])
      setGrammars(grammarsRes.data?.data || grammarsRes.data || [])
    } catch (error) {
      console.error("API xatosi:", error)
      toast.error("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") fetchData()
  }, [status, fetchData])

  // =====================
  // SINGLE CREATE / UPDATE
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setFormData({
      level_id: "",
      title: "",
      meaning: "",
      description: "",
      examples: [],
    })
    setIsModalOpen(true)
  }

  const openEditModal = (grammar: Grammar) => {
    setEditingId(grammar.id)
    setFormData({
      level_id: grammar.level_id.toString(),
      title: grammar.title,
      meaning: grammar.meaning || "",
      description: grammar.description || "",
      examples: grammar.examples || [],
    })
    setIsModalOpen(true)
  }

  const handleAddExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { japanese: "", translation: "" }],
    })
  }

  const handleRemoveExample = (index: number) => {
    const newExamples = [...formData.examples]
    newExamples.splice(index, 1)
    setFormData({ ...formData, examples: newExamples })
  }

  const handleExampleChange = (
    index: number,
    field: keyof Example,
    value: string
  ) => {
    const newExamples = [...formData.examples]
    newExamples[index][field] = value
    setFormData({ ...formData, examples: newExamples })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.level_id) {
        toast.error("Sarlavha va Darajani tanlash majburiy")
        return
      }

      // Bo'sh namunalarni tozalash
      const cleanExamples = formData.examples.filter(
        (e) => e.japanese.trim() !== ""
      )

      const payload = {
        ...formData,
        level_id: Number(formData.level_id),
        examples: cleanExamples,
      }

      if (editingId) {
        await adminAPI.updateGrammar(editingId, payload)
        toast.success("Grammatika yangilandi")
      } else {
        await adminAPI.createGrammar(payload)
        toast.success("Yangi grammatika qo'shildi")
      }

      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi")
    }
  }

  // =====================
  // TXT BULK UPLOAD
  // =====================
  const handleTxtUpload = async () => {
    if (!txtFile || !selectedLevelForTxt) {
      toast.error("Iltimos, darajani tanlang va fayl yuklang")
      return
    }

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      const text = e.target?.result as string
      // TXT faylni bo'laklarga ajratish (=== orqali)
      const blocks = text.split("===")
      const parsedGrammars = []

      for (const block of blocks) {
        if (!block.trim()) continue

        const lines = block.split("\n").map((l) => l.trim())
        const grammar = {
          title: "",
          meaning: "",
          description: "",
          examples: [] as Example[],
        }
        let currentExample: Partial<Example> = {}

        for (const line of lines) {
          if (line.startsWith("Title:"))
            grammar.title = line.replace("Title:", "").trim()
          else if (line.startsWith("Meaning:"))
            grammar.meaning = line.replace("Meaning:", "").trim()
          else if (line.startsWith("Description:"))
            grammar.description = line.replace("Description:", "").trim()
          else if (line.startsWith("JP:"))
            currentExample.japanese = line.replace("JP:", "").trim()
          else if (line.startsWith("UZ:")) {
            currentExample.translation = line.replace("UZ:", "").trim()
            if (currentExample.japanese) {
              grammar.examples.push({
                japanese: currentExample.japanese,
                translation: currentExample.translation,
              })
              currentExample = {}
            }
          }
        }

        if (grammar.title) parsedGrammars.push(grammar)
      }

      try {
        // Ajratib olingan grammatikalarni bittalab serverga jo'natamiz
        for (const item of parsedGrammars) {
          await adminAPI.createGrammar({
            ...item,
            level_id: Number(selectedLevelForTxt),
          })
        }
        toast.success(
          `${parsedGrammars.length} ta grammatika muvaffaqiyatli qo'shildi!`
        )
        setIsTxtModalOpen(false)
        setTxtFile(null)
        fetchData()
      } catch (err) {
        toast.error("Yuklash jarayonida xatolik yuz berdi")
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsText(txtFile)
  }

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu grammatikani o'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteGrammar(id)
      toast.success("O'chirildi")
      fetchData()
    } catch (error) {
      toast.error("O'chirishda xatolik")
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
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Languages className="h-6 w-6 text-blue-500" />
            Grammatika
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Barcha darajalar uchun qoidalar va namunalarni boshqarish.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800"
          >
            Jami: {grammars.length}
          </Badge>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsTxtModalOpen(true)}
            className="gap-2 border border-slate-200"
          >
            <Upload className="h-4 w-4" /> TXT Yuklash
          </Button>
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        renderSkeletons()
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-slate-900">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Daraja</TableHead>
                <TableHead>Sarlavha</TableHead>
                <TableHead>Ma'nosi</TableHead>
                <TableHead className="text-center">Namunalar</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grammars.length > 0 ? (
                grammars.map((grammar) => (
                  <TableRow key={grammar.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {grammar.level?.title || "Noma'lum"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {grammar.title}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {grammar.meaning || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium dark:bg-slate-800">
                        {grammar.examples?.length || 0} ta
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(grammar)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(grammar.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >
                    Hozircha grammatika qo'shilmagan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 1. SINGLE CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Grammatikani tahrirlash" : "Yangi grammatika"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Darajani tanlang <span className="text-red-500">*</span>
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={formData.level_id}
                onChange={(e) =>
                  setFormData({ ...formData, level_id: e.target.value })
                }
              >
                <option value="" disabled>
                  -- Tanlang --
                </option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Qoida (Title) <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="~てもいいです"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ma'nosi</label>
                <Input
                  placeholder="...sa ham bo'ladi"
                  value={formData.meaning}
                  onChange={(e) =>
                    setFormData({ ...formData, meaning: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tushuntirish</label>
              <Textarea
                placeholder="Ruxsat so'rash uchun ishlatiladi..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* NAMUNALAR QISMI */}
            <div className="border-t pt-4">
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Namunalar (Examples)
                </label>
                <Button size="sm" variant="outline" onClick={handleAddExample}>
                  <Plus className="mr-1 h-3 w-3" /> Namun qo'shish
                </Button>
              </div>

              <div className="space-y-3">
                {formData.examples.map((example, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Yaponcha (JP)"
                        value={example.japanese}
                        onChange={(e) =>
                          handleExampleChange(index, "japanese", e.target.value)
                        }
                      />
                      <Input
                        placeholder="O'zbekcha tarjimasi (UZ)"
                        value={example.translation}
                        onChange={(e) =>
                          handleExampleChange(
                            index,
                            "translation",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="shrink-0"
                      onClick={() => handleRemoveExample(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.examples.length === 0 && (
                  <p className="py-2 text-center text-xs text-slate-500">
                    Namuna kiritilmagan.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. TXT BULK UPLOAD MODAL */}
      <Dialog open={isTxtModalOpen} onOpenChange={setIsTxtModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>TXT fayl orqali yuklash</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Qaysi darajaga yuklaymiz?{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={selectedLevelForTxt}
                onChange={(e) => setSelectedLevelForTxt(e.target.value)}
              >
                <option value="" disabled>
                  -- Tanlang --
                </option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                TXT faylni tanlang <span className="text-red-500">*</span>
              </label>
              <Input
                type="file"
                accept=".txt"
                onChange={(e) => setTxtFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-900/20">
              <p className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Fayl formati qanday bo'lishi kerak?
              </p>
              <pre className="overflow-x-auto text-[10px] text-slate-600 dark:text-slate-400">
                {`Title: ~てもいいです
Meaning: ...sa ham bo'ladi
Description: Ruxsat so'rash.
JP: 座ってもいいです。
UZ: O'tirsangiz bo'ladi.
===
Title: Keyingi qoida...`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTxtModalOpen(false)}
              disabled={isUploading}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleTxtUpload}
              disabled={isUploading || !txtFile}
            >
              {isUploading ? "Yuklanmoqda..." : "Faylni yuklash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminGrammarPage
