'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react'; 
import Link from 'next/link';

type Message = { role: string; text: string };
type ChatSession = { id: string; title: string; messages: Message[] };

export default function TextAiPage() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    
    const { data: session } = useSession();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentMessages = currentChatId 
        ? chatSessions.find(c => c.id === currentChatId)?.messages || []
        : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages, isLoading]);

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
        if (!msg.trim() || isLoading) return;
        
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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            
            const res = await fetch(`${apiUrl}/api/ai/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token || ''}` 
                },
                body: JSON.stringify({ 
                    message: msg, 
                    chat_id: activeId, 
                    history: [...historyToSend, userMsg] 
                })
            });

            if (!res.ok) {
                throw new Error(`Server xatosi: ${res.status}`);
            }

            const data = await res.json();
            const aiMsg = { role: 'ai', text: data.reply };
            setChatSessions(prev => prev.map(chat => chat.id === activeId ? { ...chat, messages: [...chat.messages, aiMsg] } : chat));
            
        } catch (error) { 
            console.error("Fetch xatosi:", error);
            alert("Kechirasiz, serverga ulanib bo'lmadi. Backend ishlayotganini va CORS sozlamalarini tekshiring.");
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] w-full bg-white dark:bg-gray-900 md:rounded-3xl md:shadow-xl md:border border-gray-200 dark:border-gray-800 overflow-hidden relative transition-colors">
            {/* CHAP PANEL */}
            <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 absolute md:relative z-20 w-64 md:w-72 h-full bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out`}>
                <div className="p-4 flex items-center justify-between">
                    <button onClick={startNewChat} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm font-medium">
                        + Yangi suhbat
                    </button>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-2 p-2 text-gray-500 dark:text-gray-400">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase ml-2 mb-2">Tarix</p>
                    {chatSessions.map(chat => (
                        <button key={chat.id} onClick={() => switchChat(chat.id)} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg truncate ${currentChatId === chat.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                            💬 {chat.title}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t dark:border-gray-800">
                    <Link href="/dashboard/ai" className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-sm">
                        🎤 Ovozli rejim (3D)
                    </Link>
                </div>
            </div>

            {/* ASOSIY CHAT */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 relative">
                <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-800">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 dark:text-gray-300">☰</button>
                    <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100">🦊 Kitsune-sensei</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {currentMessages.map((m, i) => (
                        <div key={i} className={`flex gap-3 max-w-3xl mx-auto ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                {m.role === 'user' ? '👤' : '🦊'}
                            </div>
                            <div className={`px-4 py-2.5 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t dark:border-gray-800">
                    <div className="max-w-3xl mx-auto flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
                        <textarea 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            className="flex-1 bg-transparent outline-none p-2 text-sm text-gray-800 dark:text-gray-100"
                            placeholder="Xabar yozing..."
                            rows={1}
                        />
                        <button onClick={() => handleSend()} disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">➤</button>
                    </div>
                </div>
            </div>
        </div>
    );
}