"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { userAPI } from "@/lib/api/user"
import Image from "next/image"
import {
  Crown,
  RefreshCcw,
  Camera,
  User as UserIcon,
  Coins,
  Flame,
  Smartphone,
  ChevronRight,
  History,
  CheckCircle2,
  XCircle,
  Monitor,
  LogOut,
  Laptop,
} from "lucide-react"
import { useTranslations } from "next-intl"

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

interface Device {
  id: number
  name: string
  last_used_at: string | null
  created_at: string
  is_current: boolean
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<ExamResultSummary[]>([])
  const [devices, setDevices] = useState<Device[]>([])

  const [isFetching, setIsFetching] = useState(false)
  const [isFetchingResults, setIsFetchingResults] = useState(false)
  const [isDevicesLoading, setIsDevicesLoading] = useState(false)

  const t = useTranslations("Profile")

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
      fetchDevices()
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

  const fetchDevices = async () => {
    try {
      setIsDevicesLoading(true)
      const res = await userAPI.getDevices()
      setDevices(res.data.data || [])
    } catch (err) {
      console.error("Qurilmalarni olishda xatolik:", err)
    } finally {
      setIsDevicesLoading(false)
    }
  }

  const handleLogoutDevice = async (tokenId: number) => {
    if (!confirm(t("confirmLogoutDevice"))) return
    try {
      await userAPI.logoutDevice(tokenId)
      setDevices(devices.filter((d) => d.id !== tokenId))
    } catch (err) {
      console.error("Qurilmadan chiqishda xatolik:", err)
    }
  }

  const handleLogoutOthers = async () => {
    if (!confirm(t("confirmLogoutOthers"))) return
    try {
      await userAPI.logoutOtherDevices()
      setDevices(devices.filter((d) => d.is_current))
    } catch (err) {
      console.error("Boshqa qurilmalardan chiqishda xatolik:", err)
    }
  }

  const timeAgo = (dateString: string | null) => {
    if (!dateString) return t("unknownDevice")
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return t("justNow")
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} ${t("minutesAgo")}`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ${t("hoursAgo")}`
    return date.toLocaleDateString()
  }

  const formatDeviceName = (ua: string) => {
    if (!ua) return t("unknownDevice")
    const lowerUA = ua.toLowerCase()

    if (
      lowerUA.includes("axios") ||
      lowerUA.includes("node") ||
      lowerUA.includes("guzzle") ||
      lowerUA.includes("postman")
    ) {
      return t("systemDevice")
    }

    let os = t("unknownOS")
    let browser = t("unknownBrowser")

    if (ua.includes("Windows")) os = "Windows"
    else if (ua.includes("Mac OS") || ua.includes("Macintosh")) os = "macOS"
    else if (ua.includes("iPhone")) os = "iPhone"
    else if (ua.includes("iPad")) os = "iPad"
    else if (ua.includes("Android")) os = "Android"
    else if (ua.includes("Linux")) os = "Linux"

    if (ua.includes("Edg")) browser = "Edge"
    else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera"
    else if (ua.includes("Chrome")) browser = "Chrome"
    else if (ua.includes("Firefox")) browser = "Firefox"
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"

    return `${os} • ${browser}`
  }

  const getDeviceIcon = (ua: string) => {
    const n = ua.toLowerCase()
    if (n.includes("iphone") || n.includes("android") || n.includes("ipad"))
      return <Smartphone className="h-5 w-5" />
    if (n.includes("mac") || n.includes("windows") || n.includes("linux"))
      return <Laptop className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  // Umumiy tizimdan chiqish funksiyasi
  const handleMainLogout = async () => {
    await signOut({ callbackUrl: "/" }) // Chiqqandan keyin asosiy sahifaga yo'naltirish
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
        {t("notFound")}
      </div>
    )
  }

  const isPremium = user.is_premium || (session?.user as any)?.is_premium

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 font-sans text-slate-900 transition-colors duration-200 md:p-6 lg:p-8 dark:text-slate-100">
      {/* ===================== */}
      {/* 1. HEADER KARTA       */}
      {/* ===================== */}
      <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-colors md:flex-row md:items-center md:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="z-10 flex w-full items-center gap-6 md:w-auto">
          {/* AVATAR */}
          <div className="relative shrink-0">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt="avatar"
                width={96}
                height={96}
                className="h-24 w-24 rounded-2xl bg-slate-100 object-cover dark:bg-slate-800"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-4xl font-bold text-slate-400 dark:bg-slate-800">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button className="absolute -right-2 -bottom-2 rounded-full border border-slate-100 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          {/* INFO */}
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              {user.name}
              {isPremium && (
                <Crown className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              )}
            </h1>
            <p className="mt-1 mb-3 text-sm text-slate-500 md:text-base dark:text-slate-400">
              {user.email}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors dark:bg-slate-800/50 dark:text-slate-300">
              <UserIcon className="h-3.5 w-3.5" /> {t("role")}:{" "}
              {user.role || "User"}
            </div>
          </div>
        </div>

        {/* HEADER TUGMALARI (Yangilash va Chiqish) */}
        <div className="z-10 flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <button
            onClick={fetchUser}
            disabled={isFetching}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 md:w-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/50"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {t("refreshProfile")}
          </button>

          {/* MAIN LOGOUT TUGMASI */}
          <button
            onClick={handleMainLogout}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 md:w-auto dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* 2. STATISTIKA GRIDI   */}
      {/* ===================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Coins */}
        <div className="flex flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.coins !== undefined ? (
                user.coins
              ) : (
                <span className="animate-pulse">...</span>
              )}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("coins")}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.streak !== undefined ? (
                user.streak
              ) : (
                <span className="animate-pulse">...</span>
              )}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("streak")}
            </p>
          </div>
        </div>

        {/* Devices Limit */}
        <div className="flex flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.device_limit || (isPremium ? 5 : 2)}
              <span className="text-base text-slate-400">
                {" "}
                / {isPremium ? 5 : 2}
              </span>
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("devices")}
            </p>
          </div>
        </div>

        {/* Current Plan */}
        <div className="flex flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-start">
            <div
              className={`rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider ${isPremium ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}
            >
              {isPremium ? t("premium") : t("free")}
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {isPremium ? t("activePlan") : t("basicPlan")}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("plan")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ===================== */}
        {/* 3. TEST NATIJALARI TARIXI */}
        {/* ===================== */}
        <div className="flex flex-col rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-colors md:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <History className="h-5 w-5 text-slate-400" />
              {t("history")}
            </h2>
            <button
              onClick={fetchResults}
              disabled={isFetchingResults}
              className="text-sm text-slate-500 hover:text-slate-900 disabled:opacity-50 dark:hover:text-white"
            >
              {isFetchingResults ? t("refreshing") : t("refresh")}
            </button>
          </div>

          {results.length === 0 && !isFetchingResults ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500">
              <History className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">{t("noHistory")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-800/20 dark:hover:bg-slate-800/50"
                  onClick={() =>
                    (window.location.href = `/dashboard/jlpt/${result.test_id}/result/${result.id}`)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${result.passed ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}
                    >
                      {result.passed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {result.test_title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {result.level}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(result.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${result.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {result.score}%
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===================== */}
        {/* 4. QURILMALAR (DEVICE MANAGER) */}
        {/* ===================== */}
        <div className="flex flex-col rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-colors md:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Monitor className="h-5 w-5 text-slate-400" />
              {t("devicesTitle")}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {devices.length} / {user.device_limit || (isPremium ? 5 : 2)}{" "}
                {t("deviceLimit").replace("ta qurilma limiti", "")}
              </span>
              <button
                onClick={fetchDevices}
                disabled={isDevicesLoading}
                className="text-slate-400 hover:text-[#8B5CF6] disabled:opacity-50"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${isDevicesLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {isDevicesLoading && devices.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <RefreshCcw className="h-6 w-6 animate-spin text-[#8B5CF6]" />
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    device.is_current
                      ? "border-[#8B5CF6]/20 bg-[#8B5CF6]/5 dark:border-[#8B5CF6]/20 dark:bg-[#8B5CF6]/10"
                      : "border-slate-100 bg-white dark:border-slate-800/60 dark:bg-slate-800/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        device.is_current
                          ? "bg-white text-[#8B5CF6] shadow-sm dark:bg-[#8B5CF6]/20"
                          : "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {getDeviceIcon(device.name || "")}
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDeviceName(device.name)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {device.is_current
                          ? t("currentSession")
                          : `${t("lastActivity")} ${timeAgo(device.last_used_at)}`}
                      </p>
                    </div>
                  </div>

                  {device.is_current ? (
                    <span className="rounded-md bg-[#8B5CF6]/10 px-2.5 py-1 text-xs font-medium text-[#8B5CF6] dark:bg-[#8B5CF6]/20">
                      {t("active")}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleLogoutDevice(device.id)}
                      className="flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      title={t("logout")}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {devices.length > 1 && (
                <div className="mt-4 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t("logoutOthersDesc")}
                  </p>
                  <button
                    onClick={handleLogoutOthers}
                    className="mt-3 w-full rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                  >
                    {t("logoutOthersBtn")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
