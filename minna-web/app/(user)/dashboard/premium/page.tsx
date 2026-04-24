'use client';

import { useEffect, useState } from "react";
import { userAPI } from "@/lib/api"; // O'zingizning API yo'lingiz
import { Crown, Check } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  is_premium: boolean;
  device_limit: number;
};

const PremiumPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // FETCH USER
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
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
      defaultBorder: "border-gray-300"
    },
    {
      name: "Premium",
      price: "2.99$",
      limit: 5,
      desc: "Best for students & power users",
      features: ["5 devices", "No ads", "Priority support"],
      defaultBorder: "border-yellow-400"
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
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Crown className="text-yellow-500" />
          Premium Plan
        </h1>

        <p className="text-gray-500">
          Upgrade your account for more devices & features
        </p>

        {/* STATUS */}
        <div>
          {user?.is_premium ? (
            <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
              You are Premium User 💎
            </span>
          ) : (
            <span className="text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
              Free Plan
            </span>
          )}
        </div>
      </div>

      {/* CURRENT LIMIT */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 border rounded-xl bg-white shadow-sm">
          <p className="text-gray-500 text-sm">Current Device Limit</p>
          <p className="text-2xl font-bold">📱 {user?.device_limit}</p>
        </div>

        <div className="p-5 border rounded-xl bg-white shadow-sm">
          <p className="text-gray-500 text-sm">Account Type</p>
          <p className="text-2xl font-bold">
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
              className={`relative border-2 rounded-xl p-6 transition-all ${
                isCurrentPlan 
                  ? "border-green-500 bg-green-50/30 shadow-md ring-4 ring-green-500/10" 
                  : `${plan.defaultBorder} shadow-sm bg-white`
              }`}
            >
              {/* 2. Joriy plan uchun maxsus "Badge" */}
              {isCurrentPlan && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" /> Current
                </div>
              )}

              <h2 className="text-xl font-bold flex items-center gap-2">
                {plan.name === "Premium" && (
                  <Crown className="text-yellow-500 w-5 h-5" />
                )}
                {plan.name}
              </h2>

              <p className="text-gray-500">{plan.desc}</p>
              <p className="text-3xl font-bold mt-3">{plan.price}</p>
              <p className="text-sm text-gray-500 mt-1">
                📱 Devices: {plan.limit}
              </p>

              {/* FEATURES */}
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* 3. BUTTON MANTIQI */}
              <button
                className={`w-full mt-5 p-2 rounded-lg font-medium transition-all ${
                  isCurrentPlan
                    ? "bg-green-100 text-green-700 cursor-not-allowed" // Agar foydalanuvchining o'z plani bo'lsa
                    : plan.name === "Premium"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm" // Agar Premiumga o'tish kerak bo'lsa
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200" // Agar Premium bo'lib turib Free ni ko'rayotgan bo'lsa
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
      <div className="text-center text-gray-500 text-sm">
        Upgrade qilish orqali siz ko‘proq device va feature olasiz 🚀
      </div>

    </div>
  );
};

export default PremiumPage;