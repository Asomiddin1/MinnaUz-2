'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { userAPI } from "@/lib/api/user"; // O'zingizning API'ni yoqamiz
import { Crown, Check, MonitorSmartphone } from "lucide-react";

type User = {
  id?: number;
  name?: string;
  email?: string;
  is_premium?: boolean;
  device_limit?: number;
};

const PremiumPage = () => {
  const { data: session, status } = useSession();
  
  const [user, setUser] = useState<User | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // 🚀 Premium holatini ishonchli o'qish
  const isPremium = user?.is_premium || (session?.user as any)?.is_premium || false;

  // =====================
  // 1. INSTANT LOAD & FETCH
  // =====================
  useEffect(() => {
    // 1. Kutib turmaslik uchun Session'dan ma'lumotni darhol ekranga chiqaramiz
    if (status === 'authenticated' && session?.user && !user) {
      setUser({
        name: session.user.name || '',
        email: session.user.email || '',
        is_premium: (session.user as any)?.is_premium || false,
      });
    }

    // 2. Orqa fonda Bazadan aniq device limit va yangilangan ma'lumotlarni tortamiz
    if (status === 'authenticated') {
      fetchUser();
    }
  }, [session, status]);

  const fetchUser = async () => {
    try {
      setIsFetching(true);
      const res = await userAPI.getProfile();
      const backendUser = res.data.user || res.data;
      setUser((prev) => ({ ...prev, ...backendUser }));
    } catch (err) {
      console.error("Profile yuklashda xatolik:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const plans = [
    {
      name: "Free Plan",
      price: "0$",
      limit: 2,
      desc: "Basic access for free users",
      features: ["2 devices", "Limited features", "Ads supported"],
      defaultBorder: "border-slate-200 dark:border-slate-700"
    },
    {
      name: "Premium",
      price: "2.99$",
      limit: 5,
      desc: "Best for students & power users",
      features: ["5 devices", "No ads", "Priority support", "Full test access"],
      defaultBorder: "border-yellow-400 dark:border-yellow-500/50"
    }
  ];

  // Agar umuman session kutilayotgan bo'lsa (faqat birinchi kirishda)
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Crown className="animate-spin w-8 h-8 text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 pb-12">

      {/* HEADER */}
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-slate-900 dark:text-white transition-colors">
          <Crown className="text-yellow-500" />
          Premium Plan
        </h1>

        <p className="text-slate-500 dark:text-slate-400 transition-colors">
          Upgrade your account for more devices & features
        </p>

        {/* STATUS BADGE */}
        <div className="pt-3">
          {isPremium ? (
            <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-500/10 px-5 py-2 rounded-full transition-colors border border-green-200 dark:border-green-500/20 shadow-sm">
              <Check className="w-4 h-4" /> You are Premium User
            </span>
          ) : (
            <span className="inline-flex text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-full transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
              Free Plan
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {plans.map((plan, i) => {
          // Joriy planni aniqlash
          const isCurrentPlan = 
            (plan.name === "Premium" && isPremium) || 
            (plan.name === "Free Plan" && !isPremium);

          return (
            <div
              key={i}
              className={`relative border-2 rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                isCurrentPlan 
                  ? "border-[#8B5CF6] dark:border-[#8B5CF6]/70 bg-purple-50/30 dark:bg-[#8B5CF6]/10 shadow-md ring-4 ring-[#8B5CF6]/10 dark:ring-[#8B5CF6]/5" 
                  : `${plan.defaultBorder} shadow-sm bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600 backdrop-blur-sm`
              }`}
            >
              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 -right-3 bg-[#8B5CF6] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Current
                </div>
              )}

              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                {plan.name === "Premium" && (
                  <Crown className="text-yellow-500 w-6 h-6" />
                )}
                {plan.name}
              </h2>

              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">{plan.desc}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                 <p className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</p>
                 {plan.name === "Premium" && <span className="text-slate-500 dark:text-slate-400 font-medium">/month</span>}
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                <MonitorSmartphone className="w-4 h-4" /> Devices: {plan.limit}
              </div>

              {/* FEATURES */}
              <ul className="mt-8 space-y-4">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                       <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* ACTION BUTTON */}
              <button
                className={`w-full mt-8 p-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isCurrentPlan
                    ? "bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 text-[#8B5CF6] cursor-not-allowed" 
                    : plan.name === "Premium"
                    ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-md hover:shadow-lg hover:-translate-y-0.5" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" 
                }`}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan 
                  ? "Current Plan" 
                  : plan.name === "Premium" 
                    ? "Upgrade to Premium" 
                    : "Downgrade to Free"}
              </button>

            </div>
          );
        })}
      </div>

      {/* FOOTER INFO */}
      <div className="text-center text-slate-500 dark:text-slate-400 text-sm md:text-base pt-4">
        Upgrade qilish orqali siz ko'proq device va feature olasiz 🚀
      </div>

    </div>
  );
};

export default PremiumPage;