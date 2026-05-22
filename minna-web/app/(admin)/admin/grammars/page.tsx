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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Edit, 
  RefreshCcw, 
  BookOpen, 
  Plus, 
  Trash2, 
  X, 
  Languages,
  Search,
  ListOrdered,
  MessageSquare,
  Info,
  FileText,
  Upload,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPES
// =====================


interface Level {
  id: number
  title: string
  slug: string
}

interface ExampleItem {
  id: string | number
  jp: string
  translation: string
}

export interface TranslationFields {
  uz?: string;
  ru?: string;
  // Add this index signature so TypeScript knows it can accept string keys:
  [key: string]: any; 
}

interface Grammar {
  id: number
  level_id: number
  title: TranslationFields
  meaning?: TranslationFields
  description?: TranslationFields
  examples?: {
    en?: ExampleItem[]
    uz?: ExampleItem[]
    ru?: ExampleItem[]
    jp?: ExampleItem[]
  }
  level?: Level
}

// Faqat title uchun alohida tillar (qolgan tillar ko'pincha JP bilan bir xil)
const TITLE_LANGUAGES = [
  { code: "jp", label: "Yaponcha (asosiy)", required: true }
]

// Boshqa maydonlar uchun tillar
const CONTENT_LANGUAGES = [
  { code: "jp", label: "Yaponcha" },
  { code: "uz", label: "O'zbekcha" },
  { code: "en", label: "Inglizcha" },
  { code: "ru", label: "Ruscha" }
]

export default function AdminGrammarPage() {
  const { status } = useSession()
  const [grammars, setGrammars] = useState<Grammar[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [activeLang, setActiveLang] = useState<string>("jp")
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null)
  const [showOtherTitles, setShowOtherTitles] = useState(false) // Boshqa tillardagi titleni ko'rsatish

  const [searchQuery, setSearchQuery] = useState("")
  const [exampleSearchQuery, setExampleSearchQuery] = useState("")
  const [selectedGrammarIds, setSelectedGrammarIds] = useState<number[]>([])
  const [selectedExampleIds, setSelectedExampleIds] = useState<(string | number)[]>([])

  const [formData, setFormData] = useState({
    level_id: "",
    title: { jp: "", uz: "", en: "", ru: "" } as TranslationFields,
    meaning: { jp: "", uz: "", en: "", ru: "" } as TranslationFields,
    description: { jp: "", uz: "", en: "", ru: "" } as TranslationFields,
    examples: { jp: [], uz: [], en: [], ru: [] } as Record<string, ExampleItem[]>
  })

  // =====================
  // DATA FETCHING
  // =====================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [grammarsRes, levelsRes] = await Promise.all([
        adminAPI.getGrammars(),
        adminAPI.getLevels()
      ])
      
      const fetchedGrammars = grammarsRes.data?.data || grammarsRes.data || []
      const fetchedLevels = levelsRes.data?.data || levelsRes.data || []
      
      setGrammars(fetchedGrammars)
      setLevels(fetchedLevels)
      
      if (!activeLevelId && fetchedLevels.length > 0) {
        setActiveLevelId(fetchedLevels[0].id)
      }
    } catch (error) {
      toast.error("Grammatikalarni yuklashda xatolik!")
    } finally {
      setLoading(false)
    }
  }, [activeLevelId])

  useEffect(() => {
    if (status === "authenticated") fetchData()
  }, [status, fetchData])

  // =====================
  // UNIQUE ID GENERATOR
  // =====================
  const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // =====================
  // TXT FILE PARSER
  // =====================
  const handleTxtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const lines = content.split('\n').map(l => l.trim()).filter(l => l !== "")
      
      const newExamples: ExampleItem[] = []
      let currentJp = ""

      lines.forEach((line) => {
        const numberedMatch = line.match(/^\d+[\.\)]\s*(.+?)\s*[-–—]\s*(.+)$/)
        if (numberedMatch) {
          newExamples.push({
            id: generateUniqueId(),
            jp: numberedMatch[1].trim(),
            translation: numberedMatch[2].trim()
          })
          return
        }

        const jpMatch = line.match(/^(?:Yaponcha|Japanese|JP)[：:]\s*(.+)$/i)
        if (jpMatch) {
          currentJp = jpMatch[1].trim()
          return
        }

        const translationMatch = line.match(/^(?:Tarjima|Translation|UZ|EN|RU)[：:]\s*(.+)$/i)
        if (translationMatch && currentJp) {
          newExamples.push({
            id: generateUniqueId(),
            jp: currentJp,
            translation: translationMatch[1].trim()
          })
          currentJp = ""
          return
        }

        if (currentJp && !line.startsWith('Yaponcha:') && !line.startsWith('Tarjima:')) {
          newExamples.push({
            id: generateUniqueId(),
            jp: currentJp,
            translation: line
          })
          currentJp = ""
        }
      })

      if (newExamples.length > 0) {
        setFormData(prev => ({
          ...prev,
          examples: {
            ...prev.examples,
            [activeLang]: [...(prev.examples[activeLang] || []), ...newExamples]
          }
        }))
        toast.success(`${CONTENT_LANGUAGES.find(l => l.code === activeLang)?.label} tiliga ${newExamples.length} ta misol qo'shildi`)
      } else {
        toast.error("Fayldan misollar topilmadi. Formatni tekshiring.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  // =====================
  // EXAMPLE HANDLERS
  // =====================
  const addExampleRow = () => {
    setFormData(p => ({
      ...p,
      examples: {
        ...p.examples,
        [activeLang]: [...(p.examples[activeLang] || []), { 
          id: generateUniqueId(), 
          jp: "", 
          translation: "" 
        }]
      }
    }))
  }

  const removeExampleRow = (id: string | number) => {
    setFormData(p => ({
      ...p,
      examples: {
        ...p.examples,
        [activeLang]: (p.examples[activeLang] || []).filter(r => r.id !== id)
      }
    }))
    setSelectedExampleIds(prev => prev.filter(rowId => rowId !== id))
  }

  const removeSelectedExamples = () => {
    const currentSelected = selectedExampleIds || []
    if (currentSelected.length === 0) return

    setFormData(p => ({
      ...p,
      examples: {
        ...p.examples,
        [activeLang]: (p.examples[activeLang] || []).filter(r => !currentSelected.includes(r.id))
      }
    }))

    toast.success(`${currentSelected.length} ta misol o'chirildi`)
    setSelectedExampleIds([])
  }

  const toggleSelectAllExamples = (filteredRows: ExampleItem[]) => {
    const currentSelected = selectedExampleIds || []
    const filteredIds = filteredRows.map(r => r.id)
    
    const isAllFilteredSelected = filteredIds.length > 0 && 
      filteredIds.every(id => currentSelected.includes(id))

    if (isAllFilteredSelected) {
      setSelectedExampleIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      setSelectedExampleIds(prev => Array.from(new Set([...prev, ...filteredIds])))
    }
  }

  const toggleSelectExample = (id: string | number) => {
    setSelectedExampleIds(prev => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      return updated
    })
  }

  const updateExampleRow = (id: string | number, field: "jp" | "translation", value: string) => {
    setFormData(p => ({
      ...p,
      examples: {
        ...p.examples,
        [activeLang]: (p.examples[activeLang] || []).map(r => r.id === id ? { ...r, [field]: value } : r)
      }
    }))
  }

  // =====================
  // CRUD ACTIONS
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setSearchQuery("")
    setExampleSearchQuery("")
    setSelectedGrammarIds([])
    setSelectedExampleIds([])
    setShowOtherTitles(false)
    setFormData({
      level_id: activeLevelId ? String(activeLevelId) : "",
      title: { jp: "", uz: "", en: "", ru: "" },
      meaning: { jp: "", uz: "", en: "", ru: "" },
      description: { jp: "", uz: "", en: "", ru: "" },
      examples: { jp: [], uz: [], en: [], ru: [] }
    })
    setActiveLang("jp")
    setIsModalOpen(true)
  }

  const openEditModal = (grammar: Grammar) => {
    setEditingId(grammar.id)
    setSearchQuery("")
    setExampleSearchQuery("")
    setSelectedExampleIds([])
    setShowOtherTitles(false)
    
    const validateExamples = (examples?: ExampleItem[]): ExampleItem[] => {
      if (!examples || !Array.isArray(examples)) return []
      return examples.map((ex) => ({
        ...ex,
        id: ex.id || generateUniqueId()
      }))
    }
    
    setFormData({
      level_id: String(grammar.level_id),
      title: {
        jp: grammar.title?.jp || "",
        uz: grammar.title?.uz || "",
        en: grammar.title?.en || "",
        ru: grammar.title?.ru || ""
      },
      meaning: {
        jp: grammar.meaning?.jp || "",
        uz: grammar.meaning?.uz || "",
        en: grammar.meaning?.en || "",
        ru: grammar.meaning?.ru || ""
      },
      description: {
        jp: grammar.description?.jp || "",
        uz: grammar.description?.uz || "",
        en: grammar.description?.en || "",
        ru: grammar.description?.ru || ""
      },
      examples: {
        jp: validateExamples(grammar.examples?.jp),
        uz: validateExamples(grammar.examples?.uz),
        en: validateExamples(grammar.examples?.en),
        ru: validateExamples(grammar.examples?.ru)
      }
    })
    setActiveLang("jp")
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.level_id || !formData.title.jp) {
      return toast.error("Level va Yaponcha sarlavhani to'ldiring!")
    }
    
    try {
      // Yaponcha title boshqa tillarga avtomatik ko'chiriladi
      const title = {
        jp: formData.title.jp,
        uz: formData.title.uz || formData.title.jp,
        en: formData.title.en || formData.title.jp,
        ru: formData.title.ru || formData.title.jp,
      }

      const payload = {
        level_id: Number(formData.level_id),
        title: title,
        meaning: formData.meaning,
        description: formData.description,
        examples: formData.examples
      }

      if (editingId) {
        await adminAPI.updateGrammar(editingId, payload)
        toast.success("Grammatika yangilandi")
      } else {
        await adminAPI.createGrammar(payload)
        toast.success("Grammatika qo'shildi")
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteGrammar(id)
      toast.success("O'chirildi")
      fetchData()
    } catch (error) {
      toast.error("O'chirishda xatolik")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedGrammarIds.length === 0) return
    if (!confirm(`${selectedGrammarIds.length} ta grammatikani o'chirmoqchimisiz?`)) return
    
    try {
      await adminAPI.bulkDeleteGrammars(selectedGrammarIds)
      toast.success(`${selectedGrammarIds.length} ta grammatika o'chirildi`)
      setSelectedGrammarIds([])
      fetchData()
    } catch (error) {
      toast.error("Ommaviy o'chirishda xatolik")
    }
  }

  const toggleSelectGrammar = (id: number) => {
    setSelectedGrammarIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAllGrammars = () => {
    const filteredIds = filteredGrammars.map(g => g.id)
    const allSelected = filteredIds.length > 0 && 
      filteredIds.every(id => selectedGrammarIds.includes(id))
    
    if (allSelected) {
      setSelectedGrammarIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      setSelectedGrammarIds(prev => Array.from(new Set([...prev, ...filteredIds])))
    }
  }

  const filteredGrammars = grammars.filter(g => {
    const levelMatch = activeLevelId ? g.level_id === activeLevelId : true
    const searchMatch = searchQuery === "" || 
      (g.title?.jp || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.title?.uz || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.meaning?.jp || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.meaning?.uz || "").toLowerCase().includes(searchQuery.toLowerCase())
    return levelMatch && searchMatch
  })

  const filteredExamples = (formData.examples[activeLang] || []).filter(example => 
    example.jp.toLowerCase().includes(exampleSearchQuery.toLowerCase()) || 
    example.translation.toLowerCase().includes(exampleSearchQuery.toLowerCase())
  )

  const getTotalExamples = (examples?: Record<string, ExampleItem[]>) => {
    if (!examples) return 0
    return Object.values(examples).reduce((sum, arr) => sum + (arr?.length || 0), 0)
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            Grammatika
          </h1>
          <p className="text-sm text-slate-500 mt-1">Grammatik qoidalar va misollarni boshqarish.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} title="Yangilash">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateModal} className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* LEVEL FILTERS */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!activeLevelId ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLevelId(null)}
            className={!activeLevelId ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          >
            Barchasi
          </Button>
          {levels.map(level => (
            <Button
              key={level.id}
              variant={activeLevelId === level.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveLevelId(level.id)}
              className={activeLevelId === level.id ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              {level.title}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Grammatika qidirish..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-slate-950 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedGrammarIds.length > 0 && (
        <div className="mb-4 p-3 bg-red-50/60 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-2xl flex items-center justify-between">
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            {selectedGrammarIds.length} ta tanlandi
          </Badge>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleBulkDelete}
            className="h-8 px-3 rounded-lg text-xs gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> O'chirish
          </Button>
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={
                      filteredGrammars.length > 0 && 
                      filteredGrammars.every(g => selectedGrammarIds.includes(g.id))
                    }
                    onCheckedChange={toggleSelectAllGrammars}
                  />
                </TableHead>
                <TableHead className="w-[200px]">Grammatika</TableHead>
                <TableHead>Ma'nosi</TableHead>
                <TableHead className="w-[100px] text-center">Misol</TableHead>
                <TableHead className="w-[120px] text-center">Level</TableHead>
                <TableHead className="w-[120px] text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrammars.length > 0 ? filteredGrammars.map((grammar) => (
                <TableRow key={grammar.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell>
                    <Checkbox 
                      checked={selectedGrammarIds.includes(grammar.id)}
                      onCheckedChange={() => toggleSelectGrammar(grammar.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {grammar.title?.jp || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {grammar.meaning?.uz || grammar.meaning?.jp || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {getTotalExamples(grammar.examples)} ta
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {grammar.level?.title || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(grammar)}>
                        <Edit className="h-4 w-4 text-indigo-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(grammar.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                    {searchQuery ? "Qidiruv bo'yicha grammatika topilmadi." : "Hozircha grammatikalar yo'q."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto p-0 border-none rounded-3xl"
          aria-describedby="grammar-dialog-description"
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              {editingId ? "Grammatikani tahrirlash" : "Yangi grammatika qo'shish"}
            </DialogTitle>
            <DialogDescription id="grammar-dialog-description">
              {editingId 
                ? "Grammatika ma'lumotlarini o'zgartirish va yangilash." 
                : "Yangi grammatika qoidasi va unga oid misollar kiritish."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Level Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Level *
              </label>
              <select 
                className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500"
                value={formData.level_id}
                onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
              >
                <option value="">Level tanlang</option>
                {levels.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            {/* Title - FAQAT YAPONCHA (asosiy) */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-500" />
                  Sarlavha (Title) *
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOtherTitles(!showOtherTitles)}
                  className="text-xs gap-1"
                >
                  {showOtherTitles ? (
                    <><EyeOff className="h-3 w-3" /> Boshqa tillarni yashirish</>
                  ) : (
                    <><Eye className="h-3 w-3" /> Boshqa tillar</>
                  )}
                </Button>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Languages className="h-3 w-3" />
                  Yaponcha *
                </label>
                <Input 
                  placeholder="Yaponcha sarlavha... (barcha tillar uchun asosiy)"
                  value={formData.title.jp || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, jp: e.target.value }
                  })}
                  className="bg-white dark:bg-slate-950 font-medium text-lg"
                />
                <p className="text-[11px] text-slate-400">
                  Bu sarlavha barcha tillarda ko'rsatiladi (agar boshqa til uchun alohida kiritilmasa)
                </p>
              </div>

              {/* Boshqa tillar - optional */}
              {showOtherTitles && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {["uz", "en", "ru"].map(code => (
                    <div key={code} className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {code === "uz" ? "O'zbekcha" : code === "en" ? "Inglizcha" : "Ruscha"} 
                        <span className="text-slate-400 ml-1">(ixtiyoriy)</span>
                      </label>
                      <Input 
                        placeholder={`Agar bo'sh qolsa, yaponcha ko'rinadi`}
                        value={formData.title[code] || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          title: { ...formData.title, [code]: e.target.value }
                        })}
                        className="bg-white dark:bg-slate-950"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meaning Fields */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                Ma'nosi (Meaning)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONTENT_LANGUAGES.map(lang => (
                  <div key={lang.code} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {lang.label}
                    </label>
                    <Input 
                      placeholder={`${lang.label} ma'nosi...`}
                      value={formData.meaning[lang.code] || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        meaning: { ...formData.meaning, [lang.code]: e.target.value }
                      })}
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Description Fields */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Tavsif (Description)
              </h4>
              {CONTENT_LANGUAGES.map(lang => (
                <div key={lang.code} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {lang.label}
                  </label>
                  <Textarea 
                    rows={2}
                    placeholder={`${lang.label} tavsif...`}
                    value={formData.description[lang.code] || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      description: { ...formData.description, [lang.code]: e.target.value }
                    })}
                    className="bg-white dark:bg-slate-950 resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Examples Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                    <ListOrdered className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Misollar (Examples)</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="file" 
                    id="txt-file-upload" 
                    className="hidden" 
                    accept=".txt" 
                    onChange={handleTxtFileUpload}
                  />
                  <Button 
                    variant="outline" 
                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => document.getElementById('txt-file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> TXT yuklash
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={addExampleRow}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Misol qo'shish
                  </Button>
                </div>
              </div>

              {/* TXT Format Info */}
              <div className="mb-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>TXT format:</strong> Har bir qatorda "Yaponcha: matn" va keyingi qatorda "Tarjima: matn" yozing. 
                  Yoki "1. yaponcha - tarjima" formatida ham yozishingiz mumkin.
                </p>
              </div>

              {/* Language Tabs & Example Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-700">
                  {CONTENT_LANGUAGES.map(lang => (
                    <Button
                      key={lang.code}
                      type="button"
                      variant={activeLang === lang.code ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setActiveLang(lang.code)
                        setExampleSearchQuery("")
                      }}
                      className={`gap-1.5 px-4 h-9 rounded-lg font-medium transition-all ${
                        activeLang === lang.code 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <Languages className="h-3.5 w-3.5 opacity-70" />
                      {lang.label}
                      <Badge className={`ml-1 px-1.5 py-0 text-[10px] ${activeLang === lang.code ? "bg-white text-indigo-600" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"}`}>
                        {formData.examples[lang.code]?.length || 0}
                      </Badge>
                    </Button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Misollar ichidan qidirish..." 
                    value={exampleSearchQuery}
                    onChange={(e) => setExampleSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white dark:bg-slate-950 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Qolgan example qismi o'zgarishsiz... */}
              {/* Bulk Example Actions, Example Rows, Empty state */}
              {/* ... (yuqoridagi kod bilan bir xil) ... */}
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-base font-bold shadow-lg shadow-indigo-200 dark:shadow-none" onClick={handleSubmit}>
              {editingId ? "Yangilash" : "Grammatikani saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}