"use client"

import { useRef, useState, useEffect } from "react"
import BackButton from "@/components/back-button"
import { Eraser, PenTool, Layers, ChevronRight, ChevronLeft } from "lucide-react"

const HIRAGANA = [
  "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ",
  "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "re", "ろ", "わ", "を", "ん"
];

const KATAKANA = [
  "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ",
  "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ",
  "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"
];

const WritingPractice = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentChar, setCurrentChar] = useState("あ")
  const [type, setType] = useState<"hira" | "kata">("hira")

  const alphabet = type === "hira" ? HIRAGANA : KATAKANA

 

  const startDrawing = (e: any) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    canvasRef.current?.getContext("2d")?.beginPath()
  }

  const draw = (e: any) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      
      const x = (clientX - rect.left) * scaleX
      const y = (clientY - rect.top) * scaleY
      
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.moveTo(x, y)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 flex flex-col p-4 md:p-6 transition-colors duration-300">
      {/* Header section */}
      <div className="flex-none flex items-center justify-between mb-4">
        <BackButton />
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => { setType("hira"); setCurrentChar("あ"); clearCanvas(); }}
            className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${type === "hira" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-500"}`}
          >
            Hiragana
          </button>
          <button 
            onClick={() => { setType("kata"); setCurrentChar("ア"); clearCanvas(); }}
            className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${type === "kata" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-blue-500"}`}
          >
            Katakana
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* CHAP TOMON: Harf tanlash (Mobilda horizontal scroll, Desktopda vertical grid) */}
        <div className="flex-none lg:w-[380px] flex flex-col bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-[180px] lg:h-full">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-blue-600" /> Tanlang
            </h3>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-lg font-bold">46 HARF</span>
          </div>
          
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            <div className="flex lg:grid lg:grid-cols-4 gap-3">
              {alphabet.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrentChar(c); clearCanvas(); }}
                  className={`flex-none w-14 h-14 lg:w-full lg:h-auto lg:aspect-square rounded-2xl flex items-center justify-center font-bold text-xl border transition-all ${
                    currentChar === c
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                      : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:border-blue-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* O'NG TOMON: Yozish maydoni */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] lg:min-h-0 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm p-4 lg:p-8 relative">
          
          {/* Chizish maydoni markazda */}
          <div className="relative w-full max-w-[450px] aspect-square group">
            {/* Soya harf */}
            <div className="absolute inset-0 flex items-center justify-center text-[250px] sm:text-[300px] lg:text-[380px] font-bold text-slate-100 dark:text-slate-800/40 select-none pointer-events-none transition-all">
              {currentChar}
            </div>
            
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={800}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
            />
            
            {/* Dekorativ burchaklar */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-slate-100 dark:border-slate-800 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-slate-100 dark:border-slate-800 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-slate-100 dark:border-slate-800 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-slate-100 dark:border-slate-800 rounded-br-2xl pointer-events-none" />
          </div>

          {/* Tugmalar paneli */}
          <div className="flex gap-4 w-full max-w-[450px] mt-8 flex-none">
            <button 
              onClick={clearCanvas}
              className="flex-1 h-14 md:h-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 dark:border-slate-700"
            >
              <Eraser className="h-5 w-5" /> <span className="hidden sm:inline">Tozalash</span>
            </button>
            <button className="flex-[2] h-14 md:h-16 rounded-[24px] bg-blue-600 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 transition-all">
              <PenTool className="h-5 w-5" /> <span>Tekshirish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WritingPractice