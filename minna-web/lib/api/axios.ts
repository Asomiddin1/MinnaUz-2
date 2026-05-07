import axios from "axios";
import { getSession, signOut } from "next-auth/react";

/* =========================================================
    🌐 AXIOS INSTANCE
========================================================= */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
    🔐 REQUEST INTERCEPTOR (NEXTAUTH TOKEN)
========================================================= */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      // NextAuth'da accessToken deb saqlaganmiz
      const token = (session as any)?.accessToken;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Token interceptor xatoligi:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
    ❌ RESPONSE INTERCEPTOR
========================================================= */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // 401 - Token eskirgan yoki noto'g'ri
    if (status === 401) {
      await signOut({ callbackUrl: "/auth/login" });
    }

    // 403 - Ruxsat yo'q (Admin sahifasiga User kirmoqchi bo'lsa)
    if (status === 403) {
      console.warn("403 Forbidden - Sizga bu amalni bajarish ruxsat etilmagan.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;