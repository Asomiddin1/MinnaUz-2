import { AxiosResponse } from "axios";
import apiClient from "./axios";

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
    if (data instanceof FormData) {
      data.append("_method", "PUT");
      return apiClient.post(`/admin/tests/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
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
     LMS (O'QUV KURS) MANAGEMENT
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

  /* ==========================================
     MATERIALLAR MANAGEMENT (YANGI QO'SHILDI)
     ========================================== */

  /* --- GRAMMARS (Grammatikalar) --- */
  getGrammars: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/grammars", { params: { level_id: levelId } }),

  getGrammarById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/grammars/${id}`),

  createGrammar: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/grammars", data),

  updateGrammar: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/grammars/${id}`, data),

  deleteGrammar: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/grammars/${id}`),

  /* --- KANJIS (Kanjilar) --- */
  getKanjis: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/kanjis", { params: { level_id: levelId } }),

  getKanjiById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/kanjis/${id}`),

  createKanji: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/kanjis", data),

  updateKanji: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/kanjis/${id}`, data),

  deleteKanji: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/kanjis/${id}`),

  /* --- VOCABULARIES (Lug'atlar) --- */
  getVocabularies: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/vocabularies", { params: { level_id: levelId } }),

  getVocabularyById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/vocabularies/${id}`),

  createVocabulary: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/vocabularies", data),

  updateVocabulary: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/vocabularies/${id}`, data),

  deleteVocabulary: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/vocabularies/${id}`),

  /* ==========================================
     VIDEO DARSLAR (YANGI QO'SHILDI)
     ========================================== */
  
  getVideos: (): Promise<AxiosResponse> =>
    apiClient.get("/admin/videos"),

  getVideoById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/videos/${id}`),

  createVideo: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/videos", data),

  updateVideo: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/videos/${id}`, data),

  deleteVideo: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/videos/${id}`),

  // YOUTUBE DAN AVTOMAT MA'LUMOT OLISH
  fetchYoutubeData: (url: string): Promise<AxiosResponse> =>
    apiClient.post("/admin/videos/fetch-youtube", { url }),
};