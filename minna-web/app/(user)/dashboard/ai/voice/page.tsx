// @ts-nocheck
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Canvas, useFrame } from "@react-three/fiber"

// ==========================================
// 3D Zarrachali Shar Komponenti
// ==========================================
function ParticleSphere({
  isListening,
  isSpeaking,
}: {
  isListening: boolean
  isSpeaking: boolean
}) {
  const ref = useRef<any>(null)
  const particlesCount = 3500

  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 2.0
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return [pos, new Float32Array(pos)]
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.getElapsedTime()
    const { position } = ref.current.geometry.attributes
    ref.current.rotation.y = time * 0.1
    ref.current.rotation.z = time * 0.05

    for (let i = 0; i < particlesCount; i++) {
      const idx = i * 3
      const ox = originalPositions[idx]
      const oy = originalPositions[idx + 1]
      const oz = originalPositions[idx + 2]
      let scatter = 0

      if (isSpeaking) {
        scatter =
          Math.sin(time * 8 + oy * 3) * Math.cos(time * 5 + ox * 2) * 0.6
      } else if (isListening) {
        scatter = Math.sin(time * 3 - oy * 2) * 0.2 + 0.1
      } else {
        scatter = Math.sin(time * 1.5 + ox * 2 + oy) * 0.05
      }

      const len = Math.sqrt(ox * ox + oy * oy + oz * oz)
      position.array[idx] +=
        (ox + (ox / len) * scatter - position.array[idx]) * 0.1
      position.array[idx + 1] +=
        (oy + (oy / len) * scatter - position.array[idx + 1]) * 0.1
      position.array[idx + 2] +=
        (oz + (oz / len) * scatter - position.array[idx + 2]) * 0.1
    }
    position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#3b82f6"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// ==========================================
// ASOSIY SAHIFA
// ==========================================
export default function VoiceChatPage() {
  const [statusText, setStatusText] = useState("Tugmani bosing va gapiring...")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [language, setLanguage] = useState<"uz-UZ" | "ja-JP">("uz-UZ")
  const [isProcessing, setIsProcessing] = useState(false)

  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.onstart = () => {
        setIsListening(true)
        setIsSpeaking(false)
        setStatusText("Eshitmoqda...")
      }
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        setIsListening(false)
        if (
          status === "authenticated" &&
          (session as any)?.accessToken &&
          !isProcessing
        ) {
          setStatusText("O'ylamoqda...")
          sendToAi(text)
        }
      }
      recognition.onerror = () => {
        setIsListening(false)
        setStatusText("Xatolik.")
      }
      recognitionRef.current = recognition
    }
  }, [status, session, isProcessing])

  const handleStartListening = () => {
    if (isProcessing || isSpeaking) return
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      setIsSpeaking(false)
    }
    window.speechSynthesis.cancel()

    const unlockMsg = new SpeechSynthesisUtterance("")
    window.speechSynthesis.speak(unlockMsg)

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language
        recognitionRef.current.start()
      } catch (e) {
        console.log("Recognition allaqachon ishlamoqda")
      }
    }
  }

  const sendToAi = async (text: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({ message: text, lang: language }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.audio) {
          setStatusText("Kitsune-sensei gapirmoqda...")
          playAudio(data.audio)
        } else if (data.reply) {
          setStatusText("Gapirmoqda...")
          speak(data.reply)
        }
      } else {
        setStatusText("Javob olinmadi.")
        setIsProcessing(false)
      }
    } catch (e) {
      setStatusText("Ulanishda xatolik!")
      setIsProcessing(false)
    }
  }

  const playAudio = (base64Audio: string) => {
    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
    audioRef.current = audio
    audio.onplay = () => setIsSpeaking(true)
    audio.onended = () => {
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatusText("Yana savol bering...")
    }
    audio.play()
  }

  const speak = (text: string) => {
    if (typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#_()]/g, "").trim()
    const u = new SpeechSynthesisUtterance(cleanText)

    // Yaponcha bo'lsa ja-JP, aks holda o'zbekcha
    u.lang = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(cleanText)
      ? "ja-JP"
      : "uz-UZ"

    u.onstart = () => setIsSpeaking(true)
    u.onend = () => {
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatusText("Yana savol bering...")
    }
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="relative flex h-full min-h-[500px] w-full flex-1 flex-col items-center justify-center overflow-hidden bg-gray-50">
      <button
        onClick={() => router.push("/dashboard/ai")}
        className="absolute top-6 left-6 z-50 h-12 w-12 rounded-full border border-gray-200 bg-white text-xl shadow-sm"
      >
        ←
      </button>
      <div
        className="z-10 flex h-[400px] w-full cursor-pointer items-center justify-center"
        onClick={handleStartListening}
      >
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ParticleSphere isListening={isListening} isSpeaking={isSpeaking} />
        </Canvas>
      </div>
      <div className="z-10 mt-2 px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">{statusText}</h2>
      </div>
      <div className="z-10 mt-8 flex gap-6">
        <button
          onClick={() => {
            setLanguage("uz-UZ")
            setStatusText("Til o'zgartirildi: O'zbekcha")
          }}
          className={`rounded-full px-8 py-3 text-lg font-medium transition ${language === "uz-UZ" ? "bg-blue-600 text-white" : "border bg-white"}`}
        >
          🇺🇿 O'zbek
        </button>
        <button
          onClick={() => {
            setLanguage("ja-JP")
            setStatusText("言語が日本語に変更されました")
          }}
          className={`rounded-full px-8 py-3 text-lg font-medium transition ${language === "ja-JP" ? "bg-blue-600 text-white" : "border bg-white"}`}
        >
          🇯🇵 日本語
        </button>
      </div>
    </div>
  )
}
