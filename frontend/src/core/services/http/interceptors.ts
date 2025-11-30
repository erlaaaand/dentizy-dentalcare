// interceptors.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storageService } from '../cache/storage.service';
import { API_CONFIG } from '@/core/config/api.config';

// Flag untuk mencegah multiple refresh call
let isRefreshing = false;
// Antrian request yang gagal karena 401
let failedQueue: any[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (instance: AxiosInstance) => {
  // ===== REQUEST INTERCEPTOR =====
  instance.interceptors.request.use(
    (config) => {
      const token = storageService.getAccessToken();
      // Jangan inject header jika request ditujukan ke endpoint refresh
      // untuk mencegah pengiriman access token yang sudah expired
      if (token && !config.url?.includes('/auth/refresh')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ===== RESPONSE INTERCEPTOR (REFRESH TOKEN) =====
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Cek jika error 401 dan bukan karena retry
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

        // Mencegah loop pada endpoint login/refresh itu sendiri
        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        // Jika sedang refreshing, masukkan request ke antrian
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = storageService.getRefreshToken();

        // Jika tidak ada refresh token, logout
        if (!refreshToken) {
          isRefreshing = false;
          storageService.clearAuth();
          return Promise.reject(error);
        }

        try {
          // PENTING: Gunakan instance axios BARU/MURNI untuk refresh
          // agar tidak terganggu oleh interceptor yang ada
          const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          const newToken = response.data?.accessToken;
          const newRefreshToken = response.data?.refreshToken;

          if (!newToken) throw new Error('Failed to refresh token');

          storageService.setAccessToken(newToken);
          if (newRefreshToken) storageService.setRefreshToken(newRefreshToken);

          // Proses antrian yang menunggu
          processQueue(null, newToken);

          // Ulangi request yang gagal tadi
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Jika refresh gagal, reject semua antrian dan logout
          processQueue(refreshError as Error, null);
          storageService.clearAll();
          // Optional: Redirect ke login bisa ditangani di sini atau via useAuth
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};