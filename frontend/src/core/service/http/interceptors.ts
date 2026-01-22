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

const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
    
    if (!tokenCookie) return null;
    
    const token = tokenCookie.split('=')[1];
    return token ? decodeURIComponent(token.trim()) : null;
  } catch (error) {
    console.error('Error reading token from cookie:', error);
    return null;
  }
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('refresh_token');
  } catch (error) {
    console.error('Error reading refresh token:', error);
    return null;
  }
};

const setTokenInCookie = (token: string): boolean => {
  if (typeof document === 'undefined') return false;
  
  try {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const cookieString = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    document.cookie = cookieString;
    
    // Verify cookie was set
    const verification = getTokenFromCookie();
    return verification === token;
  } catch (error) {
    console.error('Error setting token in cookie:', error);
    return false;
  }
};

const clearAuthData = () => {
  if (typeof document !== 'undefined') {
    try {
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
    } catch (error) {
      console.error('Error clearing cookie:', error);
    }
  }
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
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
      // Skip auth for login and refresh endpoints
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
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle network errors
      if (!error.response) {
        console.error('Network error:', error.message);
        return Promise.reject(new Error('Koneksi jaringan bermasalah. Periksa internet Anda.'));
      }

      // Skip retry for auth endpoints
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                            originalRequest?.url?.includes('/auth/refresh');
      
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        
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

        // No refresh token available
        if (!refreshToken) {
          isRefreshing = false;
          processQueue(new Error('No refresh token available'), null);
          clearAuthData();
          redirectToLogin();
          return Promise.reject(new Error('Sesi Anda telah berakhir. Silakan login kembali.'));
        }

        try {
          // Attempt to refresh token
          const response = await axios.post(
            `${API_CONFIG.baseURL}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000
            }
          );

          // Extract new tokens
          const newToken = response.data?.accessToken || 
                          response.data?.access_token || 
                          response.data?.token;
          const newRefreshToken = response.data?.refreshToken || 
                                 response.data?.refresh_token;

          if (!newToken) {
            throw new Error('No access token in refresh response');
          }

          // Save new tokens
          const cookieSet = setTokenInCookie(newToken);
          
          if (!cookieSet) {
            throw new Error('Failed to set new token');
          }

          if (newRefreshToken && typeof window !== 'undefined') {
            try {
              localStorage.setItem('refresh_token', newRefreshToken);
            } catch (storageError) {
              console.error('Failed to save refresh token:', storageError);
            }
          }

          // Process queued requests
          processQueue(null, newToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);

        } catch (refreshError) {
          // Refresh failed
          processQueue(refreshError as Error, null);
          clearAuthData();
          redirectToLogin();
          
          const errorMessage = axios.isAxiosError(refreshError) && refreshError.response?.data?.message
            ? refreshError.response.data.message
            : 'Sesi Anda telah berakhir. Silakan login kembali.';
          
          return Promise.reject(new Error(errorMessage));
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other error codes
      if (error.response.status === 403) {
        console.error('Forbidden: Insufficient permissions');
      } else if (error.response.status >= 500) {
        console.error('Server error:', error.response.status);
      }

      return Promise.reject(error);
    }
  );
};