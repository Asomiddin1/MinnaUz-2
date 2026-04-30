"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/lib/api";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, Trash2, FileText, Music, Volume2, Crown, Clock, Target } from "lucide-react";
import { Label } from "@/components/ui/label";

type Test = {
  id: number;
  title: string;
  level: string;
  type: string;
  audio_url?: string;
  is_premium: boolean;
  time: number;       // 👈 Yangi
  pass_score: number; // 👈 Yangi
  created_at: string;
};

const TestsPage = () => {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    level: "N5",
    type: "jlpt",
    is_premium: false,
    time: 105,        // 👈 Default vaqt (daqiqa)
    pass_score: 50,   // 👈 Default o'tish balli (%)
    audio_file: null as File | null,
  });

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTests();
      setTests(res.data.data || res.data); 
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditId(null);
    setForm({ title: "", level: "N5", type: "jlpt", is_premium: false, time: 105, pass_score: 50, audio_file: null });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test: Test) => {
    setEditId(test.id);
    setForm({ 
      title: test.title, 
      level: test.level, 
      type: test.type, 
      is_premium: !!test.is_premium,
      time: test.time || 105,             // 👈 Tahrirlashda vaqtni olib kelish
      pass_score: test.pass_score || 50,  // 👈 Tahrirlashda ballni olib kelish
      audio_file: null
    });
    setIsModalOpen(true);
  };

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.title) return alert("Test nomini kiriting!");
    if (!form.time || form.time <= 0) return alert("Vaqtni to'g'ri kiriting!");
    if (!form.pass_score || form.pass_score <= 0 || form.pass_score > 100) return alert("O'tish balli 1 va 100 orasida bo'lishi kerak!");
    
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("level", form.level);
      formData.append("type", form.type);
      formData.append("is_premium", form.is_premium ? "1" : "0");
      formData.append("time", form.time.toString());             // 👈 Jo'natilmoqda
      formData.append("pass_score", form.pass_score.toString()); // 👈 Jo'natilmoqda
      
      if (form.audio_file) {
        formData.append("audio_file", form.audio_file);
      }

      if (editId) {
        formData.append("_method", "PUT"); 
        await adminAPI.updateTest(editId, formData); 
      } else {
        await adminAPI.createTest(formData);
      }
      
      setIsModalOpen(false);
      fetchTests();
    } catch (err) {
      alert("Saqlashda xatolik! Katta fayl yuklayotgan bo'lishingiz mumkin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await adminAPI.deleteTest(id);
        fetchTests();
      } catch (err) {
        alert("O'chirishda xatolik!");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-slate-100">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" /> JLPT Testlar Boshqaruvi
        </h1>
        <Button onClick={handleOpenCreate} className="bg-slate-800 hover:bg-slate-900 text-white">
          + Yangi Test Qo'shish
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input className="pl-10" placeholder="Test qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Test Nomi</TableHead>
              <TableHead>Daraja</TableHead>
              <TableHead>Ma'lumot</TableHead>
              <TableHead>Ruxsat</TableHead>
              <TableHead className="text-center">Audio</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={7} className="text-center py-10">Yuklanmoqda...</TableCell></TableRow>
            ) : filteredTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="text-slate-500">#{test.id}</TableCell>
                <TableCell className="font-bold cursor-pointer hover:text-blue-600" onClick={() => router.push(`/admin/tests/${test.id}`)}>
                  {test.title}
                </TableCell>
                <TableCell><Badge variant="secondary">{test.level}</Badge></TableCell>
                
                {/* 👈 Yangi: Vaqt va O'tish ballini ko'rsatish */}
                <TableCell className="text-xs text-slate-500">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" /> {test.time} daqiqa</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3 text-emerald-500" /> Min. {test.pass_score}%</span>
                  </div>
                </TableCell>

                <TableCell>
                  {test.is_premium ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 w-max">
                      <Crown className="w-3 h-3" /> Premium
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white w-max">Bepul</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {test.audio_url ? <Volume2 className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="outline" onClick={() => handleOpenEdit(test)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(test.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Testni tahrirlash" : "Yangi JLPT Test yaratish"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Test Nomi (Yil yoki Mavsum)</Label>
              <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Masalan: 2023 December JLPT" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Daraja</Label>
                <Select value={form.level} onValueChange={(v) => handleChange("level", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["N1", "N2", "N3", "N4", "N5"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Test Turi</Label>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jlpt">JLPT (Real)</SelectItem>
                    <SelectItem value="practice">Practice (Mashq)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 👈 YANGI: VAQT VA O'TISH BALLI UCHUN INPUTLAR */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Test vaqti (daqiqa)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={form.time} 
                  onChange={(e) => handleChange("time", parseInt(e.target.value))} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> O'tish balli (%)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="100" 
                  value={form.pass_score} 
                  onChange={(e) => handleChange("pass_score", parseInt(e.target.value))} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Crown className={`h-4 w-4 ${form.is_premium ? 'text-amber-500' : 'text-slate-400'}`} /> Test Narxi (Ruxsat)
              </Label>
              <Select value={form.is_premium ? "true" : "false"} onValueChange={(v) => handleChange("is_premium", v === "true")}>
                <SelectTrigger className={form.is_premium ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : ""}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Bepul (Hamma uchun ochiq)</SelectItem>
                  <SelectItem value="true">Premium (Faqat obunachilar uchun)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300">
              <Label className="flex items-center gap-2">
                <Music className="h-4 w-4 text-blue-500" /> Noutbukdan Audio yuklash
              </Label>
              <Input
                type="file" 
                accept="audio/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleChange("audio_file", e.target.files[0]);
                  }
                }}
                className="bg-white dark:bg-slate-900 cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {editId ? "Fayl tanlamasangiz, eskisi qoladi." : "Faqat MP3 yoki WAV fayllarni yuklang."} Max: 40MB.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 text-white">
              {submitting ? "Saqlanmoqda (kutib turing)..." : "Testni saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestsPage;