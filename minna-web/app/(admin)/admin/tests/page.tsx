"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api/admin";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Search, Trash2, FileText, Music, Crown, Clock, Target, Plus } from "lucide-react";

type Test = {
  id: number;
  title: string;
  level: string;
  type: string;
  audio_url?: string;
  is_premium: boolean;
  time: number;
  pass_score: number;
  created_at: string;
};

const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

// Level ranglari
const levelColors: Record<string, { bg: string; text: string; border: string; active: string; hover: string }> = {
  N5: { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800", active: "bg-green-600 text-white", hover: "hover:bg-green-100 dark:hover:bg-green-950/40" },
  N4: { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", active: "bg-blue-600 text-white", hover: "hover:bg-blue-100 dark:hover:bg-blue-950/40" },
  N3: { bg: "bg-yellow-50 dark:bg-yellow-950/20", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800", active: "bg-yellow-600 text-white", hover: "hover:bg-yellow-100 dark:hover:bg-yellow-950/40" },
  N2: { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800", active: "bg-orange-600 text-white", hover: "hover:bg-orange-100 dark:hover:bg-orange-950/40" },
  N1: { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800", active: "bg-red-600 text-white", hover: "hover:bg-red-100 dark:hover:bg-red-950/40" },
};

const TestsPage = () => {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("N5"); // ✅ Faol tab

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Default qiymatlar
  const defaultForm = {
    title: "",
    level: "N5",
    type: "jlpt",
    is_premium: false,
    time: 105,
    pass_score: 80,
    audio_file: null as File | null,
  };

  const [form, setForm] = useState(defaultForm);

  // =====================
  // FETCH DATA
  // =====================
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTests();
      setTests(res.data.data || res.data);
    } catch (err) {
      toast.error("Testlarni yuklashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // ✅ Filter: qidiruv + activeTab bo'yicha
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = test.level === activeTab;
    return matchesSearch && matchesLevel;
  });

  // Har bir tabda nechta test borligini hisoblash
  const getTestCount = (level: string) => {
    return tests.filter((test) => test.level === level).length;
  };

  // =====================
  // MODAL LOGIC
  // =====================
  const handleOpenCreate = () => {
    setEditId(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test: Test) => {
    setEditId(test.id);
    setForm({
      title: test.title,
      level: test.level,
      type: test.type,
      is_premium: !!test.is_premium,
      time: test.time || 105,
      pass_score: test.pass_score || 80,
      audio_file: null,
    });
    setIsModalOpen(true);
  };

  const handleChange = (key: string, value: any) => {
    setForm((prev) => {
      const newData = { ...prev };
      // @ts-ignore
      newData[key] = value;

      if (key === "level") {
        const standards: Record<string, { t: number; p: number }> = {
          N5: { t: 105, p: 80 },
          N4: { t: 125, p: 90 },
          N3: { t: 140, p: 95 },
          N2: { t: 155, p: 90 },
          N1: { t: 170, p: 100 },
        };
        if (standards[value]) {
          newData.time = standards[value].t;
          newData.pass_score = standards[value].p;
        }
      }
      return newData;
    });
  };

  // =====================
  // SUBMIT
  // =====================
  const handleSubmit = async () => {
    if (!form.title) return toast.warning("Test nomini kiriting!");
    if (!form.level) return toast.warning("Darajani (Level) tanlang!");
    if (!form.time || form.time < 1) return toast.warning("Vaqt kamida 1 daqiqa bo'lishi kerak!");
    if (!form.pass_score || form.pass_score < 1) return toast.warning("O'tish balli kamida 1 bo'lishi kerak!");

    try {
      setSubmitting(true);
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("level", form.level);
      formData.append("is_premium", form.is_premium ? "1" : "0");
      formData.append("time", form.time.toString());
      formData.append("pass_score", form.pass_score.toString());

      if (form.audio_file instanceof File) {
        formData.append("audio_file", form.audio_file);
      }

      if (editId) {
        formData.append("_method", "PUT");
        await adminAPI.updateTest(editId, formData);
        toast.success("Test muvaffaqiyatli yangilandi");
      } else {
        await adminAPI.createTest(formData);
        toast.success("Yangi test muvaffaqiyatli yaratildi");
      }

      setIsModalOpen(false);
      fetchTests();
    } catch (err: any) {
      console.error("LARAVEL XATOSI:", err.response?.data?.errors);

      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const firstMessage = Object.values(validationErrors)[0] as string;
        toast.error(Array.isArray(firstMessage) ? firstMessage[0] : firstMessage);
      } else {
        toast.error(err.response?.data?.message || "Saqlashda xatolik yuz berdi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Ushbu testni o'chirmoqchimisiz?")) {
      try {
        await adminAPI.deleteTest(id);
        toast.success("Test o'chirildi");
        fetchTests();
      } catch {
        toast.error("O'chirishda xatolik yuz berdi!");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-blue-600" /> JLPT Test Boshqaruvi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Testlar ro'yxati va umumiy sozlamalar.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Yangi Test
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          className="pl-10"
          placeholder="Test nomi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ✅ NAVIGATION TABS */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {LEVELS.map((level) => {
          const count = getTestCount(level);
          const isActive = activeTab === level;
          const colors = levelColors[level];

          return (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? `${colors.active} shadow-sm` 
                  : `text-slate-600 dark:text-slate-400 ${colors.hover}`
                }
              `}
            >
              <span>{level}</span>
              <span className={`
                text-xs rounded-full px-2 py-0.5
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ✅ ACTIVE TAB CONTENT */}
      <div className="border rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
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
                  <TableCell className="text-slate-500 font-mono text-xs">#{test.id}</TableCell>
                  <TableCell
                    className="font-semibold cursor-pointer hover:text-blue-600"
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
                        <Clock className="w-3 h-3" /> {test.time} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" /> Pass: {test.pass_score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.is_premium ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <Crown className="w-3 h-3 mr-1" /> Premium
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(test)}>
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
                <TableCell colSpan={6} className="text-center py-20 text-slate-400 text-sm">
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
            <DialogTitle>{editId ? "Testni tahrirlash" : "Yangi Test yaratish"}</DialogTitle>
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
                <Select value={form.level} onValueChange={(v) => handleChange("level", v)}>
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
                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
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
                  <Clock className="w-4 h-4" /> Vaqt (min)
                </Label>
                <Input
                  type="number"
                  value={isNaN(form.time) ? "" : form.time}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    handleChange("time", isNaN(val) ? 0 : val);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" /> O'tish balli
                </Label>
                <Input
                  type="number"
                  value={isNaN(form.pass_score) ? "" : form.pass_score}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    handleChange("pass_score", isNaN(val) ? 0 : val);
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

            <div className="grid gap-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed">
              <Label className="flex items-center gap-2">
                <Music className="w-4 h-4 text-blue-500" /> Audio fayl
              </Label>
              <Input
                type="file"
                accept=".mp3,.wav"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleChange("audio_file", file);
                  } else {
                    handleChange("audio_file", null);
                  }
                }}
                className="bg-white cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">MP3 yoki WAV fayl yuklang. Maksimal 40MB.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white min-w-[100px]"
            >
              {submitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestsPage;