import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storageService } from '../cache/storage.service';
import { API_CONFIG } from '../../config/api.config';

// 1. Buat Interface untuk mendefinisikan bentuk item di dalam queue
interface FailedRequestQueueItem {
  resolve: (value: string) => void; // Kita resolve dengan token baru (string)
  reject: (error: Error) => void;     // Kita reject dengan error
}

// Flag untuk mencegah multiple refresh call
let isRefreshing = false;

// 2. Ganti tipe 'any[]' dengan tipe Interface array
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // Pastikan token ada sebelum resolve, atau reject jika null (safety check)
      if (token) {
        prom.resolve(token);
      } else {
        prom.reject(new Error('Token refresh failed'));
      }
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (instance: AxiosInstance) => {
  // ===== REQUEST INTERCEPTOR =====
  instance.interceptors.request.use(
    (config) => {
      const token = storageService.getAccessToken();
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

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // 3. Tambahkan Generic <string> pada Promise agar TypeScript tahu return-nya string
          return new Promise<string>(function (resolve, reject) {
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

        if (!refreshToken) {
          isRefreshing = false;
          storageService.clearAuth();
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          const newToken = response.data?.accessToken;
          const newRefreshToken = response.data?.refreshToken;

          if (!newToken) throw new Error('Failed to refresh token');

          storageService.setAccessToken(newToken);
          if (newRefreshToken) storageService.setRefreshToken(newRefreshToken);

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          storageService.clearAll();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};