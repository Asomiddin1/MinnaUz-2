'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { setAuthToken, userAPI } from '@/lib/api';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  coins?: number;
  streak?: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const token = (session as any).accessToken;
      console.log('Session token:', token); 
      if (token) setAuthToken(token);
    }
  }, [session, status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchUser = async () => {
      try {
        const response = await userAPI.getProfile();
        console.log('API response:', response); // To'liq javob
        console.log('User data:', response.data); // Faqat user obyekti
        setUser(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
        // Agar err.response bo'lsa, status va datani ham chiqaramiz
        if (err && typeof err === 'object' && 'response' in err) {
          const error = err as { response?: { status: number; data: any } };
          if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [status]);

  if (loading) return <div>Yuklanmoqda...</div>;
  if (!user) return <div>Foydalanuvchi topilmadi</div>;

  return (
    <div>
      <h1>Profil</h1>
      {user.avatar && <Image src={user.avatar} alt='avatar' width={100} height={100} className=' rounded-2xl' />}
      <p>Ism: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Tangalar: {user.coins ?? 0}</p>
      <p>Streak: {user.streak ?? 0}</p>
    </div>
  );
}