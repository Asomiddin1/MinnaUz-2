"use client";

import React from 'react';
import { useParams } from 'next/navigation';

// DIQQAT: O'zingiz yaratgan fayllar nomiga qarab bu yerda importlarni to'g'rilang
import Level1Game from '@/components/user-components/home-fuctions/games/buble-app/buble-game';
import Level2Game from '@/components/user-components/home-fuctions/games/buble-app/buble-game-2';

const BublePage = () => {
  const params = useParams();
  const level = params.level; // URL'dan bosqich raqamini oladi (1 yoki 2)

  return (
    <div className="w-full h-full">
      {/* URL /buble/1 bo'lsa 1-bosqich chiqadi */}
      {level === "1" && <Level1Game />}
      
      {/* URL /buble/2 bo'lsa 2-bosqich chiqadi */}
      {level === "2" && <Level2Game />}

      {/* Agar mavjud bo'lmagan raqam yozilsa */}
      {level !== "1" && level !== "2" && (
        <div className="flex items-center justify-center h-[500px] text-2xl font-bold text-red-500">
          Bu bosqich hali tayyor emas!
        </div>
      )}
    </div>
  );
}

export default BublePage;