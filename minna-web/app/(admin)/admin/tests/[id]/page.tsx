"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api/admin";
import { toast } from "sonner";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, Edit, Trash2, Plus, Loader2, Clock, AlertCircle
} from "lucide-react";

interface Question {
  id: number;
  mondai_number: number;
  question_number: number;
  type: string;
  question_text: string;
  passage?: string;
  options: string[];
  correct_answer: string;
  points: number;
}

interface Section {
  id: number;
  name: string;
  type: string;
  questions: Question[];
}

interface Test {
  id: number;
  title: string;
  level: string;
  time: number;
  sections: Section[];
}

const INITIAL_FORM = {
  section_id: "",
  mondai_number: 1,
  question_number: 1,
  type: "vocabulary",
  question_text: "",
  passage: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_answer: "",
  points: 2,
};

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = Number(params.id);

  const [test, setTest] = useState<Test | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchData = useCallback(async () => {
    if (!testId || isNaN(testId)) return;

    try {
      setLoading(true);
      setError(null);

      const res = await adminAPI.getTestById(testId);

      console.log("Full API response:", res);
      console.log("res.data:", res.data);
      console.log("res.data.data:", res.data?.data);

      let testData = res.data?.data || res.data?.test || res.data;

      console.log("Parsed testData:", testData);
      console.log("Sections:", testData?.sections);

      if (!testData || typeof testData !== "object") {
        throw new Error("Test ma'lumoti topilmadi");
      }

      setTest(testData);
      setSections(Array.isArray(testData.sections) ? testData.sections : []);

      if (!testData.sections || testData.sections.length === 0) {
        toast.info("Bu testda hali bo‘limlar mavjud emas");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err?.message || "Ma'lumotni yuklashda xatolik");
      toast.error("Ma'lumotni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (sectionId: number, question: Question | null = null) => {
    if (question) {
      setEditingId(question.id);
      setFormData({
        section_id: sectionId.toString(),
        mondai_number: question.mondai_number,
        question_number: question.question_number,
        type: question.type,
        question_text: question.question_text,
        passage: question.passage || "",
        option1: question.options?.[0] || "",
        option2: question.options?.[1] || "",
        option3: question.options?.[2] || "",
        option4: question.options?.[3] || "",
        correct_answer: question.correct_answer,
        points: question.points || 2,
      });
    } else {
      setEditingId(null);
      setFormData({
        ...INITIAL_FORM,
        section_id: sectionId.toString(),
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("section_id", formData.section_id);
      fd.append("mondai_number", String(formData.mondai_number));
      fd.append("question_number", String(formData.question_number));
      fd.append("type", formData.type);
      fd.append("question_text", formData.question_text);
      fd.append("correct_answer", formData.correct_answer);
      fd.append("points", String(formData.points));

      if (formData.passage) {
        fd.append("passage", formData.passage);
      }

      // options[] massiv sifatida
      const options = [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4,
      ];
      options.forEach((opt) => {
        fd.append("options[]", opt);
      });

      // Debug uchun FormData ichidagi ma'lumotlar
      console.log("Submitting FormData:");
      for (const pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }

      if (editingId) {
        await adminAPI.updateQuestion(editingId, fd);
        toast.success("Savol yangilandi");
      } else {
        await adminAPI.createQuestion(fd);
        toast.success("Savol qo‘shildi");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Submit error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Saqlashda xatolik yuz berdi";
      toast.error(msg);
      // Qo'shimcha ma'lumot olish uchun javobni to'liq log qilamiz
      console.log("Error response:", err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu savolni o‘chirmoqchimisiz?")) return;
    try {
      await adminAPI.deleteQuestion(id);
      toast.success("Savol o‘chirildi");
      fetchData();
    } catch {
      toast.error("O‘chirishda xatolik!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        <p className="text-slate-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-600 font-medium">{error || "Test topilmadi"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/tests")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Testlarga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* TEST HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/tests")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge className="bg-blue-600">{test.level}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {test.time} min
              </Badge>
              <Badge variant="secondary">
                {sections.length} ta bo‘lim
              </Badge>
            </div>
          </div>
        </div>
        {sections.length === 0 && (
          <Button
            onClick={() =>
              toast.info("Backendda bo‘lim qo‘shish funksiyasi hozircha yo‘q")
            }
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Bo‘lim qo‘shish
          </Button>
        )}
      </div>

      {/* BO‘LIMLAR */}
      {sections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed">
          <p className="text-slate-400 text-lg">Hali bo‘limlar mavjud emas</p>
          <p className="text-slate-400 text-sm mt-1">
            Yangi test yaratish orqali avtomatik bo‘limlar qo‘shiladi yoki
            backendda qo‘lda qo‘shishingiz kerak.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold uppercase">{section.name}</h2>
                  <Badge variant="secondary">
                    {section.questions?.length || 0} ta savol
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => openModal(section.id)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Savol qo‘shish
                </Button>
              </div>

              <div className="border rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Mondai</TableHead>
                      <TableHead className="w-16">№</TableHead>
                      <TableHead>Savol Matni</TableHead>
                      <TableHead>Ball</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.questions?.length > 0 ? (
                      section.questions.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="font-bold text-slate-500">
                            Mondai {q.mondai_number}
                          </TableCell>
                          <TableCell>{q.question_number}</TableCell>
                          <TableCell className="max-w-[400px] truncate">
                            {q.question_text}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{q.points} pt</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openModal(section.id, q)}
                              className="h-8 w-8 text-blue-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(q.id)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-10 text-slate-400 italic"
                        >
                          Hozircha savollar yo‘q
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SAVOL MODALI */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Savolni tahrirlash" : "Yangi savol qo‘shish"}
            </DialogTitle>
            <DialogDescription>
              Mondai raqami, savol turi, matni, variantlar va to‘g‘ri javobni
              kiriting. Hamma variantlar to‘ldirilgan bo‘lishi shart.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Mondai No</Label>
                <Input
                  type="number"
                  value={formData.mondai_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mondai_number: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Savol No</Label>
                <Input
                  type="number"
                  value={formData.question_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      question_number: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Savol Balli</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Savol turi</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanji_reading">Kanji Reading</SelectItem>
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Asosiy matn (Passage)</Label>
              <Textarea
                placeholder="Reading/Listening uchun matn (ixtiyoriy)"
                value={formData.passage}
                onChange={(e) =>
                  setFormData({ ...formData, passage: e.target.value })
                }
                className="h-24"
              />
            </div>

            <div className="space-y-2">
              <Label>Savol matni *</Label>
              <Input
                required
                value={formData.question_text}
                onChange={(e) =>
                  setFormData({ ...formData, question_text: e.target.value })
                }
                placeholder="Masalan: 日本語___勉強します。"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="space-y-1">
                  <Label className="text-xs">Variant {n}</Label>
                  <Input
                    required
                    value={
                      formData[`option${n}` as keyof typeof formData] as string
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`option${n}`]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-emerald-600 font-bold">
                To‘g‘ri javob *
              </Label>
              <Select
                value={formData.correct_answer}
                onValueChange={(v) =>
                  setFormData({ ...formData, correct_answer: v })
                }
              >
                <SelectTrigger className="border-emerald-500">
                  <SelectValue placeholder="Variantni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => {
                    const optVal = formData[
                      `option${n}` as keyof typeof formData
                    ] as string;
                    return optVal ? (
                      <SelectItem key={n} value={optVal}>
                        Variant {n}: {optVal}
                      </SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.correct_answer}
                className="bg-blue-600 text-white min-w-[120px]"
              >
                {submitting ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}