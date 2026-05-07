import { AxiosResponse } from "axios";
import apiClient from "./axios"; // Asosiy axios sozlamasini chaqiramiz

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

  getMyResults: (): Promise<AxiosResponse> => 
    apiClient.get("/user/results"),
};