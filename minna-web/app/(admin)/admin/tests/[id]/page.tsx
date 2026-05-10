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
  ArrowLeft, Edit, Trash2, Plus, Loader2, Clock, AlertCircle,
  ImagePlus, X, Calculator
} from "lucide-react";

// ---------- INTERFACES ----------
interface QuestionOption {
  text?: string | null;
  image?: string | null;
  image_url?: string | null;
}

interface Question {
  id: number;
  mondai_number: number;
  question_number: number;
  type: string;
  question_text: string;
  passage?: string;
  image_url?: string | null;
  options: QuestionOption[];
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

// ---------- FORM STATE ----------
interface OptionFormItem {
  text: string;
  image: File | null;
  preview: string;
  remove_image: boolean;
}

interface QuestionFormData {
  section_id: string;
  mondai_number: number;
  question_number: number;
  type: string;
  question_text: string;
  passage: string;
  question_image: File | null;
  question_image_preview: string;
  remove_question_image: boolean;
  options: OptionFormItem[];
  correct_answer: string;
  points: number;
}

const INITIAL_OPTION: OptionFormItem = { 
  text: "", 
  image: null, 
  preview: "", 
  remove_image: false 
};

const INITIAL_FORM: QuestionFormData = {
  section_id: "",
  mondai_number: 1,
  question_number: 1,
  type: "vocabulary",
  question_text: "",
  passage: "",
  question_image: null,
  question_image_preview: "",
  remove_question_image: false,
  options: [
    { ...INITIAL_OPTION },
    { ...INITIAL_OPTION },
    { ...INITIAL_OPTION },
    { ...INITIAL_OPTION },
  ],
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
  const [formData, setFormData] = useState<QuestionFormData>(INITIAL_FORM);

  // ===== UMUMIY BALNI HISOBLASH =====
  const calculateTotalPoints = (sections: Section[]): number => {
    return sections.reduce((total, section) => {
      return total + section.questions.reduce((sectionTotal, question) => {
        return sectionTotal + (question.points || 0);
      }, 0);
    }, 0);
  };

  // ===== BO'LIM BALINI HISOBLASH =====
  const calculateSectionPoints = (section: Section): number => {
    return section.questions.reduce((total, question) => {
      return total + (question.points || 0);
    }, 0);
  };

  // ---------- DATA FETCH ----------
  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
      : "http://127.0.0.1:8000";
    
    let cleanPath = imagePath;
    if (!cleanPath.includes("storage/")) {
      cleanPath = `storage/${cleanPath}`;
    }
    cleanPath = cleanPath.replace(/^\//, "");
    
    return `${baseUrl}/${cleanPath}`;
  };

  const fetchData = useCallback(async () => {
    if (!testId || isNaN(testId)) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getTestById(testId);
      let testData = res.data?.data || res.data?.test || res.data;
      if (!testData || typeof testData !== "object") throw new Error("Test ma'lumoti topilmadi");

      const processedSections = (Array.isArray(testData.sections) ? testData.sections : [])
        .map((section: Section) => ({
          ...section,
          questions: Array.isArray(section.questions)
            ? section.questions.map((q: Question) => ({
                ...q,
                image_url: getImageUrl(q.image_url || (q as any).image),
                options: (q.options || []).map((opt: any) => {
                  if (typeof opt === 'string') {
                    return { text: opt, image: null, image_url: null };
                  }
                  return {
                    text: opt.text ?? null,
                    image: opt.image ?? null,
                    image_url: getImageUrl(opt.image_url || opt.image),
                  };
                }),
              }))
            : [],
        }));

      setTest({ ...testData, sections: processedSections });
      setSections(processedSections);
      if (processedSections.length === 0) toast.info("Bu testda hali bo'limlar mavjud emas");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err?.message || "Ma'lumotni yuklashda xatolik");
      toast.error("Ma'lumotni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ---------- MODAL OPEN ----------
  const openModal = (sectionId: number, question: Question | null = null) => {
    if (question) {
      setEditingId(question.id);
      const optionsForm: OptionFormItem[] = (question.options || []).map(opt => ({
        text: opt.text || "",
        image: null,
        preview: opt.image_url || "",
        remove_image: false,
      }));
      while (optionsForm.length < 4) optionsForm.push({ ...INITIAL_OPTION });

      setFormData({
        section_id: sectionId.toString(),
        mondai_number: question.mondai_number,
        question_number: question.question_number,
        type: question.type,
        question_text: question.question_text,
        passage: question.passage || "",
        question_image: null,
        question_image_preview: question.image_url || "",
        remove_question_image: false,
        options: optionsForm,
        correct_answer: question.correct_answer,
        points: question.points || 2,
      });
    } else {
      setEditingId(null);
      setFormData({ ...INITIAL_FORM, section_id: sectionId.toString() });
    }
    setIsModalOpen(true);
  };

  // ---------- HANDLERS ----------
  const handleOptionTextChange = (index: number, value: string) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], text: value };
      return { ...prev, options: newOptions };
    });
  };

  const handleOptionImageChange = (index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => {
          const updated = [...prev.options];
          updated[index] = { 
            ...updated[index], 
            image: file, 
            preview: e.target?.result as string,
            remove_image: false 
          };
          return { ...prev, options: updated };
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => {
        const updated = [...prev.options];
        updated[index] = { 
          ...updated[index], 
          image: null, 
          preview: "",
          remove_image: true
        };
        return { ...prev, options: updated };
      });
    }
  };

  // ---------- SUBMIT ----------
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

      if (formData.question_image instanceof File) {
        fd.append("image_path", formData.question_image);
      } else if (formData.remove_question_image) {
        fd.append("remove_image", "1");
      }

      formData.options.forEach((opt, idx) => {
        fd.append(`options[${idx}][text]`, opt.text || "");
        
        if (opt.image instanceof File) {
          fd.append(`options[${idx}][image]`, opt.image, opt.image.name);
        } else if (opt.remove_image) {
          fd.append(`options[${idx}][remove_image]`, "1");
        }
      });

      console.log("=== FormData tarkibi ===");
      for (const pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }

      if (editingId) {
        await adminAPI.updateQuestion(editingId, fd);
        toast.success("Savol yangilandi");
      } else {
        await adminAPI.createQuestion(fd);
        toast.success("Savol qo'shildi");
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Submit error:", err);
      console.error("Response data:", err?.response?.data);
      const msg = err?.response?.data?.message 
        || err?.response?.data?.error 
        || "Saqlashda xatolik";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu savolni o'chirmoqchimisiz?")) return;
    try {
      await adminAPI.deleteQuestion(id);
      toast.success("Savol o'chirildi");
      fetchData();
    } catch {
      toast.error("O'chirishda xatolik!");
    }
  };

  // ---------- RENDER ----------
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      <p className="text-slate-500">Yuklanmoqda...</p>
    </div>
  );

  if (error || !test) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="text-red-600 font-medium">{error || "Test topilmadi"}</p>
      <Button variant="outline" onClick={() => router.push("/admin/tests")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Testlarga qaytish
      </Button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* TEST HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/tests")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge className="bg-blue-600">{test.level}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {test.time} min
              </Badge>
              <Badge variant="secondary">{sections.length} ta bo'lim</Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 border-amber-300 text-amber-700">
                <Calculator className="w-3 h-3" />
                Jami: {calculateTotalPoints(sections)} ball
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* BO'LIMLAR */}
      {sections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed">
          <p className="text-slate-400 text-lg">Hali bo'limlar mavjud emas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {sections.map(section => (
            <div key={section.id} className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold uppercase">{section.name}</h2>
                  <Badge variant="secondary">{section.questions?.length || 0} ta savol</Badge>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    {calculateSectionPoints(section)} ball
                  </Badge>
                </div>
                <Button size="sm" onClick={() => openModal(section.id)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-1" /> Savol qo'shish
                </Button>
              </div>

              <div className="border rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Mondai</TableHead>
                      <TableHead className="w-16">№</TableHead>
                      <TableHead>Savol Matni</TableHead>
                      <TableHead>Rasm</TableHead>
                      <TableHead>Variantlar</TableHead>
                      <TableHead>Ball</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.questions?.length > 0 ? (
                      section.questions.map(q => (
                        <TableRow key={q.id}>
                          <TableCell className="font-bold text-slate-500">Mondai {q.mondai_number}</TableCell>
                          <TableCell>{q.question_number}</TableCell>
                          <TableCell className="max-w-[250px] truncate">{q.question_text}</TableCell>
                          <TableCell>
                            {q.image_url ? (
                              <img src={q.image_url} className="h-10 w-10 object-cover rounded" alt="savol rasmi" />
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap max-w-[250px]">
                              {(q.options || []).map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {opt.image_url && <img src={opt.image_url} className="h-6 w-6 object-cover rounded" />}
                                  <span className="truncate max-w-[100px]">{opt.text || (opt.image_url ? "(rasm)" : "")}</span>
                                  {String(idx) === q.correct_answer && (
                                    <Badge className="h-4 w-4 p-0 bg-green-500 text-white text-[10px] flex items-center justify-center rounded-full">✓</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{q.points} pt</Badge></TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="icon" variant="ghost" onClick={() => openModal(section.id, q)} className="h-8 w-8 text-blue-500">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)} className="h-8 w-8 text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-slate-400 italic">Hozircha savollar yo'q</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Savolni tahrirlash" : "Yangi savol qo'shish"}</DialogTitle>
            <DialogDescription>Barcha variantlarni matn yoki rasm bilan to'ldiring.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            {/* Mondai, No, Ball */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Mondai No</Label>
                <Input 
                  type="number" 
                  value={formData.mondai_number} 
                  onChange={e => setFormData({...formData, mondai_number: +e.target.value})} 
                />
              </div>
              <div>
                <Label>Savol No</Label>
                <Input 
                  type="number" 
                  value={formData.question_number} 
                  onChange={e => setFormData({...formData, question_number: +e.target.value})} 
                />
              </div>
              <div>
                <Label>Ball</Label>
                <Input 
                  type="number" 
                  value={formData.points} 
                  onChange={e => setFormData({...formData, points: +e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tur</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                value={formData.passage} 
                onChange={e => setFormData({...formData, passage: e.target.value})} 
                className="h-24" 
              />
            </div>

            <div className="space-y-2">
              <Label>Savol matni *</Label>
              <Input 
                required 
                value={formData.question_text} 
                onChange={e => setFormData({...formData, question_text: e.target.value})} 
              />
            </div>

            {/* SAVOLGA TEGISHLI RASM */}
            <div className="space-y-2">
              <Label>Savol rasmi (ixtiyoriy)</Label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ImagePlus className="h-4 w-4" />
                  {formData.question_image_preview ? "Rasmni almashtirish" : "Rasm yuklash"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setFormData({
                          ...formData, 
                          question_image: file, 
                          question_image_preview: ev.target?.result as string, 
                          remove_question_image: false
                        });
                        reader.readAsDataURL(file);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                {formData.question_image_preview && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500" 
                    onClick={() => setFormData({
                      ...formData, 
                      question_image: null, 
                      question_image_preview: "", 
                      remove_question_image: true
                    })}
                  >
                    <X className="h-4 w-4 mr-1" /> Rasmni o'chirish
                  </Button>
                )}
              </div>
              {formData.question_image_preview && (
                <div className="w-40 h-32 rounded border overflow-hidden bg-gray-100 dark:bg-gray-800 mt-2">
                  <img src={formData.question_image_preview} alt="preview" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* VARIANTLAR */}
            <div className="space-y-4">
              <Label className="font-semibold">Javob variantlari (4 ta)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Variant {idx + 1}</span>
                      {opt.preview && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-red-400" 
                          onClick={() => handleOptionImageChange(idx, null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input 
                      placeholder="Matn (ixtiyoriy)" 
                      value={opt.text} 
                      onChange={e => handleOptionTextChange(idx, e.target.value)} 
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      <ImagePlus className="h-4 w-4" />
                      {opt.preview ? "Rasmni almashtirish" : "Rasm yuklash"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          handleOptionImageChange(idx, file);
                          e.target.value = "";
                        }} 
                      />
                    </label>
                    {opt.preview && (
                      <div className="w-full h-24 rounded border overflow-hidden bg-gray-100 dark:bg-gray-900">
                        <img src={opt.preview} alt={`var ${idx+1}`} className="w-full h-full object-contain" />
                      </div>
                    )}
                    {!opt.text.trim() && !opt.preview && (
                      <p className="text-xs text-amber-500">Matn yoki rasm kiriting</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* TO'G'RI JAVOB */}
            <div className="space-y-2">
              <Label className="text-emerald-600 font-bold">To'g'ri javob *</Label>
              <Select 
                value={formData.correct_answer} 
                onValueChange={v => setFormData({...formData, correct_answer: v})}
              >
                <SelectTrigger className="border-emerald-500">
                  <SelectValue placeholder="Variantni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {[0,1,2,3].map(n => {
                    const opt = formData.options[n];
                    const label = opt.text?.trim() 
                      ? `Variant ${n+1}: ${opt.text}` 
                      : `Variant ${n+1} (rasm)`;
                    return <SelectItem key={n} value={String(n)}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Bekor qilish
              </Button>
              <Button 
                type="submit" 
                disabled={
                  submitting || 
                  !formData.correct_answer || 
                  formData.options.every(o => !o.text.trim() && !o.preview)
                } 
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