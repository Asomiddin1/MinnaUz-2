'use client';

import { useEffect, useState } from "react";
// import { userAPI } from "@/lib/api"; // O'zingizning API yo'lingiz
import { Crown, Check } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  is_premium: boolean;
  device_limit: number;
};

// Fake API - testing uchun (O'zingiznikiga almashtirasiz)
const mockUserAPI = {
  getProfile: () => Promise.resolve({ data: { user: { id: 1, name: "Test", email: "test@test.com", is_premium: false, device_limit: 2 } } })
}

const PremiumPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // FETCH USER
  const fetchUser = async () => {
    try {
      setLoading(true);
      // const res = await userAPI.getProfile();
      const res = await mockUserAPI.getProfile(); // O'zingiznikini yoqing
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const plans = [
    {
      name: "Free Plan",
      price: "0$",
      limit: 2,
      desc: "Basic access for free users",
      features: ["2 devices", "Limited features", "Ads supported"],
      defaultBorder: "border-slate-200 dark:border-slate-700" // Dark mode border qo'shildi
    },
    {
      name: "Premium",
      price: "2.99$",
      limit: 5,
      desc: "Best for students & power users",
      features: ["5 devices", "No ads", "Priority support"],
      defaultBorder: "border-yellow-400 dark:border-yellow-500/50" // Dark mode border qo'shildi
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Crown className="animate-spin w-8 h-8 text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-slate-900 dark:text-white transition-colors">
          <Crown className="text-yellow-500" />
          Premium Plan
        </h1>

        <p className="text-slate-500 dark:text-slate-400 transition-colors">
          Upgrade your account for more devices & features
        </p>

        {/* STATUS */}
        <div className="pt-2">
          {user?.is_premium ? (
            <span className="text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-500/10 px-4 py-1.5 rounded-full transition-colors border border-green-200 dark:border-green-500/20">
              You are Premium User 💎
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full transition-colors border border-slate-200 dark:border-slate-700">
              Free Plan
            </span>
          )}
        </div>
      </div>

      {/* CURRENT LIMIT */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 shadow-sm backdrop-blur-sm transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Current Device Limit</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">📱 {user?.device_limit}</p>
        </div>

        <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 shadow-sm backdrop-blur-sm transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Account Type</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {user?.is_premium ? "💎 Premium" : "🆓 Free"}
          </p>
        </div>
      </div>

      {/* PLANS */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {plans.map((plan, i) => {
          // 1. Joriy planni aniqlash mantiqi
          const isCurrentPlan = 
            (plan.name === "Premium" && user?.is_premium) || 
            (plan.name === "Free Plan" && !user?.is_premium);

          return (
            <div
              key={i}
              className={`relative border-2 rounded-xl p-6 transition-all duration-300 ${
                isCurrentPlan 
                  ? "border-green-500 dark:border-green-500/70 bg-green-50/50 dark:bg-green-900/10 shadow-md ring-4 ring-green-500/10 dark:ring-green-500/5" 
                  : `${plan.defaultBorder} shadow-sm bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600 backdrop-blur-sm`
              }`}
            >
              {/* 2. Joriy plan uchun maxsus "Badge" */}
              {isCurrentPlan && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" /> Current
                </div>
              )}

              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                {plan.name === "Premium" && (
                  <Crown className="text-yellow-500 w-5 h-5" />
                )}
                {plan.name}
              </h2>

              <p className="text-slate-500 dark:text-slate-400 mt-1">{plan.desc}</p>
              <p className="text-3xl font-bold mt-4 text-slate-900 dark:text-white">{plan.price}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                📱 Devices: {plan.limit}
              </p>

              {/* FEATURES */}
              <ul className="mt-6 space-y-3">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* 3. BUTTON MANTIQI */}
              <button
                className={`w-full mt-6 p-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isCurrentPlan
                    ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 cursor-not-allowed" 
                    : plan.name === "Premium"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600 dark:hover:bg-yellow-500 shadow-sm hover:shadow" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" 
                }`}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan 
                  ? "Current Plan" 
                  : plan.name === "Premium" 
                    ? "Upgrade Now" 
                    : "Downgrade"}
              </button>

            </div>
          );
        })}
      </div>

      {/* INFO */}
      <div className="text-center text-slate-500 dark:text-slate-400 text-sm pb-8">
        Upgrade qilish orqali siz ko‘proq device va feature olasiz 🚀
      </div>

    </div>
  );
};

export default PremiumPage;