import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { customInstance } from './axiosInstance';
import { StorageService } from '../cache/storage.service';
import { AUTH_CONFIG } from '../../config/auth.config';

const storage = new StorageService();

// Request Interceptor
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = storage.getAccessToken();
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const requestErrorInterceptor = (error: AxiosError) => {
  return Promise.reject(error);
};

// Response Interceptor
const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  // Handle 401 Unauthorized
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = storage.getRefreshToken();
      
      if (!refreshToken) {
        storage.clearAuth();
        window.location.href = AUTH_CONFIG.LOGIN_PATH;
        return Promise.reject(error);
      }

      // Attempt to refresh token
      const response = await customInstance.post('/auth/refresh', { refreshToken });
      const { accessToken } = response.data;

      storage.setAccessToken(accessToken);
      
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return customInstance(originalRequest);
    } catch (refreshError) {
      storage.clearAuth();
      window.location.href = AUTH_CONFIG.LOGIN_PATH;
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

// Setup Interceptors
export const setupInterceptors = () => {
  customInstance.interceptors.request.use(
    requestInterceptor,
    requestErrorInterceptor
  );

  customInstance.interceptors.response.use(
    responseInterceptor,
    responseErrorInterceptor
  );
};