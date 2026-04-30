"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api";

// UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, Trash2, Plus, Loader2, Clock, AlignLeft, CheckCircle2, BookOpen, Headphones, Languages } from "lucide-react";

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    question: "", type: "grammar", option1: "", option2: "", option3: "", option4: "", answer: "", time: "", text: "", 
  });

  const sections = useMemo(() => {
    return {
      language: questions.filter(q => ["grammar", "vocabulary", "kanji"].includes(q.type)),
      reading: questions.filter(q => q.type === "reading"),
      listening: questions.filter(q => q.type === "listening"),
    };
  }, [questions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testRes, qRes] = await Promise.all([
        adminAPI.getTestById(Number(testId)),
        adminAPI.getQuestionsByTestId(Number(testId)),
      ]);
      setTest(testRes.data.data || testRes.data);
      setQuestions(qRes.data.data || qRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testId) fetchData();
  }, [testId]);

  const openModal = (question: any = null) => {
    if (question) {
      setEditingId(question.id);
      setFormData({
        question: question.question,
        type: question.type,
        option1: question.options[0] || "",
        option2: question.options[1] || "",
        option3: question.options[2] || "",
        option4: question.options[3] || "",
        answer: question.answer,
        time: question.time?.toString() || "",
        text: question.text || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        question: "", type: "grammar", option1: "", option2: "", option3: "", option4: "", answer: "", time: "", text: "" 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        test_id: Number(testId),
        type: formData.type,
        level: test?.level || "N5",
        question: formData.question,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        answer: formData.answer,
        time: formData.type === "listening" ? Number(formData.time) : null,
        text: (formData.type === "reading" || formData.type === "listening") ? formData.text : null,
      };

      if (editingId) {
        await adminAPI.updateQuestion(editingId, payload);
      } else {
        await adminAPI.createQuestion(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Xatolik!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("O'chirmoqchimisiz?")) {
      await adminAPI.deleteQuestion(id);
      fetchData();
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-blue-500" /></div>;

  const RenderQuestionTable = ({ data, title, icon: Icon, color }: any) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h2>
        <Badge variant="outline" className="ml-auto">{data.length} ta savol</Badge>
      </div>

      <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="w-12">No</TableHead>
              <TableHead>Turi</TableHead>
              <TableHead className="min-w-[200px]">Savol</TableHead>
              <TableHead>Ma'lumot</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-400 italic">Ushbu bo'limda savollar mavjud emas</TableCell></TableRow>
            ) : data.map((q: any, i: number) => (
              <TableRow key={q.id}>
                <TableCell className="font-mono text-slate-400">{i + 1}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize text-[10px]">{q.type}</Badge></TableCell>
                <TableCell className="font-medium max-w-[400px] truncate">{q.question}</TableCell>
                <TableCell>
                  {q.type === 'listening' && q.time ? (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold"><Clock className="h-3 w-3" /> {Math.floor(q.time/60)}:{(q.time%60).toString().padStart(2,'0')}</span>
                  ) : q.text ? (
                    <span className="text-blue-500 text-xs flex items-center gap-1"><AlignLeft className="h-3 w-3" /> Matn bor</span>
                  ) : "—"}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openModal(q)} className="h-8 w-8 text-blue-500"><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)} className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/tests")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{test?.title}</h1>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-emerald-500">{test?.level}</Badge>
              <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">{test?.type}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" /> Yangi Savol Qo'shish
        </Button>
      </div>

      <div className="space-y-12">
        <RenderQuestionTable title="Language Knowledge (Moji, Goi, Bunpou)" data={sections.language} icon={Languages} color="bg-purple-100 text-purple-600" />
        <RenderQuestionTable title="Reading (Dokkai)" data={sections.reading} icon={BookOpen} color="bg-blue-100 text-blue-600" />
        <RenderQuestionTable title="Listening (Choukai)" data={sections.listening} icon={Headphones} color="bg-amber-100 text-amber-600" />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5 text-amber-500" /> : <Plus className="h-5 w-5 text-indigo-500" />}
              {editingId ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Savol turi</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vocabulary">Vocabulary (Goi)</SelectItem>
                    <SelectItem value="kanji">Kanji (Moji)</SelectItem>
                    <SelectItem value="grammar">Grammar (Bunpou)</SelectItem>
                    <SelectItem value="reading">Reading (Dokkai)</SelectItem>
                    <SelectItem value="listening">Listening (Choukai)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "listening" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-xs uppercase font-bold text-amber-600 flex items-center gap-1"><Clock className="h-3 w-3" /> Audio boshlanish vaqti</Label>
                  <Input type="number" required placeholder="Sekundlarda (masalan: 120)" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="bg-white dark:bg-slate-950 border-amber-200 focus-visible:ring-amber-500" />
                </div>
              )}
            </div>

            {(formData.type === "reading" || formData.type === "listening") && (
              <div className="space-y-2 animate-in zoom-in-95 duration-200">
                <Label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1">
                  <AlignLeft className="h-3 w-3" /> {formData.type === "reading" ? "O'qish matni (Passage)" : "Audio Transkripti"}
                </Label>
                <Textarea required={formData.type === "reading"} placeholder="Matnni kiriting..." value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} className="min-h-[150px] bg-white dark:bg-slate-950" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-slate-500">Savol matni</Label>
              <Input required value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} placeholder="Savolni kiriting..." className="bg-white dark:bg-slate-950" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50/50">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Variant {n}</Label>
                  <Input required value={(formData as any)[`option${n}`]} onChange={(e) => setFormData({...formData, [`option${n}`]: e.target.value})} className="bg-white dark:bg-slate-950" />
                </div>
              ))}
            </div>

            {/* ✅ JAVOB UCHUN "SELECT" ISHLATILDI, TYPOLARNI OLDINI OLADI */}
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> To'g'ri javob
              </Label>
              <Select value={formData.answer} onValueChange={(v) => setFormData({...formData, answer: v})}>
                <SelectTrigger className="border-emerald-200 bg-white dark:bg-slate-950">
                  <SelectValue placeholder="To'g'ri javob qaysi variantda ekanligini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => {
                    const optText = (formData as any)[`option${n}`];
                    // Admin agar variantga nimadir yozgan bo'lsa, uni tanlashi mumkin
                    return optText ? (
                      <SelectItem key={n} value={optText}>
                        Variant {n}: {optText}
                      </SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
              <Button type="submit" disabled={submitting || !formData.answer} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}