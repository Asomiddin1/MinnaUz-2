import axios, { AxiosResponse } from "axios";
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

/* =========================================================
    👤 USER API (Profil va JLPT Imtihonlari)
========================================================= */

export const userAPI = {
  // Profil va statistika
  getProfile: (): Promise<AxiosResponse> => 
    apiClient.get("/user"),

  getStreaks: (year?: number, month?: number): Promise<AxiosResponse> =>
    apiClient.get("/user/streaks", { params: { year, month } }),

  // JLPT Testlar (User ko'rishi uchun)
  getTests: (level?: string): Promise<AxiosResponse> => 
    apiClient.get("/user/tests", { params: { level } }),

  getTestDetails: (id: number): Promise<AxiosResponse> => 
    apiClient.get(`/user/tests/${id}`),

  // Testni topshirish (Natijani hisoblash uchun)
submitExam: (testId: number, answers: any, timeSpent?: number): Promise<AxiosResponse> =>
  apiClient.post(`/user/tests/${testId}/submit`, { answers, time_spent: timeSpent || 0 }),

getTestResult: (resultId: number): Promise<AxiosResponse> =>
    apiClient.get(`/user/results/${resultId}`),
getMyResults: (): Promise<AxiosResponse> => apiClient.get("/user/results"),
}

/* =========================================================
    🛠 ADMIN API (Faqat Boshqaruv Paneli Uchun)
========================================================= */

export const adminAPI = {
  /* --- USERS MANAGEMENT --- */
  getAllUsers: (page = 1, search = "", role = ""): Promise<AxiosResponse> =>
    apiClient.get(`/admin/users`, { params: { page, search, role } }),

  updateUser: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/users/${id}`, data),

  deleteUser: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/users/${id}`),

  // Premium statusini tezkor almashtirish (Yangi qo'shildi!)
  togglePremium: (id: number): Promise<AxiosResponse> =>
    apiClient.post(`/admin/users/${id}/toggle-premium`),

  /* --- JLPT TESTS MANAGEMENT --- */
  getTests: (): Promise<AxiosResponse> =>
    apiClient.get("/admin/tests"),

  getTestById: (id: number): Promise<AxiosResponse> => 
  apiClient.get(`/admin/tests/${id}`),

  createTest: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/tests", data),

  updateTest: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/tests/${id}`, data),

  deleteTest: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/tests/${id}`),

  // Test ichidagi savollarni to'g'ri javoblari bilan ko'rish
  getTestQuestions: (testId: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/tests/${testId}/questions`),

  /* --- QUESTIONS MANAGEMENT (FILE UPLOAD BILAN) --- */
  createQuestion: (data: FormData): Promise<AxiosResponse> =>
    apiClient.post("/admin/questions", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateQuestion: (id: number, data: FormData): Promise<AxiosResponse> => {
    // Laravel Multipart/Form-Data da PUT so'rovini tushunishi uchun _method qo'shamiz
    if (data instanceof FormData) {
        data.append("_method", "PUT");
    }
    return apiClient.post(`/admin/questions/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteQuestion: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/questions/${id}`),
};

export default apiClient;