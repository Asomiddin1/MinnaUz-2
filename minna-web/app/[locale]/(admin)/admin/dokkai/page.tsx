"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { adminAPI } from "@/lib/api/admin"

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
import {
  Plus,
  Trash2,
  Edit,
  RefreshCcw,
  BookText,
  LayoutTemplate,
  Type,
  BookOpen,
  HelpCircle,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPES
// =====================
type Article = {
  id: number
  title: string
  level: string
  date: string
  imageUrl?: string
  audioUrl?: string
  content?: any[]
  vocabulary?: any[]
  quizzes?: any[]
}

const emptyBasic = {
  title: "",
  level: "N5",
  imageUrl: "",
  audioUrl: "",
  date: new Date().toLocaleDateString("en-GB"),
}

const emptyContentRow = {
  word: "",
  furigana: "",
  translation: "",
  grammar: "",
  level: "",
  paragraphIndex: 1,
  sentenceIndex: 1,
}

const emptyVocabRow = {
  kanji: "",
  furigana: "",
  meaning: "",
  type: "Noun",
  level: "N5",
}

const emptyQuiz = {
  question: "",
  explanation: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
}

const DokkaiPage = () => {
  const { status } = useSession()

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // AI sub-modal
  const [showAiModal, setShowAiModal] = useState(false)
  const [rawText, setRawText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Form state
  const [basicInfo, setBasicInfo] = useState(emptyBasic)
  const [content, setContent] = useState([{ ...emptyContentRow }])
  const [vocabulary, setVocabulary] = useState([{ ...emptyVocabRow }])
  const [quizzes, setQuizzes] = useState([
    { ...emptyQuiz, options: emptyQuiz.options.map((o) => ({ ...o })) },
  ])

  // =====================
  // FETCH
  // =====================
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getArticles()
      if (Array.isArray(response.data)) {
        setArticles(response.data)
      } else if (response.data?.data) {
        setArticles(response.data.data)
      } else {
        setArticles([])
      }
    } catch (error) {
      console.error("API xatosi:", error)
      toast.error("Maqolalarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchArticles()
    }
  }, [status, fetchArticles])

  // =====================
  // MODAL CONTROL
  // =====================
  const resetForm = () => {
    setBasicInfo({ ...emptyBasic })
    setContent([{ ...emptyContentRow }])
    setVocabulary([{ ...emptyVocabRow }])
    setQuizzes([
      { ...emptyQuiz, options: emptyQuiz.options.map((o) => ({ ...o })) },
    ])
    setActiveTab("basic")
  }

  const openCreateModal = () => {
    setEditingId(null)
    resetForm()
    setIsModalOpen(true)
  }

  // Jadvaldagi mavjud article obyektidan to'ldiramiz (qo'shimcha API chaqirilmaydi)
  const openEditModal = (article: Article) => {
    setEditingId(article.id)
    setActiveTab("basic")

    setBasicInfo({
      title: article.title || "",
      level: article.level || "N5",
      imageUrl: article.imageUrl || "",
      audioUrl: article.audioUrl || "",
      date: article.date || new Date().toLocaleDateString("en-GB"),
    })
    setContent(
      article.content?.length ? article.content : [{ ...emptyContentRow }]
    )
    setVocabulary(
      article.vocabulary?.length ? article.vocabulary : [{ ...emptyVocabRow }]
    )
    setQuizzes(
      article.quizzes?.length
        ? article.quizzes
        : [{ ...emptyQuiz, options: emptyQuiz.options.map((o) => ({ ...o })) }]
    )

    setIsModalOpen(true)
  }

  // =====================
  // SUBMIT
  // =====================
  const handleSubmit = async () => {
    if (!basicInfo.title.trim()) {
      toast.error("Sarlavhani kiriting")
      setActiveTab("basic")
      return
    }
    setIsSaving(true)
    try {
      const payload = { ...basicInfo, content, vocabulary, quizzes }
      if (editingId) {
        await adminAPI.updateArticle(editingId, payload)
        toast.success("Maqola yangilandi")
      } else {
        await adminAPI.createArticle(payload)
        toast.success("Maqola muvaffaqiyatli saqlandi")
      }
      setIsModalOpen(false)
      fetchArticles()
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Xatolik yuz berdi")
    } finally {
      setIsSaving(false)
    }
  }

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu maqolani o'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteArticle(id)
      toast.success("Maqola o'chirildi")
      fetchArticles()
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi")
    }
  }

  // =====================
  // AI GENERATE
  // =====================
  const handleAiGenerate = async () => {
    if (!rawText.trim()) return toast.error("Iltimos, matn kiriting!")
    setIsGenerating(true)
    try {
      const response = await adminAPI.generateDokkaiContent({ text: rawText })
      if (response.data?.content) {
        setContent(response.data.content)
        setShowAiModal(false)
        setRawText("")
        toast.success("Matn muvaffaqiyatli tahlil qilindi")
      }
    } catch (error) {
      console.error("AI xatoligi:", error)
      toast.error("AI bilan bog'lanishda xatolik yuz berdi")
    } finally {
      setIsGenerating(false)
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
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-12 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
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

  const tabs = [
    {
      id: "basic",
      label: "Asosiy",
      icon: <LayoutTemplate className="h-4 w-4" />,
    },
    { id: "content", label: "Matn", icon: <Type className="h-4 w-4" /> },
    { id: "vocab", label: "Lug'at", icon: <BookOpen className="h-4 w-4" /> },
    { id: "quiz", label: "Testlar", icon: <HelpCircle className="h-4 w-4" /> },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BookText className="h-6 w-6 text-blue-500" />
            Dokkai (O'qish matnlari)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O'qish matnlari, lug'at va testlarni boshqarish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800"
          >
            Jami: {articles.length}
          </Badge>
          <Button variant="outline" size="icon" onClick={fetchArticles}>
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
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
                <TableHead>Id</TableHead>
                <TableHead>Sarlavha</TableHead>
                <TableHead>Daraja</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length > 0 ? (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium text-slate-500">
                      #{article.id}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {article.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {article.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(article)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(article.id)}
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
                    Hozircha maqolalar qo'shilmagan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Maqolani tahrirlash" : "Yangi Dokkai qo'shish"}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="mt-2 flex gap-2 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="py-4">
            {/* BASIC */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">
                    Sarlavha <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={basicInfo.title}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, title: e.target.value })
                    }
                    placeholder="Yaponcha sarlavha (tarjimasi bilan)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daraja</label>
                  <select
                    value={basicInfo.level}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, level: e.target.value })
                    }
                    className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                  >
                    {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Sana (dd/mm/yyyy)
                  </label>
                  <Input
                    value={basicInfo.date}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, date: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Rasm URL</label>
                  <Input
                    value={basicInfo.imageUrl}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, imageUrl: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Audio URL</label>
                  <Input
                    value={basicInfo.audioUrl}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, audioUrl: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* CONTENT */}
            {activeTab === "content" && (
              <div>
                <div className="mb-4 flex items-center justify-between rounded-md border border-purple-200 bg-purple-50 p-3 text-sm dark:border-purple-900 dark:bg-purple-950/30">
                  <span className="text-slate-600 dark:text-slate-300">
                    So'zlarni qo'lda yoki AI orqali to'ldiring.
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setShowAiModal(true)}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="h-4 w-4" /> AI Generate
                  </Button>
                </div>

                {content.map((item, index) => (
                  <div
                    key={index}
                    className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border bg-slate-50 p-3 dark:bg-slate-800/50"
                  >
                    <div className="w-24">
                      <label className="text-xs text-slate-500">So'z</label>
                      <Input
                        value={item.word}
                        onChange={(e) => {
                          const n = [...content]
                          n[index].word = e.target.value
                          setContent(n)
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-slate-500">Furigana</label>
                      <Input
                        value={item.furigana}
                        onChange={(e) => {
                          const n = [...content]
                          n[index].furigana = e.target.value
                          setContent(n)
                        }}
                      />
                    </div>
                    <div className="min-w-[140px] flex-1">
                      <label className="text-xs text-slate-500">Tarjima</label>
                      <Input
                        value={item.translation}
                        onChange={(e) => {
                          const n = [...content]
                          n[index].translation = e.target.value
                          setContent(n)
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-slate-500">
                        Grammatika
                      </label>
                      <Input
                        value={item.grammar}
                        placeholder="Ot, Fe'l..."
                        onChange={(e) => {
                          const n = [...content]
                          n[index].grammar = e.target.value
                          setContent(n)
                        }}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setContent(content.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-600"
                  onClick={() =>
                    setContent([...content, { ...emptyContentRow }])
                  }
                >
                  <Plus className="h-4 w-4" /> Yangi so'z qo'shish
                </Button>
              </div>
            )}

            {/* VOCAB */}
            {activeTab === "vocab" && (
              <div>
                {vocabulary.map((vocab, index) => (
                  <div
                    key={index}
                    className="mb-3 grid grid-cols-5 items-end gap-2 rounded-lg border bg-slate-50 p-3 dark:bg-slate-800/50"
                  >
                    <div>
                      <label className="text-xs text-slate-500">Kanji</label>
                      <Input
                        value={vocab.kanji}
                        onChange={(e) => {
                          const n = [...vocabulary]
                          n[index].kanji = e.target.value
                          setVocabulary(n)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Furigana</label>
                      <Input
                        value={vocab.furigana}
                        onChange={(e) => {
                          const n = [...vocabulary]
                          n[index].furigana = e.target.value
                          setVocabulary(n)
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500">Ma'nosi</label>
                      <Input
                        value={vocab.meaning}
                        onChange={(e) => {
                          const n = [...vocabulary]
                          n[index].meaning = e.target.value
                          setVocabulary(n)
                        }}
                      />
                    </div>
                    <div className="flex items-end gap-1">
                      <div className="w-full">
                        <label className="text-xs text-slate-500">Daraja</label>
                        <select
                          value={vocab.level}
                          onChange={(e) => {
                            const n = [...vocabulary]
                            n[index].level = e.target.value
                            setVocabulary(n)
                          }}
                          className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                        >
                          {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setVocabulary(
                            vocabulary.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-600"
                  onClick={() =>
                    setVocabulary([...vocabulary, { ...emptyVocabRow }])
                  }
                >
                  <Plus className="h-4 w-4" /> Lug'at qo'shish
                </Button>
              </div>
            )}

            {/* QUIZ */}
            {activeTab === "quiz" && (
              <div>
                {quizzes.map((quiz, qIndex) => (
                  <div
                    key={qIndex}
                    className="mb-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-900"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="w-full space-y-1">
                        <label className="text-sm font-medium">
                          Savol {qIndex + 1}
                        </label>
                        <textarea
                          value={quiz.question}
                          rows={2}
                          onChange={(e) => {
                            const n = [...quizzes]
                            n[qIndex].question = e.target.value
                            setQuizzes(n)
                          }}
                          className="w-full rounded-md border bg-transparent p-2 text-sm"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setQuizzes(quizzes.filter((_, i) => i !== qIndex))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {quiz.options.map((opt, oIndex) => (
                        <div
                          key={oIndex}
                          className="flex items-center gap-2 rounded-md border bg-slate-50 p-2 dark:bg-slate-800/50"
                        >
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={opt.isCorrect}
                            onChange={() => {
                              const n = [...quizzes]
                              n[qIndex].options.forEach(
                                (o) => (o.isCorrect = false)
                              )
                              n[qIndex].options[oIndex].isCorrect = true
                              setQuizzes(n)
                            }}
                          />
                          <input
                            type="text"
                            value={opt.text}
                            placeholder={`Variant ${oIndex + 1}`}
                            onChange={(e) => {
                              const n = [...quizzes]
                              n[qIndex].options[oIndex].text = e.target.value
                              setQuizzes(n)
                            }}
                            className="w-full bg-transparent text-sm focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-600"
                  onClick={() =>
                    setQuizzes([
                      ...quizzes,
                      {
                        ...emptyQuiz,
                        options: emptyQuiz.options.map((o) => ({ ...o })),
                      },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" /> Yangi savol qo'shish
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saqlanmoqda..." : editingId ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI SUB-MODAL */}
      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" /> AI Matn Analizi
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yaponcha matnni kiriting. AI uni so'zlarga ajratib, furigana va
            tarjimalarni to'ldirib beradi.
          </p>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Masalan: 私は毎日コーヒーを飲みます。"
            className="min-h-[150px] w-full rounded-lg border bg-transparent p-3 text-sm focus:border-purple-500 focus:outline-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAiModal(false)}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleAiGenerate}
              disabled={isGenerating || !rawText.trim()}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generatsiya..." : "Generatsiya qilish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DokkaiPage
