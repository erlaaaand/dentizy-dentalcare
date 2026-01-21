import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api.config';

interface FailedRequestQueueItem {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    } else {
      prom.reject(new Error('Token refresh failed'));
    }
  });
  failedQueue = [];
};

// Helper to get token from cookie
const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
  
  if (!tokenCookie) return null;
  
  const token = tokenCookie.split('=')[1];
  return token ? decodeURIComponent(token) : null;
};

// Helper to get refresh token from localStorage
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

// Helper to set token in cookie
const setTokenInCookie = (token: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;
};

// Helper to clear auth data
const clearAuthData = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'access_token=; path=/; max-age=0';
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refresh_token');
  }
};

export const setupInterceptors = (instance: AxiosInstance) => {
  // ===== REQUEST INTERCEPTOR =====
  instance.interceptors.request.use(
    (config) => {
      // Don't add token to auth endpoints
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
        return config;
      }

      const token = getTokenFromCookie();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ===== RESPONSE INTERCEPTOR =====
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If no response or no config, reject immediately
      if (!error.response || !originalRequest) {
        return Promise.reject(error);
      }

      // Don't retry auth endpoints
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401 && !originalRequest._retry) {
        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
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

        const refreshToken = getRefreshToken();

        // No refresh token, clear auth and reject
        if (!refreshToken) {
          isRefreshing = false;
          clearAuthData();
          
          // Redirect to login if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(error);
        }

        try {
          // Attempt to refresh token
          const response = await axios.post(
            `${API_CONFIG.baseURL}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          const newToken = response.data?.accessToken || response.data?.token || response.data?.access_token;
          const newRefreshToken = response.data?.refreshToken || response.data?.refresh_token;

          if (!newToken) {
            throw new Error('No access token in refresh response');
          }

          // Update tokens
          setTokenInCookie(newToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          // Process queued requests
          processQueue(null, newToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);

        } catch (refreshError) {
          // Refresh failed, clear auth and redirect
          processQueue(refreshError as Error, null);
          clearAuthData();
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};