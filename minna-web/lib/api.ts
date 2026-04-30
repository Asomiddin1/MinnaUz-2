import axios, { AxiosResponse } from "axios";

/* =========================================================
   🔐 TOKEN HANDLER
========================================================= */

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
};

/* =========================================================
   🌐 AXIOS INSTANCE
========================================================= */

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   🔐 REQUEST INTERCEPTOR (TOKEN ATTACH)
========================================================= */

apiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================================================
   ❌ RESPONSE INTERCEPTOR (GLOBAL ERROR HANDLING)
========================================================= */

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   👤 USER API
========================================================= */

export const userAPI = {
  getProfile: (): Promise<AxiosResponse> => apiClient.get("/user"),

  getAllUsers: (
    page: number = 1,
    search: string = ""
  ): Promise<AxiosResponse> =>
    apiClient.get(`/users?page=${page}&search=${search}`),

  updateUser: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/users/${id}`, data),

  deleteUser: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/users/${id}`),

  getStreaks: (year: number, month: number): Promise<AxiosResponse> =>
    apiClient.get(`/user/streaks?year=${year}&month=${month}`),
};

/* =========================================================
   🧠 JLPT API (MOJI / BUNPOU / DOKKAI / CHOUKAI)
========================================================= */

export const jlptAPI = {
  getQuestions: (type: string, level: string): Promise<AxiosResponse> =>
    apiClient.get(`/jlpt/questions?type=${type}&level=${level}`),

  getListening: (level: string): Promise<AxiosResponse> =>
    apiClient.get(`/jlpt/listening?level=${level}`),

  submit: (answers: any): Promise<AxiosResponse> =>
    apiClient.post("/jlpt/submit", { answers }),
};

/* =========================================================
   🛠 ADMIN API (FULL CRUD)
========================================================= */

export const adminAPI = {
  /* ======================
     👥 USERS MANAGEMENT
  ====================== */
  getAllUsers: (
    page: number = 1,
    search: string = ""
  ): Promise<AxiosResponse> =>
    apiClient.get(`/admin/users?page=${page}&search=${search}`),

  updateUser: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/users/${id}`, data),

  deleteUser: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/users/${id}`),

  /* ======================
     📋 QUESTIONS & TESTS
  ====================== */
  getQuestions: (): Promise<AxiosResponse> =>
    apiClient.get("/admin/questions"),

  createQuestion: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/questions", data),

  updateQuestion: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/questions/${id}`, data),

  deleteQuestion: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/questions/${id}`),

  getTests: (): Promise<AxiosResponse> => apiClient.get("/admin/tests"),
  
  // ✅ TO'G'RILANDI: FormData (audio yuklash) uchun maxsus headers qo'shildi
  createTest: (data: any): Promise<AxiosResponse> => 
    apiClient.post("/admin/tests", data, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    
  // ✅ TO'G'RILANDI: 'axios.post' o'rniga 'apiClient.post' yozildi va headers qo'shildi
  updateTest: (id: number, data: any): Promise<AxiosResponse> => 
    apiClient.post(`/admin/tests/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    
  deleteTest: (id: number): Promise<AxiosResponse> => apiClient.delete(`/admin/tests/${id}`),

  getTestById: (id: number): Promise<AxiosResponse> => apiClient.get(`/admin/tests/${id}`),
  
  getQuestionsByTestId: (testId: number): Promise<AxiosResponse> => apiClient.get(`/admin/tests/${testId}/questions`),
};

export default apiClient;