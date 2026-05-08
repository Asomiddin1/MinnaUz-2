"use client";

import Navbar from '../components/minna-uz/Navbar';
import Hero from '../components/minna-uz/Hero';
import Herotap from '../components/minna-uz/Herotap';
import LanguageStrip from '../components/minna-uz/LanguageStrip';
import Features from '../components/minna-uz/Features';
import SuperDuolingo from '../components/minna-uz/SuperDuolingo';
import EnglishTest from '../components/minna-uz/EnglishTest';
import ForSchools from '../components/minna-uz/ForSchools';
import DuolingoABC from '../components/minna-uz/DuolingoABC';
import AppDownload from '../components/minna-uz/AppDownload';
import Footer from '../components/minna-uz/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden pt-16">
      
      {/* 1. Yuqori menyu */}
      <Navbar />

      {/* 2. Asosiy kirish */}
      <Hero />

      {/* 3. Tillar qatori */}
      <LanguageStrip />

      {/* 4. Saytning afzalliklari */}
      <Features />
      
      <div className="w-full border-t-2 border-gray-100 max-w-5xl mx-auto"></div>
      
      {/* 5. Super Duolingo - "Tariflar" uchun id: pricing */}
      <div id="pricing">
        <SuperDuolingo />
      </div>

      <div className="w-full border-t-2 border-gray-100 max-w-5xl mx-auto"></div>

      {/* 6. English Test - "Natijalar" uchun id: results */}
      <div id="results">
        <EnglishTest />
      </div>

      <div className="w-full border-t-2 border-gray-100 max-w-5xl mx-auto"></div>

      {/* 7. Maktablar uchun - "Maktab haqida" uchun id: about */}
      <div id="about">
        <ForSchools />
      </div>

      <div className="w-full border-t-2 border-gray-100 max-w-5xl mx-auto"></div>

      {/* 8. Duolingo ABC */}
      <DuolingoABC />

      {/* 9. Ilovalarni yuklash - "Aloqa" yoki App qismi uchun id: contact */}
      <div id="contact">
        <AppDownload />
      </div>

      {/* 10. Footer dan oldingi Hero qismi */}
      <div className="pb-20 bg-white">
          <Herotap />
      </div>

      {/* 11. Yashil Footer */}
      <Footer />

    </div>
  );
}