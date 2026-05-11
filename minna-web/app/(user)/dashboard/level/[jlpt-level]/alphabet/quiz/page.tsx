"use client"

import { useState, useEffect } from "react"
import BackButton from "@/components/back-button"
import { Trophy, RefreshCcw, Volume2, CheckCircle2, XCircle } from "lucide-react"

const ALL_CHARS = [
  { jpn: "あ", rom: "a" }, { jpn: "い", rom: "i" }, { jpn: "う", rom: "u" }, { jpn: "え", rom: "e" }, { jpn: "お", rom: "o" },
  { jpn: "か", rom: "ka" }, { jpn: "き", rom: "ki" }, { jpn: "く", rom: "ku" }, { jpn: "け", rom: "ke" }, { jpn: "こ", rom: "ko" },
  // ... hamma 46 ta harfni kiritish mumkin
]

const QuizPage = () => {
  const [question, setQuestion] = useState<any>(null)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle")

  const generateQuestion = () => {
    const correct = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)]
    let opts = [correct.rom]
    while (opts.length < 4) {
      const randomRom = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)].rom
      if (!opts.includes(randomRom)) opts.push(randomRom)
    }
    setQuestion(correct)
    setOptions(opts.sort(() => Math.random() - 0.5))
    setStatus("idle")
  }

  useEffect(() => { generateQuestion() }, [])

  const handleAnswer = (ans: string) => {
    setTotal(prev => prev + 1)
    if (ans === question.rom) {
      setScore(prev => prev + 1)
      setStatus("correct")
      setTimeout(generateQuestion, 1000)
    } else {
      setStatus("wrong")
      setTimeout(generateQuestion, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-2xl">
        <BackButton />
        
        <div className="mt-10 bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 border shadow-xl text-center">
          <div className="flex justify-between items-center mb-10">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Natija</p>
              <h3 className="text-2xl font-black text-blue-600">{score}/{total}</h3>
            </div>
            <Trophy className="h-10 w-10 text-yellow-500" />
          </div>

          <div className="mb-12">
            <div className={`h-40 w-40 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-7xl font-bold mb-4 transition-all ${status === 'correct' ? 'scale-110 border-4 border-emerald-500' : status === 'wrong' ? 'shake border-4 border-red-500' : ''}`}>
              {question?.jpn}
            </div>
            <button className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 hover:scale-110 transition-transform">
              <Volume2 className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="py-6 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 text-2xl font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizPage