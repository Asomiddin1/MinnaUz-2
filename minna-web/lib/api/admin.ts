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

  /* ==========================================
     LMS (O'QUV KURS) MANAGEMENT - YANGI QO'SHILDI
     ========================================== */

  /* --- LEVELS (Darajalar) --- */
  getLevels: (): Promise<AxiosResponse> =>
    apiClient.get("/admin/levels"),

  getLevelById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/levels/${id}`),

  createLevel: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/levels", data),

  updateLevel: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/levels/${id}`, data),

  deleteLevel: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/levels/${id}`),

  /* --- MODULES (Bo'limlar) --- */
  // level_id orqali filtrlash imkoniyati bilan
  getModules: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/modules", { params: { level_id: levelId } }),

  getModuleById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/modules/${id}`),

  createModule: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/modules", data),

  updateModule: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/modules/${id}`, data),

  deleteModule: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/modules/${id}`),

  /* --- LESSONS (Video darslar) --- */
  // module_id orqali filtrlash imkoniyati bilan
  getLessons: (moduleId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/lessons", { params: { module_id: moduleId } }),

  getLessonById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/lessons/${id}`),

  createLesson: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/lessons", data),

  updateLesson: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/lessons/${id}`, data),

  deleteLesson: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/lessons/${id}`),
};