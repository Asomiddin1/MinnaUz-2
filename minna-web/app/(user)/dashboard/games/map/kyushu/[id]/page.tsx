"use client";
import { useParams } from "next/navigation";
import KanjiDash from "@/components/user-components/home-fuctions/games/japan-map-rpg/games/KanjiDash";
import WordMatch from "@/components/user-components/home-fuctions/games/japan-map-rpg/games/WordMatch";
import KanjiRain from "@/components/user-components/home-fuctions/games/japan-map-rpg/games/KanjiRain";
import BossBattle from "@/components/user-components/home-fuctions/games/japan-map-rpg/games/BossBattle";

export default function KyushuGamePage() {
  const params = useParams();
  const stageId = Number(params?.id);

  if (!stageId) return <div className="text-white">Yuklanmoqda...</div>;

  switch (stageId) {
    case 1:
    case 2:
      return <KanjiDash stageId={stageId} />;
    case 3:
    case 5:
      return <WordMatch stageId={stageId} />;
    case 4:
    case 6:
      return <KanjiRain stageId={stageId} />;
    case 7:
      return <BossBattle stageId={stageId} />;
    default:
      return <KanjiDash stageId={stageId} />;
  }
}