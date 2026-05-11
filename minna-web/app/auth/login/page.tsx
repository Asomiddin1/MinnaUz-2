"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InteractiveLoginPage() {
  const router = useRouter();

  // --- UI Holatlari (States) ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // --- Mantiqiy Holatlar (States) ---
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Interaktiv UI Effectlari ---
  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const moveX = dimensions.width > 0 ? (mousePos.x / dimensions.width - 0.5) * 20 : 0;
  const moveY = dimensions.height > 0 ? (mousePos.y / dimensions.height - 0.5) * 20 : 0;

  // --- Mantiqiy Funksiyalar ---
  // 1. Google orqali kirish
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  // 2. Emailga OTP yuborish
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // 3. Kodni tasdiqlash
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: email,
      otp_code: otp,
    });

    if (res?.error) {
      setError("Kod xato yoki muddati o'tgan");
      setLoading(false);
    } else {
      const session = await getSession();
      
      // Rolga qarab yo'naltirish
      if ((session?.user as any)?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] p-4 font-sans text-slate-800 relative overflow-hidden">
      
      {/* Orqa fondagi bezak shakllar */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Orqaga qaytish tugmasi */}
      <Link href="/" className="absolute top-6 left-6 z-50 p-3 bg-white/50 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </Link>

      {/* Asosiy Oyna (Glassmorphism) */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex overflow-hidden max-w-5xl w-full min-h-[650px] relative z-10">
        
        {/* CHAP TOMON - Interaktiv Rasm qismi */}
        <div className="hidden md:flex w-1/2 relative items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            {/* Parallax Rasm Konteyneri */}
            
            
            <h2 className="mt-12 text-3xl font-extrabold text-center leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
              Find Your Tribe. <br/>
              <span className="text-blue-600">Build Your Network.</span>
            </h2>
          </div>
        </div>

        {/* O'NG TOMON - Login Formasi */}
        <div className="flex-1 p-10 sm:p-14 flex flex-col justify-center bg-white/40">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="text-left">
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
                {step === 1 ? "Tizimga kirish" : "Kodni tasdiqlash"}
              </h1>
              <p className="text-slate-500 text-lg">
                {step === 1 
                  ? "Xush kelibsiz! Ma'lumotlaringizni kiriting." 
                  : `${email} manziliga yuborilgan 6 xonali kodni kiriting`}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-2xl mb-4 text-center font-medium shadow-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form className="space-y-6" onSubmit={handleSendOtp}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">Elektron pochta</label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-5 py-4 bg-white/60 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? "Yuborilmoqda..." : "Kodni olish"}
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">yoki</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white border border-slate-200 py-4 rounded-2xl font-semibold text-slate-700 flex items-center justify-center gap-3 hover:bg-slate-50 hover:shadow-md transform active:scale-[0.98] transition-all disabled:opacity-70"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google orqali kirish
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleVerifyOtp}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="block text-sm font-semibold text-slate-700">Tasdiqlash kodi</label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Emailni o'zgartirish
                    </button>
                  </div>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                      placeholder="------"
                      className="w-full pl-12 pr-5 py-4 bg-white/60 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-center tracking-[0.5em] text-xl text-slate-800 placeholder:text-slate-400 shadow-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? "Tekshirilmoqda..." : "Tizimga kirish"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}