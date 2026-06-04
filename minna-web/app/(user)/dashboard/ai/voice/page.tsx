// @ts-nocheck
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';

// ==========================================
// 3D Zarrachali Shar Komponenti
// ==========================================
function ParticleSphere({ isListening, isSpeaking }: { isListening: boolean, isSpeaking: boolean }) {
    const ref = useRef<any>(null);
    const particlesCount = 2500; 

    const [positions, originalPositions] = useMemo(() => {
        const pos = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 2.0; 
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); 
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); 
            pos[i * 3 + 2] = r * Math.cos(phi); 
        }
        return [pos, new Float32Array(pos)]; 
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.getElapsedTime();
        const { position } = ref.current.geometry.attributes;
        ref.current.rotation.y = time * 0.1;
        ref.current.rotation.z = time * 0.05;

        for (let i = 0; i < particlesCount; i++) {
            const idx = i * 3;
            const ox = originalPositions[idx];
            const oy = originalPositions[idx + 1];
            const oz = originalPositions[idx + 2];
            let scatter = 0;

            if (isSpeaking) {
                scatter = (Math.sin(time * 8 + oy * 3) * Math.cos(time * 5 + ox * 2)) * 0.6;
            } else if (isListening) {
                scatter = Math.sin(time * 3 - oy * 2) * 0.2 + 0.1;
            } else {
                scatter = Math.sin(time * 1.5 + ox * 2 + oy) * 0.05;
            }

            const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
            position.array[idx] += ((ox + (ox / len) * scatter) - position.array[idx]) * 0.1;
            position.array[idx + 1] += ((oy + (oy / len) * scatter) - position.array[idx + 1]) * 0.1;
            position.array[idx + 2] += ((oz + (oz / len) * scatter) - position.array[idx + 2]) * 0.1;
        }
        position.needsUpdate = true; 
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.035} color="#4f46e5" transparent opacity={0.7} sizeAttenuation />
        </points>
    );
}

// ==========================================
// ASOSIY SAHIFA
// ==========================================
export default function VoiceChatPage() {
    const [statusText, setStatusText] = useState("Ovozli yordamchi tayyor");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); 
    
    // UI va Sozlamalar
    const [topic, setTopic] = useState("Erkin");
    const [level, setLevel] = useState("N5");
    const [subtitle, setSubtitle] = useState("");
    
    // Suhbat xotirasi
    const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
    
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); 
    
    const { data: session, status } = useSession();
    const router = useRouter();

    // Tozalash
    useEffect(() => {
        return () => handleStopAll();
    }, []);

    const handleStopAll = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        if (audioRef.current) audioRef.current.pause();
        window.speechSynthesis.cancel();
        setIsListening(false);
        setIsSpeaking(false);
        setIsProcessing(false);
        setStatusText("To'xtatildi");
    };

    // Klaviaturadan 'X' ni bosganda to'xtatish
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'x') handleStopAll();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Ovozni aniqlash sozlamalari 
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false; 
            recognition.interimResults = false; 
            
            recognition.onstart = () => { 
                setIsListening(true); 
                setIsSpeaking(false); 
                setStatusText("Eshitmoqdaman..."); 
                setSubtitle("...");
            };

            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setIsListening(false);
                setSubtitle(`Siz: ${text}`);

                if (status === 'authenticated' && (session as any)?.accessToken && !isProcessing) {
                    setStatusText("Javob tayyorlanmoqda...");
                    sendToAi(text);
                }
            };

            recognition.onerror = () => { 
                setIsListening(false); 
                setStatusText("Tayyor"); 
            };
            
            recognition.onend = () => {
                setIsListening(false);
            }

            recognitionRef.current = recognition;
        }
    }, [status, session, isProcessing, topic, level, chatHistory]);

    // Eshitishni boshlash
    const handleStartListening = () => {
        if (isProcessing || isSpeaking) return;
        
        handleStopAll(); 
        
        const unlockMsg = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(unlockMsg);

        if (recognitionRef.current) {
            try { 
                recognitionRef.current.lang = 'ja-JP'; 
                recognitionRef.current.start(); 
            } catch (e) { console.log("Recognition is currently running"); }
        }
    };

    // Xotirani tozalash
    const handleClearMemory = () => {
        setChatHistory([]);
        setSubtitle("");
        setStatusText("Xotira tozalandi. Tayyor");
        handleStopAll();
    };

    // AI ga yuborish
    const sendToAi = async (text: string) => {
        setIsProcessing(true);
        
        const newHistory = [...chatHistory, { role: "user", content: text }];
        setChatHistory(newHistory);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${(session as any)?.accessToken}` },
                body: JSON.stringify({ 
                    message: text, 
                    lang: 'ja-JP', 
                    topic: topic, 
                    level: level,
                    history: newHistory 
                })
            });
            const data = await res.json();
            if (res.ok) {
                const aiReply = data.reply;
                setSubtitle(`Sensei: ${aiReply}`);
                setChatHistory(prev => [...prev, { role: "assistant", content: aiReply }]);
                
                if (data.audio) {
                    setStatusText("Gapirmoqda...");
                    playAudio(data.audio); 
                } else if (aiReply) {
                    setStatusText("Gapirmoqda...");
                    speak(aiReply); 
                }
            } else { 
                setStatusText("Javob olinmadi."); 
                setIsProcessing(false); 
            }
        } catch (e) { 
            setStatusText("Ulanishda xatolik!"); 
            setIsProcessing(false); 
        }
    };

    const playAudio = (base64Audio: string) => {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        
        audio.playbackRate = 0.90; 
        
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => { 
            setIsSpeaking(false); 
            setIsProcessing(false); 
            setStatusText("Tayyor"); 
        };
        audio.play();
    };

    const speak = (text: string) => {
        if (typeof window === 'undefined') return;
        window.speechSynthesis.cancel(); 
        const cleanText = text.replace(/[*#_()]/g, '').trim();
        const u = new SpeechSynthesisUtterance(cleanText);
        u.lang = 'ja-JP';
        
        u.rate = 0.8; 
        
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => { 
            setIsSpeaking(false); 
            setIsProcessing(false); 
            setStatusText("Tayyor"); 
        };
        window.speechSynthesis.speak(u);
    };

    return (
        <div className="flex w-full h-[calc(100dvh-80px)] flex-col bg-white dark:bg-[#0a0a0a] relative overflow-hidden font-sans">
            
            {/* Yuqori Panel (Nav) */}
            <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 z-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
                <button 
                    onClick={() => router.push('/dashboard/ai')} 
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition p-2 -ml-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>

                <div className="flex gap-4">
                    <select 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-transparent border-0 text-gray-700 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none text-center"
                    >
                        <option value="Erkin">Erkin</option>
                        <option value="Tanishtiruv">Tanishtiruv</option>
                        <option value="Oila">Oila</option>
                        <option value="Ish">Ish / O'qish</option>
                        <option value="Ko'cha">Ko'cha</option>
                    </select>
                    
                    <span className="text-gray-300 dark:text-gray-700">|</span>

                    <select 
                        value={level} 
                        onChange={(e) => setLevel(e.target.value)}
                        className="bg-transparent border-0 text-gray-700 dark:text-gray-300 text-sm font-medium focus:ring-0 cursor-pointer outline-none text-center"
                    >
                        <option value="N5">N5 Daraja</option>
                        <option value="N4">N4 Daraja</option>
                        <option value="N3">N3 Daraja</option>
                        <option value="N2">N2 Daraja</option>
                    </select>
                </div>

                <button 
                    onClick={handleClearMemory}
                    title="Xotirani tozalash"
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition p-2 -mr-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Asosiy Qism: To'liq markazlashgan va Skroll bo'ladigan */}
            <div className="flex-1 w-full flex flex-col overflow-y-auto">
                <div className="m-auto flex flex-col items-center justify-center w-full max-w-3xl px-4 py-8 min-h-max">
                    
                    {/* 3D Shar: O'lchamlari barqarorlashtirildi */}
                    <div 
                        className="w-full max-w-[180px] md:max-w-[240px] aspect-square flex items-center justify-center z-10 cursor-pointer shrink-0" 
                        onClick={handleStartListening}
                    >
                        <Canvas camera={{ position: [0, 0, 4] }}>
                            <ParticleSphere isListening={isListening} isSpeaking={isSpeaking} />
                        </Canvas>
                    </div>

                    {/* Subtitr va Holat */}
                    <div className="mt-8 flex flex-col items-center w-full">
                        <p className="text-xs md:text-sm font-medium text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-3 text-center">
                            {statusText}
                        </p>
                        
                        {subtitle && (
                            <p className="text-[16px] md:text-[18px] font-medium text-center text-gray-800 dark:text-gray-200 leading-relaxed max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* Pastki Boshqaruv Tugmalari: O'lchami kichraytirildi va to'g'rilandi */}
            <div className="w-full shrink-0 bg-white dark:bg-[#0a0a0a] pt-2 pb-24 md:pb-8 flex justify-center gap-4 px-4 border-t border-transparent">
                <button 
                    onClick={handleStartListening}
                    disabled={isProcessing || isSpeaking}
                    className={`min-w-[140px] px-8 py-3.5 rounded-xl text-sm font-medium transition-all ${
                        isListening 
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-50'
                    }`}
                >
                    {isListening ? 'Eshitilmoqda...' : 'Gapirish'}
                </button>

                <button 
                    onClick={handleStopAll}
                    className="min-w-[140px] px-8 py-3.5 rounded-xl text-sm font-medium bg-transparent border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-[#111] transition-all"
                >
                    To'xtatish
                </button>
            </div>

        </div>
    );
}