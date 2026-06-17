// app/constants/dictionary-data.ts

// === TYPESCRIPT TIPLARI ===
export interface Word {
  id: number;
  kanji: string;
  kana: string;
  romaji: string;
  uzbek: string;
  level: string; // N5, N4, N3, N2, N1
}

// === DIFOLT MA'LUMOTLAR (KO'PAYTIRILGAN) ===
export const MOCK_WORDS: Word[] = [
  // --- N5 (Boshlang'ich) ---
  { id: 1, kanji: "一", kana: "いち", romaji: "ichi", uzbek: "Bir", level: "N5" },
  { id: 2, kanji: "二", kana: "に", romaji: "ni", uzbek: "Ikki", level: "N5" },
  { id: 3, kanji: "三", kana: "さん", romaji: "san", uzbek: "Uch", level: "N5" },
  { id: 4, kanji: "人", kana: "ひと", romaji: "hito", uzbek: "Odam", level: "N5" },
  { id: 5, kanji: "日", kana: "ひ", romaji: "hi", uzbek: "Kun / Quyosh", level: "N5" },
  { id: 6, kanji: "月", kana: "つき", romaji: "tsuki", uzbek: "Oy", level: "N5" },
  { id: 7, kanji: "水", kana: "みず", romaji: "mizu", uzbek: "Suv", level: "N5" },
  { id: 8, kanji: "木", kana: "き", romaji: "ki", uzbek: "Daraxt", level: "N5" },
  { id: 9, kanji: "金", kana: "かね", romaji: "kane", uzbek: "Oltin / Pul", level: "N5" },
  { id: 10, kanji: "土", kana: "つち", romaji: "tsuchi", uzbek: "Tuproq", level: "N5" },
  { id: 11, kanji: "本", kana: "ほん", romaji: "hon", uzbek: "Kitob", level: "N5" },
  { id: 12, kanji: "学", kana: "まなぶ", romaji: "manabu", uzbek: "O'rganmoq", level: "N5" },
  { id: 13, kanji: "生", kana: "いきる", romaji: "ikiru", uzbek: "Yashamoq", level: "N5" },
  { id: 14, kanji: "大", kana: "おおきい", romaji: "ookii", uzbek: "Katta", level: "N5" },
  { id: 15, kanji: "小", kana: "ちいさい", romaji: "chiisai", uzbek: "Kichik", level: "N5" },

  // --- N4 (O'rta-Boshlang'ich) ---
  { id: 16, kanji: "家", kana: "いえ", romaji: "ie", uzbek: "Uy", level: "N4" },
  { id: 17, kanji: "族", kana: "ぞく", romaji: "zoku", uzbek: "Oila / Qabila", level: "N4" },
  { id: 18, kanji: "友", kana: "とも", romaji: "tomo", uzbek: "Do'st", level: "N4" },
  { id: 19, kanji: "話", kana: "はなす", romaji: "hanasu", uzbek: "Gapirmoq", level: "N4" },
  { id: 20, kanji: "読", kana: "よむ", romaji: "yomu", uzbek: "O'qimoq", level: "N4" },
  { id: 21, kanji: "書", kana: "かく", romaji: "kaku", uzbek: "Yozmoq", level: "N4" },
  { id: 22, kanji: "買", kana: "かう", romaji: "kau", uzbek: "Sotib olmoq", level: "N4" },

  // --- N3 (O'rta) ---
  { id: 23, kanji: "愛", kana: "あい", romaji: "ai", uzbek: "Sevgi", level: "N3" },
  { id: 24, kanji: "心", kana: "こころ", romaji: "kokoro", uzbek: "Yurak / Qalb", level: "N3" },
  { id: 25, kanji: "思", kana: "おもう", romaji: "omou", uzbek: "O'ylamoq", level: "N3" },
  { id: 26, kanji: "信", kana: "しんじる", romaji: "shinjiru", uzbek: "Ishonmoq", level: "N3" },
  { id: 27, kanji: "幸", kana: "しあわせ", romaji: "shiawase", uzbek: "Baxt", level: "N3" },
  
  // --- N2 (Oliy-O'rta) ---
  { id: 28, kanji: "夢", kana: "ゆめ", romaji: "yume", uzbek: "Orzu / Tush", level: "N2" },
  { id: 29, kanji: "希", kana: "まれ", romaji: "mare", uzbek: "Umid / Noyob", level: "N2" },
  { id: 30, kanji: "望", kana: "のぞむ", romaji: "nozomu", uzbek: "Umid qilmoq", level: "N2" },

  // --- N1 (Murakkab/Oliy) ---
  { id: 31, kanji: "憂鬱", kana: "ゆううつ", romaji: "yuuutsu", uzbek: "Tushkunlik", level: "N1" },
  { id: 32, kanji: "躊躇", kana: "ちゅうちょ", romaji: "chuucho", uzbek: "Ikkilanish", level: "N1" },
  { id: 33, kanji: "完璧", kana: "かんぺき", romaji: "kanpeki", uzbek: "Mukammal", level: "N1" },
  { id: 34, kanji: "挨拶", kana: "あいさつ", romaji: "aisatsu", uzbek: "Salomlashish", level: "N1" },
  { id: 35, kanji: "曖昧", kana: "あいまい", romaji: "aimai", uzbek: "Noaniq / Mavhum", level: "N1" }
];

// Asosiy sahifa (Kun so'zi vidjeti yoki boshqa joy uchun kerak bo'lib qolsa)
export const MOCK_WORD_OF_THE_DAY: Word = { 
  id: 99, 
  kanji: "頑張る", 
  kana: "がんばる", 
  romaji: "ganbaru", 
  uzbek: "Harakat qilmoq", 
  level: "N5"
};