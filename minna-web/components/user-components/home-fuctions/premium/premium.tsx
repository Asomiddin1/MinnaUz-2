"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { userAPI } from "@/lib/api/user"
import { Crown, Check, MonitorSmartphone } from "lucide-react"


type User = {
  id?: number
  name?: string
  email?: string
  is_premium?: boolean
  device_limit?: number
}

const plans = [
  {
    name: "Free Plan",
    price: "0$",
    limit: 2,
    desc: "Basic access for free users",
    features: ["2 devices", "Limited features", "Ads supported"],
    defaultBorder: "border-slate-200 dark:border-slate-700",
  },
  {
    name: "Premium",
    price: "2.99$",
    limit: 5,
    desc: "Best for students & power users",
    features: ["5 devices", "No ads", "Priority support", "Full test access"],
    defaultBorder: "border-yellow-400 dark:border-yellow-500/50",
  },
]

export default function PremiumPlans() {
  const { data: session, status } = useSession()

  const [user, setUser] = useState<User | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const isPremium =
    user?.is_premium || (session?.user as any)?.is_premium || false

  useEffect(() => {
    if (status === "authenticated" && session?.user && !user) {
      setUser({
        name: session.user.name || "",
        email: session.user.email || "",
        is_premium: (session.user as any)?.is_premium || false,
      })
    }
    if (status === "authenticated") {
      fetchUser()
    }
  }, [session, status])

  const fetchUser = async () => {
    try {
      setIsFetching(true)
      const res = await userAPI.getProfile()
      const backendUser = res.data.user || res.data
      setUser((prev) => ({ ...prev, ...backendUser }))
    } catch (err) {
      console.error("Profile yuklashda xatolik:", err)
    } finally {
      setIsFetching(false)
    }
  }

  // Agar session kutilayotgan bo'lsa (faqat birinchi kirishda)
  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Crown className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 pb-12 md:p-6">
      {/* HEADER */}
      <div className="mt-4 space-y-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-900 transition-colors dark:text-white">
          <Crown className="text-yellow-500" />
          Premium Plan
        </h1>

        <p className="text-slate-500 transition-colors dark:text-slate-400">
          Upgrade your account for more devices & features
        </p>

        {/* STATUS BADGE */}
        <div className="pt-3">
          {isPremium ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-5 py-2 font-semibold text-green-600 shadow-sm transition-colors dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
              <Check className="h-4 w-4" /> You are Premium User
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-5 py-2 font-medium text-slate-600 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Free Plan
            </span>
          )}
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {plans.map((plan, i) => {
          // Joriy planni aniqlash
          const isCurrentPlan =
            (plan.name === "Premium" && isPremium) ||
            (plan.name === "Free Plan" && !isPremium)

          return (
            <div
              key={i}
              className={`relative rounded-2xl border-2 p-6 transition-all duration-300 md:p-8 ${
                isCurrentPlan
                  ? "border-[#8B5CF6] bg-purple-50/30 shadow-md ring-4 ring-[#8B5CF6]/10 dark:border-[#8B5CF6]/70 dark:bg-[#8B5CF6]/10 dark:ring-[#8B5CF6]/5"
                  : `${plan.defaultBorder} bg-white shadow-sm backdrop-blur-sm hover:border-slate-300 dark:bg-slate-900/40 dark:hover:border-slate-600`
              }`}
            >
              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full bg-[#8B5CF6] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                  <Check className="h-3.5 w-3.5" /> Current
                </div>
              )}

              <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                {plan.name === "Premium" && (
                  <Crown className="h-6 w-6 text-yellow-500" />
                )}
                {plan.name}
              </h2>

              <p className="mt-2 text-sm text-slate-500 md:text-base dark:text-slate-400">
                {plan.desc}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <p className="text-4xl font-bold text-slate-900 dark:text-white">
                  {plan.price}
                </p>
                {plan.name === "Premium" && (
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    /month
                  </span>
                )}
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <MonitorSmartphone className="h-4 w-4" /> Devices: {plan.limit}
              </div>

              {/* FEATURES */}
              <ul className="mt-8 space-y-4">
                {plan.features.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* ACTION BUTTON */}
              <button
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl p-3.5 font-bold transition-all duration-200 ${
                  isCurrentPlan
                    ? "cursor-not-allowed bg-[#8B5CF6]/10 text-[#8B5CF6] dark:bg-[#8B5CF6]/20"
                    : plan.name === "Premium"
                      ? "bg-[#8B5CF6] text-white shadow-md hover:-translate-y-0.5 hover:bg-[#7C3AED] hover:shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
          )
        })}
      </div>

      {/* FOOTER INFO */}
      <div className="pt-4 text-center text-sm text-slate-500 md:text-base dark:text-slate-400">
        Upgrade qilish orqali siz ko'proq device va feature olasiz 🚀
      </div>
    </div>
  )
}
