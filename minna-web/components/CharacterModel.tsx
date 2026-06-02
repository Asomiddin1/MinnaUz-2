'use client'; // <-- 1. Next.js'da hooklar ishlashi uchun buni yozish shart!

import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function CharacterModel({ isListening, isSpeaking }: { isListening: boolean, isSpeaking: boolean }) {
    const group = useRef<any>(null); // <-- 2. null qiymat qo'shildi
    
    // Agar model.glb to'g'ridan-to'g'ri public papkasida turgan bo'lsa, '/model.glb' deb yozing
    const { scene, animations } = useGLTF('/3d/shibahu.glb'); 
    const { actions, names } = useAnimations(animations, group);

    useEffect(() => {
        // Agar animatsiyalar topilmasa, kod sinib qolmasligi uchun himoya:
        if (!names || names.length === 0 || !actions) return;

        console.log("Modeldagi animatsiyalar ro'yxati:", names);

        // 3. TypeScript "action nima?" deb xato bermasligi uchun (action: any) deb ko'rsatamiz
        Object.values(actions).forEach((action: any) => action?.stop());

        // Hozircha eng birinchi animatsiyani doimiy yoqib qo'yamiz
        if (names[0] && actions[names[0]]) {
            actions[names[0]]?.play(); 
        }
    }, [isSpeaking, isListening, actions, names]);

    return (
        <group ref={group} dispose={null}>
            <primitive object={scene} scale={1.5} position={[0, -2, 0]} />
        </group>
    );
}

useGLTF.preload('/3d/shibahu.glb');