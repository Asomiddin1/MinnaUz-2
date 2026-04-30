import WordGardenGame from "@/components/user-components/home-fuctions/soz-bogi";

export default function SozBogiPage() {
  return (
    // overflow-hidden qat'iy o'rnatildi
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden p-2 sm:p-4 bg-transparent flex items-center justify-center">
      <WordGardenGame />
    </div>
  );
}