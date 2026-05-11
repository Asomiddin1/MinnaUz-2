// components/user-components/japan-map-rpg/data.ts

export type GameType = "kanji-dash" | "word-match" | "boss-battle";

export interface Stage {
  id: number;
  title: string;
  type: GameType;
  targetScore: number;
  route: string;
}

export interface Region {
  id: string;
  name: string;
  japaneseName: string;
  description: string;
  stages: Stage[];
}

// 1. YAPONIYA XARITASI BAZASI
export const JAPAN_REGIONS: Region[] = [
  {
    id: "kyushu",
    name: "Kyushu",
    japaneseName: "九州",
    description: "Kyushu orolining 7 ta viloyatini zabt eting va Shikoku darvozasini oching!",
    stages: [
      { id: 1, title: "Fukuoka: Kanji Start", type: "kanji-dash", targetScore: 50, route: "/dashboard/games/map/kyushu/1" },
      { id: 2, title: "Saga: Tezkor Kanji", type: "kanji-dash", targetScore: 60, route: "/dashboard/games/map/kyushu/2" },
      { id: 3, title: "Nagasaki: So'z o'yini", type: "word-match", targetScore: 70, route: "/dashboard/games/map/kyushu/3" },
      { id: 4, title: "Kumamoto: Kanji Usta", type: "kanji-dash", targetScore: 80, route: "/dashboard/games/map/kyushu/4" },
      { id: 5, title: "Oita: Issiq Buloqlar", type: "word-match", targetScore: 90, route: "/dashboard/games/map/kyushu/5" },
      { id: 6, title: "Miyazaki: Quyosh Yoli", type: "kanji-dash", targetScore: 100, route: "/dashboard/games/map/kyushu/6" },
      { id: 7, title: "Kagoshima: Orol Bossi", type: "boss-battle", targetScore: 150, route: "/dashboard/games/map/kyushu/7" }
    ]
  },
  {
    id: "shikoku",
    name: "Shikoku",
    japaneseName: "四国",
    description: "Kyushu qahramoni xush kelibsiz! Sarguzasht davom etadi.",
    stages: [
      { id: 8, title: "Ehime: Kirish", type: "kanji-dash", targetScore: 100, route: "/dashboard/games/map/shikoku/8" },
      { id: 9, title: "Kochi: To'lqinlar", type: "word-match", targetScore: 120, route: "/dashboard/games/map/shikoku/9" }
    ]
  },
  {
    id: "honshu",
    name: "Honshu",
    japaneseName: "本州",
    description: "Yaponiyaning yuragi. Tokyo va Kyoto sizni kutmoqda.",
    stages: [
      { id: 10, title: "Osaka: Ko'cha O'yinlari", type: "kanji-dash", targetScore: 200, route: "/dashboard/games/map/honshu/10" }
    ]
  },
  {
    id: "hokkaido",
    name: "Hokkaido",
    japaneseName: "北海道",
    description: "Muzlagan cho'qqilar. Faqat eng kuchlilar uchun.",
    stages: [
      { id: 11, title: "Sapporo: Muzlik", type: "boss-battle", targetScore: 300, route: "/dashboard/games/map/hokkaido/11" }
    ]
  }
];

// 2. PROGRESSNI BOSHQARISH FUNKSIYASI
export function unlockNextStage(currentStageId: number) {
  if (typeof window === "undefined") return;

  const savedProgress = localStorage.getItem("questProgress");
  let progressData = savedProgress 
    ? JSON.parse(savedProgress) 
    : { regions: ["kyushu"], stage: 1 };

  // Agar foydalanuvchi hozirgi ochilgan eng yuqori bosqichni yutgan bo'lsa
  if (progressData.stage <= currentStageId) {
    const nextStageId = currentStageId + 1;
    progressData.stage = nextStageId;

    // Yangi ochilgan bosqich qaysi viloyatga tegishli ekanini tekshiramiz
    for (const region of JAPAN_REGIONS) {
      const stageExistsInRegion = region.stages.some(s => s.id === nextStageId);
      
      // Agar yangi bosqich yangi viloyatda bo'lsa va u hali yopiq bo'lsa, viloyatni ochamiz
      if (stageExistsInRegion && !progressData.regions.includes(region.id)) {
        progressData.regions.push(region.id);
      }
    }

    localStorage.setItem("questProgress", JSON.stringify(progressData));
  }
}