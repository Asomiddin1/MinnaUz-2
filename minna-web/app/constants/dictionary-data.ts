// app/constants/dictionary-data.ts

// === TYPESCRIPT TIPLARI ===
export type WordCategory = "Asosiy" | "Murakkab"; // Yangi toifalar

export interface Word {
  id: number;
  kanji: string;
  kana: string;
  romaji: string;
  uzbek: string;
  level: string;
  category: WordCategory; // So'z asosiymi yoki murakkab?
  image?: string;
}

export interface Deck {
  id: number;
  title: string;
  category: WordCategory; // To'plam qaysi toifaga tegishli?
  count: number; // Masalan: 10 ta yoki 15 ta
  progress: number;
  color: string;
  words: Word[];
}

// === DIFOLT MA'LUMOTLAR (KENGAYTIRILGAN) ===
export const MOCK_WORDS: Word[] = [
  // --- ASOSIY SO'ZLAR ---
  { 
    id: 1, kanji: "学生", kana: "がくせい", romaji: "gakusei", uzbek: "Talaba", level: "N5",
    category: "Asosiy",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 2, kanji: "学校", kana: "がっこう", romaji: "gakkou", uzbek: "Maktab", level: "N5",
    category: "Asosiy",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 4, kanji: "先生", kana: "せんせい", romaji: "sensei", uzbek: "O'qituvchi", level: "N5",
    category: "Asosiy",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 5, kanji: "家族", kana: "かぞく", romaji: "kazoku", uzbek: "Oila", level: "N5",
    category: "Asosiy",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 6, kanji: "食べる", kana: "たべる", romaji: "taberu", uzbek: "Yemoq", level: "N5",
    category: "Asosiy",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 7, kanji: "水", kana: "みず", romaji: "mizu", uzbek: "Suv", level: "N5",
    category: "Asosiy",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=800"
  },

  // --- MURAKKAB SO'ZLAR ---
  { 
    id: 3, kanji: "憂鬱", kana: "ゆううつ", romaji: "yuuutsu", uzbek: "Tushkunlik, depressiya", level: "N1",
    category: "Murakkab",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 8, kanji: "挨拶", kana: "あいさつ", romaji: "aisatsu", uzbek: "Salomlashish", level: "N3",
    category: "Murakkab",
    image: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 9, kanji: "完璧", kana: "かんぺき", romaji: "kanpeki", uzbek: "Mukammal", level: "N3",
    category: "Murakkab",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 10, kanji: "躊躇", kana: "ちゅうちょ", romaji: "chuucho", uzbek: "Ikkilanish", level: "N1",
    category: "Murakkab",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800"
  },
];

export const MOCK_WORD_OF_THE_DAY: Word = { 
  id: 99, 
  kanji: "頑張る", 
  kana: "がんばる", 
  romaji: "ganbaru", 
  uzbek: "Harakat qilmoq", 
  level: "N5",
  category: "Asosiy",
};

// TO'PLAMLAR (10-15 TALIK BO'LIMLAR)
export const MOCK_DECKS: Deck[] = [
  { 
    id: 1, 
    title: "1-bo'lim (Kundalik hayot)", 
    category: "Asosiy",
    count: 15, 
    progress: 10, 
    color: "from-blue-500 to-indigo-500", 
    // Boshida faqat id=1 (Talaba) va id=2 (Maktab) kiritilgan. Qolganlarini o'zingiz qo'shib sinab ko'rasiz.
    words: MOCK_WORDS.filter(w => w.category === "Asosiy" && (w.id === 1 || w.id === 2)) 
  },
  { 
    id: 2, 
    title: "2-bo'lim (Oila va uy)", 
    category: "Asosiy",
    count: 15, 
    progress: 0, 
    color: "from-blue-500 to-indigo-500", 
    words: [] // Hozircha bo'sh!
  },
  { 
    id: 3, 
    title: "1-bo'lim (Qiyin iyerogliflar)", 
    category: "Murakkab",
    count: 10, 
    progress: 12, 
    color: "from-rose-500 to-red-500", 
    // Boshida faqat id=3 (Depressiya) bor.
    words: MOCK_WORDS.filter(w => w.category === "Murakkab" && w.id === 3) 
  },
  { 
    id: 4, 
    title: "2-bo'lim (O'xshash so'zlar)", 
    category: "Murakkab",
    count: 10, 
    progress: 0, 
    color: "from-rose-500 to-red-500", 
    words: [] // Hozircha bo'sh!
  },
];