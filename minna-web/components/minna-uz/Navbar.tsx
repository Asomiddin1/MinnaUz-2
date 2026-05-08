"use client";
import React from "react";
import Link from "next/link";

export default function Navbar() {
  // Bo'limlar ro'yxati
  const navLinks = [
    { name: "Maktab haqida", href: "#about" },
    { name: "Tariflar", href: "#pricing" },
    { name: "Aloqa", href: "#contact" },
    { name: "Natijalar", href: "#results" },
  ];

  return (
    <nav className="w-full fixed top-6 z-[100] flex justify-center px-4">
      <div className="max-w-6xl w-full bg-white/90 backdrop-blur-md h-20 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-between px-8 md:px-12">
        
        {/* Logo qismi */}
        <div className="flex items-center cursor-pointer group">
          <h2 className="text-[#042c60] text-2xl font-black tracking-tighter flex items-center gap-1">
            Minna.Uz
          </h2>
        </div>

        {/* Markaziy Linklar - Endi bo'limlar bilan */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[#042c60] font-bold text-[15px] hover:text-[#58cc02] transition-colors duration-300 relative group"
            >
              {link.name}
              {/* Pastki chiziq effekti */}
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-[#58cc02] transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* O'ng tarafdagi Tugma */}
        <Link href={'/dashboard'} className="hidden md:block">
          <button className="text-[#042c60]  text-[#1b4985] font-black text-sm uppercase py-3.5 px-8 rounded-full border-b-4 border-[#1223a3] active:border-b-0 active:translate-y-1 transition-all shadow-md">
            Boshlash
          </button>
        </Link>
      </div>
    </nav>
  );
}