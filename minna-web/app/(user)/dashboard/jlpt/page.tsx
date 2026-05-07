"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api/user";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, BookOpen, AlertCircle } from "lucide-react";

interface Test {
  id: number;
  title: string;
  level: string;
  time: number;
  pass_score: number;
  is_premium: boolean;
  sections_count?: number;
}

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

export default function JlptPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await userAPI.getTests();

      // Paginated javob: res.data.data yoki res.data
      const responseData = res.data?.data || res.data;
      const testsList = responseData?.data || responseData;
      const allTests = Array.isArray(testsList) ? testsList : [];

      // Tanlangan darajaga qarab filter
      const filteredTests =
        selectedLevel === "all"
          ? allTests
          : allTests.filter((test) => test.level === selectedLevel);

      setTests(filteredTests);
    } catch (err: any) {
      console.error("Testlarni yuklashda xato:", err);
      setError("Testlarni yuklab bo'lmadi");
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [selectedLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Sarlavha va Navbar ko'rinishidagi daraja tugmalari */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">JLPT Testlar</h1>
          <p className="text-muted-foreground mt-1">
            O'z darajangizga mos testni tanlang va bilimingizni sinab ko'ring
          </p>
        </div>
        {/* --- Navbar uslubidagi daraja tanlash --- */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedLevel === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel("all")}
          >
            Barchasi
          </Button>
          {JLPT_LEVELS.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLevel(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Yuklanmoqda */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Xatolik */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <Button variant="outline" onClick={() => fetchTests()} className="mt-4">
            Qayta urinish
          </Button>
        </div>
      )}

      {/* Bo'sh ro'yxat */}
      {!loading && !error && tests.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed">
          <p className="text-muted-foreground text-lg">Hozircha testlar mavjud emas</p>
          <p className="text-muted-foreground text-sm mt-1">
            Tanlangan darajada test topilmadi yoki hali qo'shilmagan
          </p>
        </div>
      )}

      {/* Testlar ro'yxati */}
      {!loading && !error && tests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card
              key={test.id}
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/dashboard/jlpt/${test.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Badge variant={test.is_premium ? "default" : "outline"}>
                    {test.is_premium ? "Premium" : "Bepul"}
                  </Badge>
                  <Badge className="bg-blue-600 text-white">{test.level}</Badge>
                </div>
                <CardTitle className="text-xl mt-2 line-clamp-2">{test.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{test.time} daqiqa</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>O'tish ball: {test.pass_score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Bo'limlar:</span>
                  <span>{test.sections_count ?? 3} ta</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}