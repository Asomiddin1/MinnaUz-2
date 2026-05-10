"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { userAPI } from "@/lib/api/user"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import Certificate from "@/components/user-components/jlpt/Certificate"

/* =========================
   TYPES
========================= */

interface AnswerDetail {
  type: string
  is_correct: boolean
  points: number
}

interface TestResultData {
  id: number
  test_title: string
  level: string
  answers: AnswerDetail[]
  created_at: string
  total_questions?: number
  correct_count?: number
  // Backenddan keladigan user ma'lumoti uchun qo'shildi 👇
  user?: {
    name: string
    email: string
  }
}

/* =========================
   SECTION FIXED (REAL JLPT)
========================= */

const SECTION_MAP: Record<string, string> = {
  vocabulary: "vocabulary",
  moji_goi: "vocabulary",

  grammar: "grammar_reading",
  bunpou: "grammar_reading",
  dokkai: "grammar_reading",
  reading: "grammar_reading",

  listening: "listening",
  choukai: "listening",
}

/* =========================
   MAIN PAGE
========================= */

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()

  const resultId = params?.resultId as string

  const [result, setResult] = useState<TestResultData | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await userAPI.getTestResult(Number(resultId))

      setResult(res.data?.data)
    }

    load()
  }, [resultId])

  if (!result) return null

  /* =========================
     REAL SECTION CALC (FIXED)
  ========================= */

  const calcSection = (section: string) => {
    const answers = result.answers.filter(
      (a) => SECTION_MAP[a.type] === section
    )

    const earned = answers.reduce(
      (sum, a) => (a.is_correct ? sum + (a.points || 0) : sum),
      0
    )

    // ❗ HAR DOIM FIX: /60
    return {
      earned,
      total: 60,
    }
  }

  const vocab = calcSection("vocabulary")
  const grammar = calcSection("grammar_reading")
  const listening = calcSection("listening")

  /* =========================
     TOTAL 180
  ========================= */

  const total = vocab.earned + grammar.earned + listening.earned

  const max = 180

  const percent = Math.round((total / max) * 100)

  /* =========================
     PASS LOGIC
  ========================= */

  const passed = total >= 80 // JLPT simple rule

  /* =========================
     UI
  ========================= */

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card className="rounded-2xl p-6">
        {/* TITLE */}
        <h1 className="text-center text-2xl font-bold">{result.test_title}</h1>

        {/* TOTAL */}
        <div className="my-6 text-center">
          <h2 className="text-6xl font-bold">{total}</h2>
          <p className="text-muted-foreground">/ {max}</p>

          <p className="mt-2 text-sm">{percent}%</p>
        </div>

        {/* PASS */}
        <div className="mb-6 text-center">
          <span
            className={`rounded-xl px-4 py-2 ${
              passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {passed ? "PASSED" : "NOT PASSED"}
          </span>
        </div>

        {/* SECTION UI (FIXED /60 ALWAYS) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border p-4 text-center">
            <p>Vocab</p>
            <h3 className="text-3xl font-bold">{vocab.earned}</h3>
            <p>/ {vocab.total}</p>
          </div>

          <div className="rounded-xl border p-4 text-center">
            <p>Grammar</p>
            <h3 className="text-3xl font-bold">{grammar.earned}</h3>
            <p>/ {grammar.total}</p>
          </div>

          <div className="rounded-xl border p-4 text-center">
            <p>Listening</p>
            <h3 className="text-3xl font-bold">{listening.earned}</h3>
            <p>/ {listening.total}</p>
          </div>
        </div>

        {/* CERTIFICATE */}
        <div className="mt-6">
          <Certificate
            // 👇 O'ZGARISH SHU YERDA: Ism dinamik ulandi 👇
            userName={result.user?.name || "Foydalanuvchi"}
            testTitle={result.test_title}
            level={result.level}
            score={total}
            totalQuestions={result.total_questions || 0}
            correctCount={result.correct_count || 0}
            earnedPoints={total}
            totalPoints={180}
            vocabEarned={vocab.earned}
            vocabTotal={60}
            grammarReadingEarned={grammar.earned}
            grammarReadingTotal={60}
            listeningEarned={listening.earned}
            listeningTotal={60}
            isPassed={passed}
            date={result.created_at}
            certificateId={`MINNAUZ-${String(result.id).padStart(6, "0")}`}
          />
        </div>
      </Card>
    </div>
  )
}