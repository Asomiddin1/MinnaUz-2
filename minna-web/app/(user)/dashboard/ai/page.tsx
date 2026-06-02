'use client';
// @ts-nocheck

import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ==========================================
// PERSONAJLAR RO'YXATI
// ==========================================
const CHARACTERS = [
    { 
        id: 'kitsune', 
        name: 'Shibahu ', 
        url: '/3d/shibahu.glb', 
        scale: 6.5,               
        position: [0, -7.3, 0],   
        cameraPosition: [0, 0, 6],
        hasAnimation: true 
    },
    { 
        id: 'student', 
        name: 'O\'quvchi', 
        url: '/3d/rem.glb', 
        scale: 6.5, 
        position: [0, -5.8, 0], 
        cameraPosition: [0, 0, 8],
        hasAnimation: true
    },
    { 
        id: 'punchan', 
        name: 'Pun Chan (Anime)', 
        url: '/3d/sona.glb', 
        scale: 2.5,              
        position: [0, -5.5, 0],  
        cameraPosition: [0, 0, 7],
        hasAnimation: true       
    }
];

CHARACTERS.forEach(char => useGLTF.preload(char.url));

// ==========================================
// KAMERA NAZORATCHISI
// ==========================================
function CameraController({ targetPosition }: { targetPosition: number[] }) {
    const { camera } = useThree();
    
    useEffect(() => {
        camera.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
        camera.updateProjectionMatrix();
    }, [targetPosition, camera]);
    
    return null;
}


// ==========================================
// HAMROH: MODEL BILAN O'RTADA MASOFA SAQLOVCHI
// ==========================================
function PremiumGlassOrb({ isListening, isSpeaking }: { isListening: boolean, isSpeaking: boolean }) {
    const groupRef = useRef<any>(null);
    const mouthRef = useRef<any>(null);
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        
        if (groupRef.current) {
            // Endi 0.5 o'rniga 1.2 (yoki o'zingizga yoqqan balandlik) 
            // Bu modelni yuqoriroqqa ko'taradi va o'sha yerda tebratadi
            groupRef.current.position.y = 1.2 + Math.sin(time * 2) * 0.10;
            
            // Kamera tomon qarash (agar kerak bo'lsa)
            groupRef.current.lookAt(0, 0.5, 6); 
        }

        // Og'iz qimirlashi
        if (mouthRef.current) {
            const targetMouthY = isSpeaking ? 0.6 + Math.sin(time * 15) * 0.4 : 0.2;
            mouthRef.current.scale.y = targetMouthY;
        }
    });
  

   const slimeMaterial = <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0} />;

    return (
        // X=2.2 (ancha o'ngda), Y=0.5, Z=1.5 (modeldan oldinda va uzoqda)
        <group ref={groupRef} position={[2.2, 0.8, 1.5]} scale={[0.35, 0.35, 0.35]}>
            
            {/* TANA */}
            {/* <mesh><sphereGeometry args={[1, 50, 64]} />{slimeMaterial}</mesh> */}
            <mesh>
    <sphereGeometry args={[1, 64, 64]} />
    {slimeMaterial}
</mesh>

             {/* QULOQLAR */}
            {/* <mesh position={[-0.5, 0.8, 0]} rotation={[0, 0, 0.3]}><capsuleGeometry args={[0.2, 0.5, 8, 16]} />{slimeMaterial}</mesh>
            <mesh position={[0.5, 0.8, 0]} rotation={[0, 0, -0.3]}><capsuleGeometry args={[0.2, 0.5, 8, 16]} />{slimeMaterial}</mesh>
             */}
            {/* MUSHUK QULOQLARI (Konus shaklida, o'tkir uchli) */}
            {/* 0.25 - pastki qismi kengligi, 0.4 - balandligi */}
            <mesh position={[-0.45, 1.1, 0]} rotation={[0, 0, 0.1]} scale={[1.3, 1.7, 0.3]}><coneGeometry args={[0.25, 0.4, 32]} />{slimeMaterial}</mesh>
            <mesh position={[0.45, 1.1, 0]} rotation={[0, 0, -0.1]} scale={[1.3, 1.7, 0.3]}> <coneGeometry args={[0.25, 0.4, 32]} />{slimeMaterial}</mesh>


             {/* QO'LLAR (Endi aniq pastga qaragan) */}
            {/* <mesh position={[-0.9, -0.3, 0]} rotation={[0, 0, 5.2]}><capsuleGeometry args={[0.15, 0.9, 8, 16]} />{slimeMaterial}</mesh>
            <mesh position={[0.9, -0.3, 0]} rotation={[0, 0, -5.2]}><capsuleGeometry args={[0.15, 0.9, 8, 16]} />{slimeMaterial}</mesh>
             */}
            {/* KO'Z OQI (Z = 0.98) */}
            <mesh position={[-0.35, 0.2, 0.98]}><sphereGeometry args={[0.22, 32, 32]} /><meshBasicMaterial color="#ffffff" /></mesh>
            <mesh position={[0.35, 0.2, 0.98]}><sphereGeometry args={[0.22, 32, 32]} /><meshBasicMaterial color="#ffffff" /></mesh>
            
            {/* QORA QORACHIQ (Z = 1.15 - oq ko'zdan ancha oldinda) */}
            <mesh position={[-0.35, 0.18, 1.15]}><sphereGeometry args={[0.1, 35, 32]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0.35, 0.18, 1.15]}><sphereGeometry args={[0.1, 35, 32]} /><meshBasicMaterial color="#000000" /></mesh>
            

             
            {/* <mesh position={[-0.35, 0.2, 1.15]}><sphereGeometry args={[0.15, 32, 32]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0.35, 0.2, 1.15]}><sphereGeometry args={[0.15, 32, 32]} /><meshBasicMaterial color="#000000" /></mesh>
             */}
            {/* OG'IZ - Z=1.10 */}
            <mesh ref={mouthRef} position={[0, -0.15, 1.10]} scale={[1, 0.3, 1]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#0f172a" />
            </mesh>
        </group>
    );
}
// ==========================================
// 3D MODEL KOMPONENTI 
// ==========================================
function CharacterModel({ isListening, isSpeaking, audioRef, characterInfo }: { 
    isListening: boolean, 
    isSpeaking: boolean, 
    audioRef: any,
    characterInfo: typeof CHARACTERS[0]
}) {
    const group = useRef<any>(null);
    const headBoneRef = useRef<any>(null); 
    
    const { scene, animations } = useGLTF(characterInfo.url); 
    const { actions, names } = useAnimations(animations, group);

    const analyserRef = useRef<any>(null);
    const dataArrayRef = useRef<any>(null);

    const morphMeshes = useMemo(() => {
        const meshes: any[] = [];
        headBoneRef.current = null; 

        scene.traverse((child: any) => {
            if (child.isMesh && child.morphTargetDictionary) {
                meshes.push(child);
            }
            if (child.isBone) {
                const boneName = child.name.toLowerCase();
                if (boneName.includes('head')) {
                    headBoneRef.current = child;
                }
            }
        });
        return meshes;
    }, [scene]);

    useEffect(() => {
        const audioEl = audioRef?.current;
        if (!audioEl) return;

        let audioCtx = (window as any).sharedAudioCtx;
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
                (window as any).sharedAudioCtx = audioCtx;
            }
        }

        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        if (!audioEl.sourceConnected) {
            try {
                const source = audioCtx.createMediaElementSource(audioEl);
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 32;
                
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                
                audioEl.sourceConnected = true;
                audioEl.analyserNode = analyser;
            } catch (e) {
                console.log("Audio ulashda xatolik:", e);
            }
        }

        analyserRef.current = audioEl.analyserNode;
        if (analyserRef.current) {
            dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
    }, [isSpeaking, audioRef]); 

    useEffect(() => {
        if (characterInfo.hasAnimation === false) return;
        if (!names || names.length === 0 || !actions) return;
        
        const action = actions[names[0]];
        if (!action) return;

        if (isListening) {
            action.reset().play(); 
            action.paused = true; 
        } else {
            action.paused = false; 
            action.play();
            action.setEffectiveTimeScale(1);
        }
    }, [isListening, actions, names, characterInfo]);
   
    useFrame((state) => {
        let realVolume = 0;
        
        if (isSpeaking && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            let sum = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
                sum += dataArrayRef.current[i];
            }
            realVolume = (sum / dataArrayRef.current.length) / 30; 
        }

        // BOSHNI QIMIRLATISH MANTIG'I
        if (headBoneRef.current) {
            if (isSpeaking) {
                const nodAmount = Math.sin(state.clock.getElapsedTime() * 15) * (realVolume * 0.1);
                headBoneRef.current.rotation.x = THREE.MathUtils.lerp(headBoneRef.current.rotation.x, nodAmount, 0.2);
            } else {
                headBoneRef.current.rotation.x = THREE.MathUtils.lerp(headBoneRef.current.rotation.x, 0, 0.1);
            }
        }
    });

    return (
        <group ref={group} dispose={null}>
            <primitive 
                object={scene} 
                scale={characterInfo.scale} 
                position={characterInfo.position} 
            />
        </group>
    );
}

// ==========================================
// ASOSIY SAHIFA 
// ==========================================
export default function AiPage() {
    const [statusText, setStatusText] = useState("Gapirish uchun bosing...");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); 
    
    const [subtitle, setSubtitle] = useState("");
    
    const [level, setLevel] = useState('N5');
    const [topic, setTopic] = useState('Erkin suhbat');
    const [selectedCharId, setSelectedCharId] = useState(CHARACTERS[0].id);

    const language = 'ja-JP';
    
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); 
    const isProcessingRef = useRef(isProcessing);
    
    const { data: session, status } = useSession();
    const router = useRouter();

    const currentCharacter = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];

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
                const text = event.results[0][0].transcript.trim();
                setIsListening(false);

                if (!text || text.length < 2) {
                    setStatusText("Yaxshi eshitilmadi. Qaytadan bosing.");
                    return; 
                }

                if (status === 'authenticated' && (session as any)?.accessToken && !isProcessingRef.current) {
                    setStatusText("O'ylanmoqda...");
                    sendToAi(text);
                }
            };

            recognition.onend = () => { setIsListening(false); };
            
            recognition.onerror = () => { 
                setIsListening(false); 
                setStatusText("Xatolik yuz berdi. Qayta urinib ko'ring."); 
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
    }, [status, session, level, topic, selectedCharId]); 

    const handleStartListening = () => {
        const audioCtx = (window as any).sharedAudioCtx;
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        if (isProcessing || isSpeaking) return;

        if (isListening && recognitionRef.current) {
            try {
                recognitionRef.current.abort();
                recognitionRef.current.stop();
            } catch (e) {}
            setIsListening(false);
            setStatusText("Gapirish uchun bosing...");
            return;
        }

        window.speechSynthesis.cancel();
        setSubtitle("");

        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.crossOrigin = "anonymous";
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.lang = language;
                recognitionRef.current.start();
            } catch (e) {}
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
        if (!session || !(session as any).accessToken) {
            setStatusText("Sessiya tugagan.");
            return;
        }
        
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
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                }
            });

            if (res.ok) {
                setStatusText("Yangi suhbat boshlandi. Gapirish uchun bosing...");
                setSubtitle("");
                window.location.reload(); 
            } else {
                const errorData = await res.json();
                console.error("Xatolik:", errorData);
                setStatusText("Tarixni tozalashda xatolik yuz berdi.");
            }
        } catch (error) {
            console.error("Ulanish xatosi:", error);
            setStatusText("Serverga ulanib bo'lmadi!");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGoBack = () => { handleCancel(); router.push('/dashboard'); };
    const handleGoToTextChat = () => { handleCancel(); router.push('/dashboard/ai/text'); };

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
                body: JSON.stringify({ message: text, lang: language, level: level, topic: topic })
            });
            const data = await res.json();
            
            if (res.ok) {
                if (data.audioUrl) {
                    setStatusText(`${currentCharacter.name} gapirmoqda...`); 
                    playAudio(data.audioUrl, data.reply); 
                } else if (data.reply) {
                    setStatusText(`${currentCharacter.name} gapirmoqda...`);
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

    const playAudio = (audioUrl: string, text: string) => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.crossOrigin = "anonymous";
        }
        
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
        
        audioRef.current.oncanplaythrough = () => {
            audioRef.current?.play().then(() => {
                setIsSpeaking(true);
                setSubtitle(text);
            }).catch(err => {
                speak(text); 
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
        u.pitch = 1.08; 
        u.rate = 1.05;  
        u.volume = 1.0;

        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => 
                v.lang === 'ja-JP' && 
                (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Nanami'))
            );
            
            if (preferredVoice) {
                u.voice = preferredVoice;
            }
        };

        setVoice();
        window.speechSynthesis.onvoiceschanged = setVoice;
        
        u.onstart = () => { setIsSpeaking(true); setSubtitle(cleanText); };
        u.onend = () => { 
            setIsSpeaking(false); 
            setIsProcessing(false); 
            setSubtitle(""); 
            setStatusText("Yana savol bering..."); 
        };
        
        setTimeout(() => {
            window.speechSynthesis.speak(u);
        }, 100);
    };

    return (
        <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 md:rounded-3xl md:shadow-xl md:border border-gray-200 dark:border-gray-800 relative overflow-hidden transition-colors">
            
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex items-center justify-between z-50 flex-wrap gap-2">
                <button onClick={handleGoBack} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 text-xl text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                    ←
                </button>

                <div className="flex flex-wrap justify-center gap-2 md:gap-3 flex-1 px-2">
                    <select 
                        value={selectedCharId} 
                        onChange={(e) => setSelectedCharId(e.target.value)}
                        className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all truncate"
                    >
                        {CHARACTERS.map(char => (
                            <option key={char.id} value={char.id}>{char.name}</option>
                        ))}
                    </select>

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
            
            <div className="w-full flex-1 flex items-center justify-center cursor-pointer z-10 mt-16 md:mt-20" onClick={handleStartListening}>
                <Canvas>
                    <CameraController targetPosition={currentCharacter.cameraPosition} />
                    
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <directionalLight position={[-5, 5, -5]} intensity={1} />
                    
                    <Suspense fallback={null}>
                        {/* ASOSIY MODEL (Avatar) */}
                        <CharacterModel 
                            isListening={isListening} 
                            isSpeaking={isSpeaking} 
                            audioRef={audioRef} 
                            characterInfo={currentCharacter}
                        />
                        {/* Eski hamma narsani o'chiring, faqat buni qoldiring */}
    <PremiumGlassOrb 
        isListening={isListening} 
        isSpeaking={isSpeaking} 
    />


                    </Suspense>
                </Canvas>
            </div>
            
            <div className="absolute bottom-28 md:bottom-32 w-full z-20 flex justify-center px-4 transition-all duration-300 pointer-events-none">
                {subtitle ? (
                    <div className="flex flex-col items-center justify-center gap-1 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30 max-w-2xl">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            {currentCharacter.name}
                        </span>
                        <p className="text-gray-900 dark:text-gray-50 text-base md:text-lg font-medium text-center leading-relaxed">
                            {subtitle}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/30">
                        <h2 className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100">{statusText}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs md:text-sm">
                            🌐 日本語のみ対応 • {level} • {topic}
                        </p>
                    </div>
                )}
            </div>

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