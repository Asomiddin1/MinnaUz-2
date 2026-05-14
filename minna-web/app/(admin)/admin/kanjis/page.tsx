"use client"

import { useEffect, useState, useCallback } from "react"
import { adminAPI } from "@/lib/api/admin"
import { useSession } from "next-auth/react"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, RefreshCcw, PenTool, Plus, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"

type Level = { id: number; title: string; slug: string }
type Example = { japanese: string; translation: string }
type Kanji = {
  id: number; level_id: number; character: string; meaning: string;
  kunyomi: string | null; onyomi: string | null; examples: Example[] | null; level?: Level
}

const AdminKanjiPage = () => {
  const { status } = useSession()
  const [kanjis, setKanjis] = useState<Kanji[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTxtModalOpen, setIsTxtModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    level_id: "", character: "", meaning: "", kunyomi: "", onyomi: "", examples: [] as Example[]
  })

  const [txtFile, setTxtFile] = useState<File | null>(null)
  const [selectedLevelForTxt, setSelectedLevelForTxt] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [levelsRes, kanjisRes] = await Promise.all([adminAPI.getLevels(), adminAPI.getKanjis()])
      setLevels(levelsRes.data?.data || levelsRes.data || [])
      setKanjis(kanjisRes.data?.data || kanjisRes.data || [])
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (status === "authenticated") fetchData() }, [status, fetchData])

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ level_id: "", character: "", meaning: "", kunyomi: "", onyomi: "", examples: [] })
    setIsModalOpen(true)
  }

  const openEditModal = (kanji: Kanji) => {
    setEditingId(kanji.id)
    setFormData({
      level_id: kanji.level_id.toString(), character: kanji.character, meaning: kanji.meaning,
      kunyomi: kanji.kunyomi || "", onyomi: kanji.onyomi || "", examples: kanji.examples || []
    })
    setIsModalOpen(true)
  }

  const handleExampleChange = (index: number, field: keyof Example, value: string) => {
    const newExamples = [...formData.examples]
    newExamples[index][field] = value
    setFormData({ ...formData, examples: newExamples })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.character || !formData.meaning || !formData.level_id) {
        toast.error("Iyeroglif, ma'nosi va daraja majburiy")
        return
      }
      const cleanExamples = formData.examples.filter(e => e.japanese.trim() !== "")
      const payload = { ...formData, level_id: Number(formData.level_id), examples: cleanExamples }

      if (editingId) {
        await adminAPI.updateKanji(editingId, payload)
        toast.success("Kanji yangilandi")
      } else {
        await adminAPI.createKanji(payload)
        toast.success("Yangi kanji qo'shildi")
      }
      setIsModalOpen(false); fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi")
    }
  }

  const handleTxtUpload = async () => {
    if (!txtFile || !selectedLevelForTxt) return toast.error("Darajani tanlang va fayl yuklang")
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const blocks = text.split("===")
      const parsed = []

      for (const block of blocks) {
        if (!block.trim()) continue
        const lines = block.split("\n").map(l => l.trim())
        const kanji = { character: "", meaning: "", kunyomi: "", onyomi: "", examples: [] as Example[] }
        let currentExample: Partial<Example> = {}

        for (const line of lines) {
          if (line.startsWith("Character:")) kanji.character = line.replace("Character:", "").trim()
          else if (line.startsWith("Meaning:")) kanji.meaning = line.replace("Meaning:", "").trim()
          else if (line.startsWith("Kunyomi:")) kanji.kunyomi = line.replace("Kunyomi:", "").trim()
          else if (line.startsWith("Onyomi:")) kanji.onyomi = line.replace("Onyomi:", "").trim()
          else if (line.startsWith("JP:")) currentExample.japanese = line.replace("JP:", "").trim()
          else if (line.startsWith("UZ:")) {
            currentExample.translation = line.replace("UZ:", "").trim()
            if (currentExample.japanese) { kanji.examples.push({ japanese: currentExample.japanese, translation: currentExample.translation }); currentExample = {} }
          }
        }
        if (kanji.character) parsed.push(kanji)
      }

      try {
        for (const item of parsed) await adminAPI.createKanji({ ...item, level_id: Number(selectedLevelForTxt) })
        toast.success(`${parsed.length} ta kanji qo'shildi!`)
        setIsTxtModalOpen(false); setTxtFile(null); fetchData()
      } catch (err) { toast.error("Yuklashda xatolik") } finally { setIsUploading(false) }
    }
    reader.readAsText(txtFile)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirmoqchimisiz?")) return
    try { await adminAPI.deleteKanji(id); toast.success("O'chirildi"); fetchData() } 
    catch (error) { toast.error("O'chirishda xatolik") }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PenTool className="h-6 w-6 text-blue-500" /> Kanjilar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Darajalar bo'yicha iyerogliflarni boshqarish.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">Jami: {kanjis.length}</Badge>
          <Button variant="outline" size="icon" onClick={fetchData}><RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button variant="secondary" onClick={() => setIsTxtModalOpen(true)} className="gap-2 border border-slate-200"><Upload className="h-4 w-4" /> TXT Yuklash</Button>
          <Button onClick={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4" /> Qo'shish</Button>
        </div>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-slate-900"><Table><TableBody>{[1, 2, 3].map((i) => <TableRow key={i} className="border-b"><TableCell><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}</TableBody></Table></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-slate-900">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Daraja</TableHead><TableHead>Kanji</TableHead><TableHead>Ma'nosi</TableHead><TableHead>O'qilishi (K/O)</TableHead><TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kanjis.length > 0 ? kanjis.map((k) => (
                <TableRow key={k.id}>
                  <TableCell><Badge variant="outline">{k.level?.title || "Noma'lum"}</Badge></TableCell>
                  <TableCell className="text-2xl font-bold">{k.character}</TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300">{k.meaning}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    <div>K: {k.kunyomi || "-"}</div><div>O: {k.onyomi || "-"}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(k)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(k.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={5} className="text-center py-10">Kanjilar yo'q.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Kanjini tahrirlash" : "Yangi kanji"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Daraja <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm" value={formData.level_id} onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}>
                <option value="" disabled>-- Tanlang --</option>
                {levels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Iyeroglif <span className="text-red-500">*</span></label><Input value={formData.character} onChange={(e) => setFormData({ ...formData, character: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Ma'nosi <span className="text-red-500">*</span></label><Input value={formData.meaning} onChange={(e) => setFormData({ ...formData, meaning: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Kunyomi</label><Input value={formData.kunyomi} onChange={(e) => setFormData({ ...formData, kunyomi: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Onyomi</label><Input value={formData.onyomi} onChange={(e) => setFormData({ ...formData, onyomi: e.target.value })} /></div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-4"><label className="text-sm font-medium">Namunalar</label><Button size="sm" variant="outline" onClick={() => setFormData({ ...formData, examples: [...formData.examples, { japanese: "", translation: "" }] })}><Plus className="h-3 w-3 mr-1" /> Qo'shish</Button></div>
              <div className="space-y-3">
                {formData.examples.map((ex, i) => (
                  <div key={i} className="flex gap-2 bg-slate-50 p-3 rounded-lg dark:bg-slate-800/50">
                    <div className="flex-1 space-y-2"><Input placeholder="JP" value={ex.japanese} onChange={(e) => handleExampleChange(i, "japanese", e.target.value)} /><Input placeholder="UZ" value={ex.translation} onChange={(e) => handleExampleChange(i, "translation", e.target.value)} /></div>
                    <Button size="icon" variant="destructive" onClick={() => { const nx = [...formData.examples]; nx.splice(i, 1); setFormData({...formData, examples: nx}) }}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button><Button onClick={handleSubmit}>Saqlash</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TXT MODAL */}
      <Dialog open={isTxtModalOpen} onOpenChange={setIsTxtModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>TXT orqali Kanjilarni yuklash</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <select className="w-full h-10 px-3 py-2 rounded-md border" value={selectedLevelForTxt} onChange={(e) => setSelectedLevelForTxt(e.target.value)}><option value="" disabled>-- Darajani tanlang --</option>{levels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
            <Input type="file" accept=".txt" onChange={(e) => setTxtFile(e.target.files?.[0] || null)} />
            <pre className="text-[10px] p-2 bg-slate-100 rounded">Character: 水{"\n"}Meaning: Suv{"\n"}Kunyomi: みず{"\n"}Onyomi: スイ{"\n"}JP: 水を飲む{"\n"}UZ: Suv ichish{"\n"}===</pre>
          </div>
          <DialogFooter><Button onClick={handleTxtUpload} disabled={isUploading || !txtFile}>{isUploading ? "Yuklanmoqda..." : "Yuklash"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminKanjiPage