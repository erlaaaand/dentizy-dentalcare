import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api.config';

interface QueueItem {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else if (token) {
      item.resolve(token);
    }
  });
  failedQueue = [];
};

const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
  
  if (!tokenCookie) return null;
  
  const token = tokenCookie.split('=')[1];
  return token ? decodeURIComponent(token.trim()) : null;
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

const setTokenInCookie = (token: string): void => {
  if (typeof document === 'undefined') return;
  
  const isSecure = window.location.protocol === 'https:';
  const cookieString = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  document.cookie = cookieString;
};

const clearAuthData = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
  }
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
  }
};

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const loginUrl = `/login${currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
    window.location.href = loginUrl;
  }
};

export const setupInterceptors = (instance: AxiosInstance) => {
  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      const isAuthEndpoint = config.url?.includes('/auth/login') || 
                            config.url?.includes('/auth/refresh');
      
      if (isAuthEndpoint) {
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

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (!error.response) {
        return Promise.reject(new Error('Koneksi jaringan bermasalah'));
      }

      const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                            originalRequest?.url?.includes('/auth/refresh');
      
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          isRefreshing = false;
          processQueue(new Error('No refresh token'), null);
          clearAuthData();
          redirectToLogin();
          return Promise.reject(new Error('Sesi berakhir'));
        }

        try {
          const response = await axios.post(
            `${API_CONFIG.baseURL}/auth/refresh`,
            { refreshToken },
            { 
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000 
            }
          );

          const newToken = response.data?.accessToken || 
                          response.data?.access_token || 
                          response.data?.token;

          if (!newToken) {
            throw new Error('No token in refresh response');
          }

          setTokenInCookie(newToken);

          const newRefreshToken = response.data?.refreshToken || 
                                 response.data?.refresh_token;
          
          if (newRefreshToken && typeof window !== 'undefined') {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);

        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          clearAuthData();
          redirectToLogin();
          
          return Promise.reject(new Error('Sesi berakhir'));
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};