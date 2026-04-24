// lib/api.ts
import axios, { AxiosResponse } from 'axios';


// Tokenni dinamik olish uchun getter (agar localStorage dan boshqa joyda saqlansa)
let globalToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  globalToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // withCredentials: true,  // ❌ Bearer token bilan kerak emas, cookie uchun kerak
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  // Avval globalTokenni, keyin localStorage ni tekshiramiz
  let token = globalToken;
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userAPI = {
  // profile
  getProfile: (): Promise<AxiosResponse> => apiClient.get('/user'),
  // admin users
  getAllUsers: (page: number = 1, search: string = '') => 
    apiClient.get(`/users?page=${page}&search=${search}`),  
  updateUser: (id: number, data: any) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id: number) => apiClient.delete(`/users/${id}`),
};

export default apiClient;