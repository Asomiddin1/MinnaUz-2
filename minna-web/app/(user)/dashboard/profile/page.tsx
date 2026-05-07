'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { userAPI } from '@/lib/api/user';
import Image from 'next/image';
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
} from 'lucide-react';

interface User {
  id?: number;
  name?: string;
  email?: string;
  avatar?: string;
  image?: string;
  role?: string;
  coins?: number;
  streak?: number;
  is_premium?: boolean;
  device_limit?: number;
}

interface ExamResultSummary {
  id: number;
  test_id: number;
  test_title: string;
  level: string;
  score: number;
  passed: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<ExamResultSummary[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingResults, setIsFetchingResults] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      if (!user) {
        setUser({
          name: session.user?.name || '',
          email: session.user?.email || '',
          avatar: session.user?.image || '',
          role: (session.user as any)?.role || 'user',
          is_premium: (session.user as any)?.is_premium || false,
        });
      }
      fetchUser();
      fetchResults();
    }
  }, [session, status]);

  const fetchUser = async () => {
    try {
      setIsFetching(true);
      const response = await userAPI.getProfile();
      const backendUser = response.data.user || response.data;
      setUser((prev) => ({ ...prev, ...backendUser }));
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) signOut();
    } finally {
      setIsFetching(false);
    }
  };

  const fetchResults = async () => {
    try {
      setIsFetchingResults(true);
      const res = await userAPI.getMyResults();
      setResults(res.data || res.data?.data || []);
    } catch (err) {
      console.error('Natijalarni olishda xatolik:', err);
    } finally {
      setIsFetchingResults(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCcw className="animate-spin text-[#8B5CF6] w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-10 text-slate-500 dark:text-slate-400">
        Foydalanuvchi topilmadi. Tizimga qayta kiring.
      </div>
    );
  }

  const isPremium = user.is_premium || (session?.user as any)?.is_premium;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ===================== */}
      {/* 1. HEADER KARTA       */}
      {/* ===================== */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden border border-slate-50 dark:border-slate-800 transition-colors">
        <div className="absolute -top-24 -right-10 w-96 h-96 bg-purple-50/50 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
          {/* AVATAR */}
          <div className="relative shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt="avatar" width={96} height={96} className="rounded-[24px] object-cover bg-[#1A1D27] dark:bg-slate-800 w-24 h-24" />
            ) : (
              <div className="w-24 h-24 bg-[#1A1D27] dark:bg-slate-800 text-white rounded-[24px] flex items-center justify-center text-4xl font-bold shadow-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-none border border-transparent dark:border-slate-700 text-[#8B5CF6] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          {/* INFO */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              {user.name}
              {isPremium ? <Crown className="text-yellow-500 w-6 h-6 fill-yellow-500" /> : <BadgeCheck className="text-blue-500 w-6 h-6 fill-blue-500 text-white dark:text-slate-900" />}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1 mb-3">{user.email}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
              <UserIcon className="w-3.5 h-3.5" /> Role: {user.role || 'User'}
            </div>
          </div>
        </div>
        <button onClick={fetchUser} disabled={isFetching} className="w-full md:w-auto shrink-0 z-10 flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-[14px] shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all font-medium text-slate-700 dark:text-slate-200 text-sm disabled:opacity-50">
          <RefreshCcw className={`w-4 h-4 text-[#8B5CF6] ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Profile
        </button>
      </div>

      {/* ===================== */}
      {/* 2. STATISTIKA GRIDI   */}
      {/* ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Coins */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-50 dark:border-slate-800 flex flex-col justify-between min-h-[140px] transition-colors relative">
          <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4">
            <Coins className="w-5 h-5 fill-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.coins !== undefined ? user.coins : <span className="animate-pulse">...</span>}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">Minna Coins</p>
          </div>
        </div>
        {/* Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-50 dark:border-slate-800 flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-colors">
          <div className="absolute top-6 right-6 flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 z-10 relative">
            <Flame className="w-5 h-5 fill-orange-500" />
            <div className="absolute inset-0 bg-orange-500/10 dark:bg-orange-500/20 blur-xl rounded-full"></div>
          </div>
          <div className="z-10">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.streak !== undefined ? user.streak : <span className="animate-pulse">...</span>}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">Day Streak</p>
          </div>
        </div>
        {/* Devices */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-50 dark:border-slate-800 flex flex-col justify-between min-h-[140px] transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.device_limit || (isPremium ? 5 : 2)}
              <span className="text-slate-300 dark:text-slate-600 text-lg"> / {isPremium ? 5 : 2}</span>
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">Active Devices</p>
          </div>
        </div>
        {/* Current Plan */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-50 dark:border-slate-800 flex flex-col justify-center items-center text-center min-h-[140px] transition-colors">
          <div className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide mb-3 border ${isPremium ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            {isPremium ? "PREMIUM" : "FREE"}
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Current Plan</p>
        </div>
      </div>

      {/* ===================== */}
      {/* 3. TEST NATIJALARI TARIXI */}
      {/* ===================== */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-50 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#8B5CF6]" />
            O‘tgan test natijalari
          </h2>
          <button
            onClick={fetchResults}
            disabled={isFetchingResults}
            className="text-sm text-[#8B5CF6] hover:underline disabled:opacity-50"
          >
            {isFetchingResults ? 'Yuklanmoqda...' : 'Yangilash'}
          </button>
        </div>

        {results.length === 0 && !isFetchingResults ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Hali birorta test ishlanmagan.</p>
            <a href="/dashboard/jlpt" className="text-[#8B5CF6] hover:underline text-sm mt-2 inline-block">
              Testlarni ko‘rish
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/dashboard/jlpt/${result.test_id}/result/${result.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${result.passed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {result.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{result.test_title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{result.level}</span>
                      <span>{new Date(result.created_at).toLocaleDateString('uz-UZ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {result.score}%
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== */}
      {/* 4. PREMIUM STATUS BANNER */}
      {/* ===================== */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-50 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/30 dark:via-purple-900/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Crown className="text-[#8B5CF6] w-6 h-6" /> Premium Status
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
              {isPremium ? "You are currently enjoying Premium features!" : "Upgrade to Premium to get more devices and features!"}
            </p>
          </div>
          {!isPremium && (
            <button className="w-full md:w-auto shrink-0 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-3 rounded-2xl font-semibold shadow-md transition-all text-sm">
              Upgrade Now
            </button>
          )}
        </div>
        <div className="relative z-10 mt-8">
          <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Free</span>
            <span className={isPremium ? "text-[#8B5CF6] font-bold" : ""}>Premium</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#A2B1D3] dark:bg-[#6c7b9e] rounded-full transition-all duration-1000" style={{ width: isPremium ? '100%' : '25%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}