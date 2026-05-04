import WordGardenGame from "@/components/user-components/home-fuctions/sozbog-app/soz-bogi";

export default function SozBogiPage() {
  return (
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden p-2 sm:p-4 bg-transparent flex items-center justify-center">
      <WordGardenGame />
    </div>
  );
}