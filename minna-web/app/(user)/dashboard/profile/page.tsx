"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { userAPI } from "@/lib/api/user"
import Image from "next/image"
import {
  Crown,
  RefreshCcw,
  Camera,
  BadgeCheck,
  User as UserIcon,
  Coins,
  Flame,
  Smartphone,
  ChevronRight,
  History,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface User {
  id?: number
  name?: string
  email?: string
  avatar?: string
  image?: string
  role?: string
  coins?: number
  streak?: number
  is_premium?: boolean
  device_limit?: number
}

interface ExamResultSummary {
  id: number
  test_id: number
  test_title: string
  level: string
  score: number
  passed: boolean
  created_at: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<ExamResultSummary[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isFetchingResults, setIsFetchingResults] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (!user) {
        setUser({
          name: session.user?.name || "",
          email: session.user?.email || "",
          avatar: session.user?.image || "",
          role: (session.user as any)?.role || "user",
          is_premium: (session.user as any)?.is_premium || false,
        })
      }
      fetchUser()
      fetchResults()
    }
  }, [session, status])

  const fetchUser = async () => {
    try {
      setIsFetching(true)
      const response = await userAPI.getProfile()
      const backendUser = response.data.user || response.data
      setUser((prev) => ({ ...prev, ...backendUser }))
    } catch (err: any) {
      console.error(err)
      if (err?.response?.status === 401) signOut()
    } finally {
      setIsFetching(false)
    }
  }

  const fetchResults = async () => {
    try {
      setIsFetchingResults(true)
      const res = await userAPI.getMyResults()
      setResults(res.data || res.data?.data || [])
    } catch (err) {
      console.error("Natijalarni olishda xatolik:", err)
    } finally {
      setIsFetchingResults(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin text-[#8B5CF6]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mt-10 text-center text-slate-500 dark:text-slate-400">
        Foydalanuvchi topilmadi. Tizimga qayta kiring.
      </div>
    )
  }

  const isPremium = user.is_premium || (session?.user as any)?.is_premium

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 font-sans text-slate-900 transition-colors duration-200 md:p-6 lg:p-8 dark:text-slate-100">
      {/* ===================== */}
      {/* 1. HEADER KARTA       */}
      {/* ===================== */}
      <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[28px] border border-slate-50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors md:flex-row md:items-center md:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="pointer-events-none absolute -top-24 -right-10 h-96 w-96 rounded-full bg-purple-50/50 blur-3xl dark:bg-purple-900/10"></div>
        <div className="z-10 flex w-full items-center gap-6 md:w-auto">
          {/* AVATAR */}
          <div className="relative shrink-0">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt="avatar"
                width={96}
                height={96}
                className="h-24 w-24 rounded-[24px] bg-[#1A1D27] object-cover dark:bg-slate-800"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-[#1A1D27] text-4xl font-bold text-white shadow-sm dark:bg-slate-800">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button className="absolute -right-2 -bottom-2 rounded-full border border-transparent bg-white p-2 text-[#8B5CF6] shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none dark:hover:bg-slate-700">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          {/* INFO */}
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              {user.name}
              {isPremium ? (
                <Crown className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              ) : (
                " "
              )}
            </h1>
            <p className="mt-1 mb-3 text-sm text-slate-500 md:text-base dark:text-slate-400">
              {user.email}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors dark:bg-slate-800 dark:text-slate-300">
              <UserIcon className="h-3.5 w-3.5" /> Role: {user.role || "User"}
            </div>
          </div>
        </div>
        <button
          onClick={fetchUser}
          disabled={isFetching}
          className="z-10 flex w-full shrink-0 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 md:w-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700/50"
        >
          <RefreshCcw
            className={`h-4 w-4 text-[#8B5CF6] ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh Profile
        </button>
      </div>

      {/* ===================== */}
      {/* 2. STATISTIKA GRIDI   */}
      {/* ===================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {/* Coins */}
        <div className="relative flex min-h-[140px] flex-col justify-between rounded-[24px] border border-slate-50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-yellow-500 dark:bg-yellow-500/10">
            <Coins className="h-5 w-5 fill-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.coins !== undefined ? (
                user.coins
              ) : (
                <span className="animate-pulse">...</span>
              )}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
              Minna Coins
            </p>
          </div>
        </div>
        {/* Streak */}
        <div className="relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[24px] border border-slate-50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="absolute top-6 right-6 flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div className="relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/10">
            <Flame className="h-5 w-5 fill-orange-500" />
            <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl dark:bg-orange-500/20"></div>
          </div>
          <div className="z-10">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.streak !== undefined ? (
                user.streak
              ) : (
                <span className="animate-pulse">...</span>
              )}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
              Day Streak
            </p>
          </div>
        </div>
        {/* Devices */}
        <div className="flex min-h-[140px] flex-col justify-between rounded-[24px] border border-slate-50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.device_limit || (isPremium ? 5 : 2)}
              <span className="text-lg text-slate-300 dark:text-slate-600">
                {" "}
                / {isPremium ? 5 : 2}
              </span>
            </p>
            <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
              Active Devices
            </p>
          </div>
        </div>
        {/* Current Plan */}
        <div className="flex min-h-[140px] flex-col items-center justify-center rounded-[24px] border border-slate-50 bg-white p-6 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div
            className={`mb-3 rounded-full border px-5 py-2 text-sm font-bold tracking-wide ${isPremium ? "border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {isPremium ? "PREMIUM" : "FREE"}
          </div>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            Current Plan
          </p>
        </div>
      </div>

      {/* ===================== */}
      {/* 3. TEST NATIJALARI TARIXI */}
      {/* ===================== */}
      <div className="rounded-[28px] border border-slate-50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors md:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <History className="h-5 w-5 text-[#8B5CF6]" />
            O‘tgan test natijalari
          </h2>
          <button
            onClick={fetchResults}
            disabled={isFetchingResults}
            className="text-sm text-[#8B5CF6] hover:underline disabled:opacity-50"
          >
            {isFetchingResults ? "Yuklanmoqda..." : "Yangilash"}
          </button>
        </div>

        {results.length === 0 && !isFetchingResults ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500">
            <History className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>Hali birorta test ishlanmagan.</p>
            <a
              href="/dashboard/jlpt"
              className="mt-2 inline-block text-sm text-[#8B5CF6] hover:underline"
            >
              Testlarni ko‘rish
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                onClick={() =>
                  (window.location.href = `/dashboard/jlpt/${result.test_id}/result/${result.id}`)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${result.passed ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="line-clamp-1 font-semibold text-slate-800 dark:text-slate-200">
                      {result.test_title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 dark:bg-slate-700">
                        {result.level}
                      </span>
                      <span>
                        {new Date(result.created_at).toLocaleDateString(
                          "uz-UZ"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-bold ${result.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {result.score}%
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== */}
      {/* 4. PREMIUM STATUS BANNER */}
      {/* ===================== */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-50 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-colors md:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent dark:via-purple-900/10"></div>
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Crown className="h-6 w-6 text-[#8B5CF6]" /> Premium Status
            </h2>
            <p className="text-sm font-medium text-slate-500 md:text-base dark:text-slate-400">
              {isPremium
                ? "You are currently enjoying Premium features!"
                : "Upgrade to Premium to get more devices and features!"}
            </p>
          </div>
          {!isPremium && (
            <button className="w-full shrink-0 rounded-2xl bg-[#8B5CF6] px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7C3AED] md:w-auto">
              Upgrade Now
            </button>
          )}
        </div>
        <div className="relative z-10 mt-8">
          <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Free</span>
            <span className={isPremium ? "font-bold text-[#8B5CF6]" : ""}>
              Premium
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-[#A2B1D3] transition-all duration-1000 dark:bg-[#6c7b9e]"
              style={{ width: isPremium ? "100%" : "25%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
