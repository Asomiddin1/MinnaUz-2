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
import { Edit, RefreshCcw, BookMarked, Plus, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"

type Level = { id: number; title: string; slug: string }
type Example = { japanese: string; translation: string }
type Vocabulary = {
  id: number; level_id: number; word: string; reading: string | null; meaning: string;
  type: string | null; examples: Example[] | null; level?: Level
}

const AdminVocabPage = () => {
  const { status } = useSession()
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTxtModalOpen, setIsTxtModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    level_id: "", word: "", reading: "", meaning: "", type: "", examples: [] as Example[]
  })

  const [txtFile, setTxtFile] = useState<File | null>(null)
  const [selectedLevelForTxt, setSelectedLevelForTxt] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [levelsRes, vocabRes] = await Promise.all([adminAPI.getLevels(), adminAPI.getVocabularies()])
      setLevels(levelsRes.data?.data || levelsRes.data || [])
      setVocabularies(vocabRes.data?.data || vocabRes.data || [])
    } catch (error) { toast.error("Yuklashda xatolik") } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (status === "authenticated") fetchData() }, [status, fetchData])

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ level_id: "", word: "", reading: "", meaning: "", type: "", examples: [] })
    setIsModalOpen(true)
  }

  const openEditModal = (vocab: Vocabulary) => {
    setEditingId(vocab.id)
    setFormData({
      level_id: vocab.level_id.toString(), word: vocab.word, reading: vocab.reading || "",
      meaning: vocab.meaning, type: vocab.type || "", examples: vocab.examples || []
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.word || !formData.meaning || !formData.level_id) {
        return toast.error("So'z, ma'nosi va daraja majburiy")
      }
      const cleanExamples = formData.examples.filter(e => e.japanese.trim() !== "")
      const payload = { ...formData, level_id: Number(formData.level_id), examples: cleanExamples }

      if (editingId) { await adminAPI.updateVocabulary(editingId, payload); toast.success("Yangilandi") } 
      else { await adminAPI.createVocabulary(payload); toast.success("Qo'shildi") }
      setIsModalOpen(false); fetchData()
    } catch (error: any) { toast.error(error.response?.data?.message || "Xato") }
  }

  const handleTxtUpload = async () => {
    if (!txtFile || !selectedLevelForTxt) return toast.error("Daraja va faylni tanlang")
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const blocks = text.split("===")
      const parsed = []

      for (const block of blocks) {
        if (!block.trim()) continue
        const lines = block.split("\n").map(l => l.trim())
        const vocab = { word: "", reading: "", meaning: "", type: "", examples: [] as Example[] }
        let currentExample: Partial<Example> = {}

        for (const line of lines) {
          if (line.startsWith("Word:")) vocab.word = line.replace("Word:", "").trim()
          else if (line.startsWith("Reading:")) vocab.reading = line.replace("Reading:", "").trim()
          else if (line.startsWith("Meaning:")) vocab.meaning = line.replace("Meaning:", "").trim()
          else if (line.startsWith("Type:")) vocab.type = line.replace("Type:", "").trim()
          else if (line.startsWith("JP:")) currentExample.japanese = line.replace("JP:", "").trim()
          else if (line.startsWith("UZ:")) {
            currentExample.translation = line.replace("UZ:", "").trim()
            if (currentExample.japanese) { vocab.examples.push({ japanese: currentExample.japanese, translation: currentExample.translation }); currentExample = {} }
          }
        }
        if (vocab.word) parsed.push(vocab)
      }

      try {
        for (const item of parsed) await adminAPI.createVocabulary({ ...item, level_id: Number(selectedLevelForTxt) })
        toast.success(`${parsed.length} ta lug'at qo'shildi!`)
        setIsTxtModalOpen(false); setTxtFile(null); fetchData()
      } catch (err) { toast.error("Yuklashda xato") } finally { setIsUploading(false) }
    }
    reader.readAsText(txtFile)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirmoqchimisiz?")) return
    try { await adminAPI.deleteVocabulary(id); toast.success("O'chirildi"); fetchData() } 
    catch (error) { toast.error("Xatolik") }
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-blue-500" /> Lug'atlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Yangi so'zlar va ularning turlarini boshqarish.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs">Jami: {vocabularies.length}</Badge>
          <Button variant="outline" size="icon" onClick={fetchData}><RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button variant="secondary" onClick={() => setIsTxtModalOpen(true)} className="gap-2 border"><Upload className="h-4 w-4" /> TXT Yuklash</Button>
          <Button onClick={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4" /> Qo'shish</Button>
        </div>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm"><Table><TableBody>{[1, 2, 3].map((i) => <TableRow key={i}><TableCell><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}</TableBody></Table></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow><TableHead>Daraja</TableHead><TableHead>So'z</TableHead><TableHead>Ma'nosi</TableHead><TableHead>Turkumi</TableHead><TableHead className="text-right">Amallar</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {vocabularies.length > 0 ? vocabularies.map((v) => (
                <TableRow key={v.id}>
                  <TableCell><Badge variant="outline">{v.level?.title || "Noma'lum"}</Badge></TableCell>
                  <TableCell>
                    <div className="font-bold text-lg text-slate-900">{v.word}</div>
                    <div className="text-sm text-slate-500">{v.reading}</div>
                  </TableCell>
                  <TableCell className="font-medium text-emerald-600">{v.meaning}</TableCell>
                  <TableCell>{v.type ? <Badge className="bg-blue-50 text-blue-600 shadow-none hover:bg-blue-100">{v.type}</Badge> : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(v)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={5} className="text-center py-10">Lug'atlar yo'q.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Lug'atni tahrirlash" : "Yangi lug'at"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Daraja <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 py-2 rounded-md border text-sm" value={formData.level_id} onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}>
                <option value="" disabled>-- Tanlang --</option>
                {levels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">So'z <span className="text-red-500">*</span></label><Input value={formData.word} onChange={(e) => setFormData({ ...formData, word: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">O'qilishi</label><Input value={formData.reading} onChange={(e) => setFormData({ ...formData, reading: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Ma'nosi <span className="text-red-500">*</span></label><Input value={formData.meaning} onChange={(e) => setFormData({ ...formData, meaning: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">So'z turkumi</label><Input placeholder="Masalan: Ot, Fe'l" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} /></div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-4"><label className="text-sm font-medium">Namunalar</label><Button size="sm" variant="outline" onClick={() => setFormData({ ...formData, examples: [...formData.examples, { japanese: "", translation: "" }] })}><Plus className="h-3 w-3 mr-1" /> Qo'shish</Button></div>
              <div className="space-y-3">
                {formData.examples.map((ex, i) => (
                  <div key={i} className="flex gap-2 bg-slate-50 p-3 rounded-lg">
                    <div className="flex-1 space-y-2"><Input placeholder="JP" value={ex.japanese} onChange={(e) => { const nx = [...formData.examples]; nx[i].japanese = e.target.value; setFormData({...formData, examples: nx}) }} /><Input placeholder="UZ" value={ex.translation} onChange={(e) => { const nx = [...formData.examples]; nx[i].translation = e.target.value; setFormData({...formData, examples: nx}) }} /></div>
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
          <DialogHeader><DialogTitle>TXT orqali Lug'atlarni yuklash</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <select className="w-full h-10 px-3 py-2 rounded-md border" value={selectedLevelForTxt} onChange={(e) => setSelectedLevelForTxt(e.target.value)}><option value="" disabled>-- Darajani tanlang --</option>{levels.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
            <Input type="file" accept=".txt" onChange={(e) => setTxtFile(e.target.files?.[0] || null)} />
            <pre className="text-[10px] p-2 bg-slate-100 rounded">Word: 食べる{"\n"}Reading: たべる{"\n"}Meaning: Yemoq{"\n"}Type: Fe'l{"\n"}JP: りんごを食べる{"\n"}UZ: Olma yeyish{"\n"}===</pre>
          </div>
          <DialogFooter><Button onClick={handleTxtUpload} disabled={isUploading || !txtFile}>{isUploading ? "Yuklanmoqda..." : "Yuklash"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminVocabPage