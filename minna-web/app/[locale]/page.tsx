import Navbar from "@/components/minna-uz/Navbar";
import Hero from "@/components/minna-uz/Hero";
import Herotap from "@/components/minna-uz/Herotap";
import LanguageStrip from "@/components/minna-uz/LanguageStrip";
import Features from "@/components/minna-uz/Features";
import SuperDuolingo from "@/components/minna-uz/SuperDuolingo";
import EnglishTest from "@/components/minna-uz/EnglishTest";
import DuolingoABC from "@/components/minna-uz/DuolingoABC";
import AppDownload from "@/components/minna-uz/AppDownload";
import Footer from "@/components/minna-uz/Footer";
import Mentors from "@/components/minna-uz/Mentors";

export const metadata = {
  title: "MinnaUz - JLPT | Yapon tili o'rganish platformasi",
  description:
    "MinnaUz orqali yapon tili va JLPT (N5-N2) imtihonlariga interaktiv testlar, lug'atlar va darslar bilan tayyorlaning.",
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans">
      <Navbar />
      <Hero />
      <LanguageStrip />
      <Features />

      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>

      <div id="pricing">
        <SuperDuolingo />
      </div>

      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>

      <div id="results">
        <EnglishTest />
      </div>

      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>
      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>

      <DuolingoABC />

      <div id="contact">
        <AppDownload />
      </div>

      <div id="mentors">
        <Mentors />
      </div>

      <div className="bg-white pb-20">
        <Herotap />
      </div>

      <Footer />
    </div>
  );
}
