'use client';
// @ts-nocheck

import { useRef, useEffect, useState, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three'; // <-- Yuz qimirlashi silliq bo'lishi uchun THREE.js qo'shildi

// ==========================================
// 3D MODEL KOMPONENTI (HAQIQIY OVOZ BILAN ISHLAYDI)
// ==========================================
function CharacterModel({ isListening, isSpeaking, audioRef }: { isListening: boolean, isSpeaking: boolean, audioRef: any }) {
    const group = useRef<any>(null);
    const { scene, animations } = useGLTF('/3d/shibahu.glb'); 
    const { actions, names } = useAnimations(animations, group);


    useEffect(() => {
        console.log("Modeldagi animatsiyalar ro'yxati:", names);
    }, [names]);

    const analyserRef = useRef<any>(null);
    const dataArrayRef = useRef<any>(null);

    // 1. Model ichidan "Morph Targets" (yuz mushaklari) bor qismlarni topib olamiz
    const morphMeshes = useMemo(() => {
        const meshes: any[] = [];
        scene.traverse((child: any) => {
            if (child.isMesh && child.morphTargetDictionary) {
                meshes.push(child);
            }
        });
        return meshes;
    }, [scene]);

    

    // 2. Ovozni tahlil qilish tizimini (AudioContext) ulaymiz
    useEffect(() => {
        const audioEl = audioRef?.current;
        if (!audioEl) return;

        // Xavfsizlik: AudioContext brauzerda faqat 1 marta ochilishi kerak
        let audioCtx = (window as any).sharedAudioCtx;
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
                (window as any).sharedAudioCtx = audioCtx;
            }
        }

        if (!audioCtx) return;

        // Agar audio uxlayotgan bo'lsa, uyg'otamiz
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Brauzer analizatorini audio pleyerga ulaymiz
        if (!audioEl.sourceConnected) {
            try {
                const source = audioCtx.createMediaElementSource(audioEl);
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 32; // Ovoz chastotalari miqdori (32 ta yetarli)
                
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                
                audioEl.sourceConnected = true;
                audioEl.analyserNode = analyser;
            } catch (e) {
                console.log("Audio ulashda xatolik yuz berdi:", e);
            }
        }

        analyserRef.current = audioEl.analyserNode;
        if (analyserRef.current) {
            dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
    }, [isSpeaking, audioRef]); 

    // 3. Tana harakati: Faqat foydalanuvchi gapirayotganda (isListening) qotib turadi
    useEffect(() => {
        if (!names || names.length === 0 || !actions) return;
        
        const action = actions[names[0]];
        if (!action) return;

        if (isListening) {
            // 1. Foydalanuvchi tugmani bosdi va AI ga gapiryapti: 
            // Modelni 1-kadrga (boshlang'ich holatga) qaytarib, darhol to'xtatib qo'yamiz (qotadi)
            action.reset().play(); 
            action.paused = true; 
        } else {
            // 2. Boshqa hamma vaqt (AI gapirayotganda yoki sizni kutib turganda):
            // Harakat davom etadi
            action.paused = false; 
            action.play();
            action.setEffectiveTimeScale(1);
        }
    }, [isListening, actions, names]);
   

    // 4. Har bir kadrda (sekundiga 60 marta) og'izni haqiqiy ovozga qarab ochish
    useFrame(() => {
        let realVolume = 0;
        
        // AI gapirayotgan bo'lsa, audiodan chastota miqdorini o'qib olamiz
        if (isSpeaking && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            let sum = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
                sum += dataArrayRef.current[i];
            }
            // 0 dan 255 gacha bo'lgan sonni olamiz va og'iz ochilishi (0-1) uchun moslaymiz
            realVolume = (sum / dataArrayRef.current.length) / 50; 
        }

        morphMeshes.forEach((mesh) => {
            const dict = mesh.morphTargetDictionary;
            // Og'iz ochilishiga javob beradigan ehtimoliy nomlar ro'yxati
            const mouthKeys = ['mouthOpen', 'MouthOpen', 'jawOpen', 'JawOpen', 'A', 'a', 'O', 'o', 'vrc.v_aa', 'aa'];
            let targetIndex = -1;
            
            for (let key of mouthKeys) {
                if (dict[key] !== undefined) {
                    targetIndex = dict[key];
                    break;
                }
            }

            if (targetIndex !== -1) {
                if (isSpeaking) {
                    // Ovoz balandligiga qarab og'izni tabiiy ochish (lerp orqali silliqlaymiz)
                    const targetValue = Math.min(realVolume, 1);
                    mesh.morphTargetInfluences[targetIndex] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[targetIndex], targetValue, 0.4);
                } else {
                    // Jim turganda og'izni ohista yopish
                    mesh.morphTargetInfluences[targetIndex] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[targetIndex], 0, 0.2);
                }
            }
        });
    });

  return (
    <group ref={group} dispose={null}>
        <primitive object={scene} scale={0.5} position={[0, -0.01, 0]} />
    </group>
);


// MODELDA OG'IZ QIMIRLASH XUSUSIYATI BOR-YO'QLIGINI TEKSHIRISH
useEffect(() => {
    console.log("=== YANGI MODELNI TEKSHIRISH ===");
    let hasMorphTargets = false;

    scene.traverse((child: any) => {
        // Agar qism mesh bo'lsa va unda yuz mushaklari ro'yxati bo'lsa
        if (child.isMesh && child.morphTargetDictionary) {
            console.log(`✅ Topildi! Mesh nomi: ${child.name}`);
            console.log("Yuz mushaklari (Morph Targets):", Object.keys(child.morphTargetDictionary));
            hasMorphTargets = true;
        }
    });

    if (!hasMorphTargets) {
        console.warn("❌ Diqqat! Bu modelda Morph Targets yo'q. Kod yozsangiz ham og'zi qimirlamaydi.");
    }
}, [scene]);

//    Agar 3d animatsiya ekranda to'liq turishi kerak bo'lsa pasdagi kod kerak //

//     return (
// <group ref={group} dispose={null}>
// <primitive object={scene} scale={1.1} position={[0, -1.0, 0]} />

// </group>
//     );


}

useGLTF.preload('/3d/shibahu.glb');

// ==========================================
// ASOSIY SAHIFA (OVOZLI CHAT)
// ==========================================
export default function AiPage() {
    const [statusText, setStatusText] = useState("Gapirish uchun bosing...");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); 
    
    const [subtitle, setSubtitle] = useState("");
    
    const [level, setLevel] = useState('N5');
    const [topic, setTopic] = useState('Erkin suhbat');

    const language = 'ja-JP';
    
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); 
    const isProcessingRef = useRef(isProcessing);
    
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        isProcessingRef.current = isProcessing;
    }, [isProcessing]);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onstart = () => { 
                setIsListening(true); 
                setIsSpeaking(false); 
                setSubtitle(""); 
                setStatusText("Gapishingiz mumkin..."); 
            };
            
            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setIsListening(false);
                if (status === 'authenticated' && (session as any)?.accessToken && !isProcessingRef.current) {
                    setStatusText("O'ylanmoqda...");
                    sendToAi(text);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };
            
            recognition.onerror = () => { 
                setIsListening(false); 
                setStatusText("Xatolik yuz berdi."); 
            };
            
            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.onresult = null; 
                    recognitionRef.current.abort(); 
                } catch (e) {}
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel(); 
            }
        };
    }, [status, session, level, topic]); 

    const handleStartListening = () => {
    // 1. AudioContextni uyg'otish (Browser autoplay qoidalarini chetlab o'tish uchun)
    const audioCtx = (window as any).sharedAudioCtx;
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // 2. Agar oldingi audio ijro etilayotgan bo'lsa, uni to'xtatish
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }

    // 3. Ish jarayonida bo'lsa yoki AI gapirayotgan bo'lsa, to'xtatish
    if (isProcessing || isSpeaking) return;

    // 4. Agar foydalanuvchi allaqachon mikrofonni yoqqan bo'lsa, uni o'chirish (tugmani qayta bosganda)
    if (isListening && recognitionRef.current) {
        try {
            recognitionRef.current.abort();
            recognitionRef.current.stop();
        } catch (e) {
            console.error("Mikrofonni to'xtatishda xatolik:", e);
        }
        setIsListening(false);
        setStatusText("Gapirish uchun bosing...");
        return;
    }

    // 5. SpeechSynthesis (AI ning brauzerdagi ovozi) ni to'xtatish
    window.speechSynthesis.cancel();
    setSubtitle("");

    // 6. AudioRef ni tayyorlab qo'yish (Agar hali yo'q bo'lsa)
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
    }

    // 7. Mikrofonni yoqish
    if (recognitionRef.current) {
        try {
            recognitionRef.current.lang = language;
            recognitionRef.current.start();
        } catch (e) {
            console.error("Recognition allaqachon ishlamoqda yoki xatolik:", e);
        }
    }
};

    const handleCancel = () => {
        if (recognitionRef.current) {
            try { 
                recognitionRef.current.abort(); 
                recognitionRef.current.stop(); 
            } catch (e) {}
        }
        if (audioRef.current) { 
            audioRef.current.pause(); 
            audioRef.current.src = ""; 
        }
        window.speechSynthesis.cancel();
        
        setIsListening(false);
        setIsSpeaking(false);
        setIsProcessing(false);
        setSubtitle("");
        setStatusText("Bekor qilindi. Gapirish uchun bosing...");
    };

    const handleClearHistory = async () => {
        if (!session || !(session as any).accessToken) return;
        
        const isConfirmed = window.confirm("Yangi suhbat boshlaysizmi? Avvalgi suhbat tarixi o'chiriladi.");
        if (!isConfirmed) return;

        handleCancel();
        setIsProcessing(true);
        setStatusText("Suhbat tozalanmoqda...");

        try {
            const res = await fetch('http://127.0.0.1:8000/api/ai/history', {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${(session as any).accessToken}`,
                    'Accept': 'application/json' 
                }
            });

            if (res.ok) {
                setStatusText("Yangi suhbat boshlandi. Gapirish uchun bosing...");
            } else {
                setStatusText("Tarixni tozalashda xatolik yuz berdi.");
            }
        } catch (error) {
            console.error("History clear error:", error);
            setStatusText("Ulanish xatosi!");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGoBack = () => {
        handleCancel();
        router.push('/dashboard');
    };

    const handleGoToTextChat = () => {
        handleCancel();
        router.push('/dashboard/ai/text');
    };

    const sendToAi = async (text: string) => {
        setIsProcessing(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/ai/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${(session as any)?.accessToken}`,
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ 
                    message: text, 
                    lang: language,
                    level: level,
                    topic: topic
                })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.audio) {
                    setStatusText("Kitsune-sensei gapirmoqda..."); 
                    playAudio(data.audio, data.reply); 
                } else if (data.reply) {
                    setStatusText("Kitsune-sensei gapirmoqda...");
                    speak(data.reply); 
                }
            } else { 
                setStatusText("Javob olinmadi."); 
                setIsProcessing(false); 
            }
        } catch (e) { 
            setStatusText("Ulanish xatosi!"); 
            setIsProcessing(false); 
        }
    };

   const playAudio = (base64Audio: string, text: string) => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
    }
    
    // Ovozni tozalash va manbani o'rnatish
    audioRef.current.pause();
    audioRef.current.src = `data:audio/mp3;base64,${base64Audio}`;
    
    // Ovoz yuklanib bo'lgach, ijroni boshlash
    audioRef.current.oncanplaythrough = () => {
        audioRef.current?.play().then(() => {
            setIsSpeaking(true);
            setSubtitle(text);
        }).catch(err => {
            console.error("Autoplay bloklandi, fallback ishlatilmoqda...", err);
            speak(text); // Agar MP3 ishlamasa, brauzer ovoziga o'tadi
        });
    };
    
    audioRef.current.onended = () => { 
        setIsSpeaking(false); 
        setIsProcessing(false); 
        setSubtitle(""); 
        setStatusText("Yana savol bering..."); 
    };
};

    const speak = (text: string) => {
        if (typeof window === 'undefined') return;
        window.speechSynthesis.cancel(); 
        const cleanText = text.replace(/[*#_()]/g, '').trim();
        const u = new SpeechSynthesisUtterance(cleanText);
        
        u.lang = 'ja-JP';
        
        u.onstart = () => {
            setIsSpeaking(true);
            setSubtitle(cleanText); 
        };
        
        u.onend = () => { 
            setIsSpeaking(false); 
            setIsProcessing(false); 
            setSubtitle(""); 
            setStatusText("Yana savol bering..."); 
        };
        
        window.speechSynthesis.speak(u);
    };

    return (
        <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 md:rounded-3xl md:shadow-xl md:border border-gray-200 dark:border-gray-800 relative overflow-hidden transition-colors">
            
            {/* TEPADAGI 1 QATOR BARCHA TUGMALAR UCHUN */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex items-center justify-between z-50">
                <button onClick={handleGoBack} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 text-xl text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                    ←
                </button>

                <div className="flex justify-center gap-2 md:gap-3 flex-1 px-2">
                    <select 
                        value={level} 
                        onChange={(e) => setLevel(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-100 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="N5">N5 (Boshlang'ich)</option>
                        <option value="N4">N4 (O'rta-quyi)</option>
                        <option value="N3">N3 (O'rta)</option>
                        <option value="N2">N2 (Yuqori)</option>
                    </select>
                    
                    <select 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-100 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all max-w-[140px] md:max-w-none truncate"
                    >
                        <option value="Erkin suhbat">Erkin suhbat</option>
                        <option value="O'zini tanishtirish">O'zini tanishtirish</option>
                        <option value="Do'konda xarid">Do'konda xarid</option>
                        <option value="Restoranda buyurtma">Restoranda</option>
                        <option value="Sayohat va yo'l">Sayohat</option>
                        <option value="Ish joyida">Ish joyida</option>
                    </select>
                </div>

                <button 
                    onClick={handleClearHistory} 
                    disabled={isProcessing}
                    title="Yangi suhbat"
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shrink-0 disabled:opacity-50"
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
            </div>
            
            {/* Animatsiyali 3D Model */}
            <div className="w-full flex-1 flex items-center justify-center cursor-pointer z-10 mt-16 md:mt-20" onClick={handleStartListening}>
                {/* <Canvas camera={{ position: [0, 0, 3], fov: 45 }}> */}
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <directionalLight position={[-5, 5, -5]} intensity={1} />
                    {/* MUHIM O'ZGARISH: audioRef xususiyati orqali audio manbasini modelga beramiz */}
                    <CharacterModel isListening={isListening} isSpeaking={isSpeaking} audioRef={audioRef} />
                </Canvas>
            </div>
            
       {/* Holat yozuvlari va Subtitr (birlashtirilgan) */}
            <div className="absolute bottom-28 md:bottom-32 w-full z-20 flex justify-center px-4 transition-all duration-300 pointer-events-none">
                {subtitle ? (
                    // AI gapirayotganda chiqadigan yozuv (Ixcham holatda)
                    <div className="flex flex-col items-center justify-center gap-1 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30 max-w-2xl">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Kitsune-sensei
                        </span>
                        <p className="text-gray-900 dark:text-gray-50 text-base md:text-lg font-medium text-center leading-relaxed">
                            {subtitle}
                        </p>
                    </div>
                ) : (
                    // Oddiy holat yozuvlari (Gapirish uchun bosing...)
                    <div className="flex flex-col items-center justify-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30">
                        <h2 className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100">{statusText}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs md:text-sm">
                            🌐 日本語のみ対応 • {level} • {topic}
                        </p>
                    </div>
                )}
            </div>

            {/* IKKI CHETDAGI TUGMALAR */}
            <div className="absolute bottom-6 md:bottom-10 w-full flex justify-between px-8 md:px-16 z-40 pointer-events-none">
                <div className="flex flex-col items-center gap-2 md:gap-3 pointer-events-auto">
                    <button onClick={handleCancel} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition shadow-md">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5 md:w-6 md:h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">Bekor qilish</span>
                </div>

                <div className="flex flex-col items-center gap-2 md:gap-3 pointer-events-auto">
                    <button onClick={handleGoToTextChat} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition shadow-md">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18V6zM15 9h.01M9 9h.01M12 9h.01M15 12h.01M9 12h.01M12 12h.01M12 15h.01M6 12h.01M18 12h.01" />
                        </svg>
                    </button>
                    <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">Yozma chat</span>
                </div>
            </div>
        </div>
    );
}