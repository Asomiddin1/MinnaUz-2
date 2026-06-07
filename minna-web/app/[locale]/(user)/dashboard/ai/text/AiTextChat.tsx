"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"


type Message = { role: string; text: string }
type ChatSession = { id: string; title: string; messages: Message[] }

export default function AiTextChat() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  const { data: session } = useSession()

  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentMessages = currentChatId
    ? chatSessions.find((c) => c.id === currentChatId)?.messages || []
    : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMessages, isLoading])

  const startNewChat = () => {
    setCurrentChatId(null)
    setInput("")
    if (window.innerWidth < 768) setIsSidebarOpen(false)
  }

  const switchChat = (id: string) => {
    setCurrentChatId(id)
    if (window.innerWidth < 768) setIsSidebarOpen(false)
  }

  const handleSend = async (msg = input) => {
    if (!msg.trim()) return
    let activeId = currentChatId
    if (!activeId) {
      activeId = Date.now().toString()
      setCurrentChatId(activeId)
      setChatSessions((prev) => [
        { id: activeId!, title: msg.substring(0, 25) + "...", messages: [] },
        ...prev,
      ])
    }
    const userMsg = { role: "user", text: msg }
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === activeId
          ? { ...chat, messages: [...chat.messages, userMsg] }
          : chat
      )
    )
    setInput("")
    setIsLoading(true)
    const token = (session as any)?.accessToken
    const historyToSend =
      chatSessions.find((c) => c.id === activeId)?.messages || []
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: msg,
          chat_id: activeId,
          history: [...historyToSend, userMsg],
        }),
      })
      const data = await res.json()
      if (res.ok) {
        const aiMsg = { role: "ai", text: data.reply }
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === activeId
              ? { ...chat, messages: [...chat.messages, aiMsg] }
              : chat
          )
        )
      }
    } catch (error) {
      console.error("Xatolik:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex h-[calc(100vh-80px)] w-full overflow-hidden border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:rounded-3xl md:border md:shadow-xl">
      {/* CHAP PANEL (SIDEBAR) */}
      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} absolute z-20 flex h-full w-64 flex-col border-r bg-gray-50 dark:border-gray-800 dark:bg-gray-900 transition-transform duration-300 ease-in-out md:relative md:w-72 md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={startNewChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            + Yangi suhbat
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-2 p-2 text-gray-500 dark:text-gray-400 md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="mb-2 ml-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
            Tarix
          </p>
          {chatSessions.length === 0 ? (
            <p className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
              Hozircha tarix yo'q
            </p>
          ) : (
            chatSessions.map((chat) => (
              <button
                key={chat.id}
                onClick={() => switchChat(chat.id)}
                className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-sm ${
                  currentChatId === chat.id
                    ? "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                💬 {chat.title}
              </button>
            ))
          )}
        </div>

        <div className="border-t bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <Link
            href="/dashboard/ai"
            className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            🎤 Ovozli rejim
          </Link>
        </div>
      </div>

      {/* ASOSIY CHAT QISMI */}
      <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-white dark:bg-gray-950">
        <div className="z-0 flex items-center justify-between border-b bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="-ml-2 rounded-lg bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-gray-300 md:hidden"
            >
              ☰
            </button>
            <h1 className="text-base font-bold text-gray-800 dark:text-gray-100 md:text-lg">
              🦊 Kitsune-sensei
            </h1>
          </div>
        </div>

        {/* XABARLAR QISMI */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900/50 md:space-y-6">
          {currentMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-gray-400 dark:text-gray-500">
              <div className="mb-2 text-6xl drop-shadow-sm">🦊</div>
              <p className="text-center text-base font-medium text-gray-500 dark:text-gray-400">
                Yapon tili bo'yicha qanday savolingiz bor?
              </p>
            </div>
          ) : (
            currentMessages.map((m, i) => (
              <div
                key={i}
                className={`mx-auto flex w-full max-w-3xl gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${m.role === "user" ? "bg-blue-100 dark:bg-blue-900/60" : "bg-orange-100 dark:bg-orange-900/60"}`}
                >
                  {m.role === "user" ? "👤" : "🦊"}
                </div>
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-2xl rounded-tr-sm bg-blue-600 text-white dark:bg-blue-600"
                      : "rounded-2xl rounded-tl-sm border bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        <div className="border-t bg-white p-3 dark:border-gray-800 dark:bg-gray-950 md:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-gray-200 bg-gray-100 p-1.5 px-2 dark:border-gray-700 dark:bg-gray-900">
            <button
              onClick={() => recognitionRef.current?.start()}
              className="p-2 text-lg text-gray-500 dark:text-gray-400"
            >
              🎤
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              className="max-h-24 flex-1 bg-transparent px-1 py-2.5 text-sm text-gray-800 outline-none dark:text-gray-100 dark:placeholder-gray-500"
              placeholder="Xabar yozing..."
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              className="rounded-xl bg-blue-600 p-2 text-white dark:hover:bg-blue-500"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
