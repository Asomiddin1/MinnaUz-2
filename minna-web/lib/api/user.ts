import { AxiosResponse } from "axios";
import apiClient from "./axios"; // Asosiy axios sozlamasini chaqiramiz

export const userAPI = {
  // ==========================================
  // MAVJUD PROFIL VA TEST API LARI
  // ==========================================
  getProfile: (): Promise<AxiosResponse> => 
    apiClient.get("/user"),

  getStreaks: (year?: number, month?: number): Promise<AxiosResponse> =>
    apiClient.get("/user/streaks", { params: { year, month } }),

  getTests: (level?: string): Promise<AxiosResponse> => 
    apiClient.get("/user/tests", { params: { level } }),

  getTestDetails: (id: number): Promise<AxiosResponse> => 
    apiClient.get(`/user/tests/${id}`),

  submitExam: (testId: number, answers: any, timeSpent?: number): Promise<AxiosResponse> =>
    apiClient.post(`/user/tests/${testId}/submit`, { answers, time_spent: timeSpent || 0 }),

  getTestResult: (resultId: number): Promise<AxiosResponse> =>
    apiClient.get(`/user/results/${resultId}`),

  getMyResults: (): Promise<AxiosResponse> => 
    apiClient.get("/user/results"),

  // ==========================================
  // YANGI L.M.S (O'QUV KURS) API LARI
  // ==========================================

  // Barcha darajalarni olish (N5, N4, Hira-kata ro'yxati)
  getLevels: (): Promise<AxiosResponse> => 
    apiClient.get("/levels"),

  // Bitta daraja haqida to'liq ma'lumot (barcha modul va darslari bilan)
  // E'tibor bering: id emas, URL dagi so'z (slug) orqali izlaymiz (masalan: 'n5')
  getLevelBySlug: (slug: string): Promise<AxiosResponse> => 
    apiClient.get(`/levels/${slug}`),

  // ==========================================
  // USER INTERAKSIYALARI (Faqat ro'yxatdan o'tganlar uchun)
  // ==========================================

  // Darsni saqlash yoki saqlanganlardan olib tashlash (Like/Unlike)
  toggleLessonLike: (lessonId: number): Promise<AxiosResponse> => 
    apiClient.post(`/user/lessons/${lessonId}/like`),

  // Darsga izoh qoldirish
  addLessonComment: (lessonId: number, comment: string): Promise<AxiosResponse> => 
    apiClient.post(`/user/lessons/${lessonId}/comments`, { comment }),
};