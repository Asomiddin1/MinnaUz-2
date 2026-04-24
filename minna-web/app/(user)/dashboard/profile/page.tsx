'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { setAuthToken, userAPI } from '@/lib/api';
import Image from 'next/image';
import { Crown, RefreshCcw } from 'lucide-react';

// =====================
// TYPE
// =====================
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  coins?: number;
  streak?: number;
  is_premium?: boolean;
  device_limit?: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // =====================
  // SET TOKEN
  // =====================
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const token = (session as any).accessToken;

      if (token) {
        setAuthToken(token);
      }
    }
  }, [session, status]);

  // =====================
  // FETCH PROFILE
  // =====================
  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await userAPI.getProfile();

      setUser(response.data.user || response.data);
    } catch (err: any) {
      console.error(err);

      // ❌ TOKEN INVALID => AUTO LOGOUT
      if (err?.response?.status === 401) {
        signOut(); // NextAuth logout
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUser();
    }
  }, [status]);

  // =====================
  // LOADING
  // =====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCcw className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-10">
        Foydalanuvchi topilmadi
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">

        {/* AVATAR */}
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt="avatar"
            width={80}
            height={80}
            className="rounded-2xl"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center">
            {user.name?.charAt(0)}
          </div>
        )}

        {/* INFO */}
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {user.name}

            {/* 💎 PREMIUM */}
            {user.is_premium && (
              <Crown className="text-yellow-500 w-5 h-5" />
            )}
          </h1>

          <p className="text-gray-500">{user.email}</p>

          <p className="text-sm mt-1">
            Role: <b>{user.role}</b>
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4">

        <div className="p-4 border rounded-xl">
          <p className="text-gray-500 text-sm">Coins</p>
          <p className="text-lg font-bold">🪙 {user.coins || 0}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-gray-500 text-sm">Streak</p>
          <p className="text-lg font-bold">🔥 {user.streak || 0}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-gray-500 text-sm">Device Limit</p>
          <p className="text-lg font-bold">📱 {user.device_limit}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-gray-500 text-sm">Status</p>
          <p className="text-lg font-bold">
            {user.is_premium ? "💎 PREMIUM" : "FREE"}
          </p>
        </div>

      </div>

      {/* REFRESH BUTTON */}
      <button
        onClick={fetchUser}
        className="w-full flex items-center justify-center gap-2 p-3 border rounded-xl hover:bg-gray-50"
      >
        <RefreshCcw className="w-4 h-4" />
        Refresh Profile
      </button>

    </div>
  );
}