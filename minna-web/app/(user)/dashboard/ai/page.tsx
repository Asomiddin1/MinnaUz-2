'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react'; 
import Link from 'next/link';

// Chat va Xabarlar uchun tiplar
type Message = { role: string; text: string };
type ChatSession = { id: string; title: string; messages: Message[] };

export default function AiPage() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    
    const { data: session, status } = useSession();
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentMessages = currentChatId 
        ? chatSessions.find(c => c.id === currentChatId)?.messages || []
        : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages, isLoading]);

    // ... (handleSend va boshqa funksiyalar o'zgarishsiz)
    const startNewChat = () => {
        setCurrentChatId(null);
        setInput('');
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const switchChat = (id: string) => {
        setCurrentChatId(id);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const handleSend = async (msg = input) => {
        if (!msg.trim()) return;
        let activeId = currentChatId;
        if (!activeId) {
            activeId = Date.now().toString(); 
            setCurrentChatId(activeId);
            setChatSessions(prev => [{ id: activeId!, title: msg.substring(0, 25) + '...', messages: [] }, ...prev]);
        }
        const userMsg = { role: 'user', text: msg };
        setChatSessions(prev => prev.map(chat => chat.id === activeId ? { ...chat, messages: [...chat.messages, userMsg] } : chat));
        setInput(''); 
        setIsLoading(true);
        const token = (session as any)?.accessToken;
        const historyToSend = chatSessions.find(c => c.id === activeId)?.messages || [];
        try {
            const res = await fetch('http://127.0.0.1:8000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: msg, chat_id: activeId, history: [...historyToSend, userMsg] })
            });
            const data = await res.json();
            if (res.ok) {
                const aiMsg = { role: 'ai', text: data.reply };
                setChatSessions(prev => prev.map(chat => chat.id === activeId ? { ...chat, messages: [...chat.messages, aiMsg] } : chat));
            }
        } catch (error) { console.error("Xatolik:", error); } finally { setIsLoading(false); }
    };

    return (
        // QAT'IY BALANDLIK: h-[calc(100vh-80px)] qilib belgilandi (min-h o'chirildi)
        <div className="flex h-[calc(100vh-80px)] w-full bg-white md:rounded-3xl md:shadow-xl md:border border-gray-200 overflow-hidden relative">
            
            {/* CHAP PANEL (SIDEBAR) */}
            <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 absolute md:relative z-20 w-64 md:w-72 h-full bg-gray-50 border-r flex flex-col transition-transform duration-300 ease-in-out`}>
                <div className="p-4 flex items-center justify-between">
                    <button onClick={startNewChat} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm font-medium">
                        + Yangi suhbat
                    </button>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-2 p-2 text-gray-500">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase ml-2 mb-2">Tarix</p>
                    {chatSessions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center mt-4">Hozircha tarix yo'q</p>
                    ) : (
                        chatSessions.map(chat => (
                            <button key={chat.id} onClick={() => switchChat(chat.id)} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg truncate ${currentChatId === chat.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>
                                💬 {chat.title}
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <Link href="/dashboard/ai/voice" className="w-full flex items-center justify-center gap-2 bg-white border hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-sm">
                        🎤 Ovozli rejim
                    </Link>
                </div>
            </div>

            {/* ASOSIY CHAT QISMI */}
            <div className="flex-1 flex flex-col h-full bg-white relative w-full overflow-hidden">
                
                <div className="flex justify-between items-center px-4 py-3 border-b bg-white z-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 rounded-lg bg-gray-100">☰</button>
                        <h1 className="font-bold text-base md:text-lg text-gray-800">🦊 Kitsune-sensei</h1>
                    </div>
                </div>

                {/* XABARLAR QISMI: Faqat mana shu div skroll bo'ladi */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6 bg-gray-50">
                    {currentMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                            <div className="text-6xl mb-2 drop-shadow-sm">🦊</div>
                            <p className="text-base font-medium text-gray-500 text-center">Yapon tili bo'yicha qanday savolingiz bor?</p>
                        </div>
                    ) : (
                        currentMessages.map((m, i) => (
                            <div key={i} className={`flex gap-3 max-w-3xl mx-auto w-full ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm ${m.role === 'user' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                                    {m.role === 'user' ? '👤' : '🦊'}
                                </div>
                                <div className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 border rounded-2xl rounded-tl-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} className="h-1" />
                </div>

                <div className="p-3 md:p-4 bg-white border-t">
                    <div className="max-w-3xl mx-auto flex items-end gap-2 bg-gray-100 border border-gray-200 p-1.5 px-2 rounded-2xl">
                        <button onClick={() => recognitionRef.current?.start()} className="p-2 text-gray-500 text-lg">🎤</button>
                        <textarea 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            className="flex-1 max-h-24 bg-transparent py-2.5 px-1 outline-none text-sm text-gray-800"
                            placeholder="Xabar yozing..."
                            rows={1}
                        />
                        <button onClick={() => handleSend()} className="p-2 bg-blue-600 text-white rounded-xl">➤</button>
                    </div>
                </div>
            </div>
        </div>
    );
}