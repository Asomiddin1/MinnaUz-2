import { AxiosResponse } from "axios";
import apiClient from "./axios"; // Asosiy axios sozlamasini chaqiramiz

export const adminAPI = {
  /* --- USERS MANAGEMENT --- */
  getAllUsers: (page = 1, search = "", role = ""): Promise<AxiosResponse> =>
    apiClient.get(`/admin/users`, { params: { page, search, role } }),

  updateUser: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/users/${id}`, data),

  deleteUser: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/users/${id}`),

  togglePremium: (id: number): Promise<AxiosResponse> =>
    apiClient.post(`/admin/users/${id}/toggle-premium`),

  /* --- JLPT TESTS MANAGEMENT --- */
  getTests: (): Promise<AxiosResponse> =>
    apiClient.get("/admin/tests"),

  getTestById: (id: number): Promise<AxiosResponse> => 
    apiClient.get(`/admin/tests/${id}`),

  createTest: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/tests", data),

  updateTest: (id: number, data: any): Promise<AxiosResponse> => {
    // Agar ma'lumot fayl (FormData) ko'rinishida bo'lsa
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      return apiClient.post(`/admin/tests/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    // Oddiy JSON bo'lsa (faylsiz)
    return apiClient.put(`/admin/tests/${id}`, data);
  },

  deleteTest: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/tests/${id}`),

  getTestQuestions: (testId: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/tests/${testId}/questions`),

  /* --- QUESTIONS MANAGEMENT --- */
  createQuestion: (data: FormData): Promise<AxiosResponse> =>
    apiClient.post("/admin/questions", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateQuestion: (id: number, data: FormData): Promise<AxiosResponse> => {
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