// frontend/src/core/services/http/interceptors.ts
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosInstance from './axiosInstance';
import { storageService } from '../cache/storage.service';
import { AUTH_CONFIG } from '@/core/config/auth.config';
import { ROUTES } from '@/core/constants/routes.constants';

const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = storageService.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const requestErrorInterceptor = (error: AxiosError) => {
  return Promise.reject(error);
};

const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = storageService.getRefreshToken();

      if (!refreshToken) {
        storageService.clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(error);
      }

      // Attempt to refresh token
      const response = await axiosInstance.post('/auth/refresh', { refreshToken });
      const { accessToken } = response.data;

      storageService.setAccessToken(accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      storageService.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.LOGIN;
      }
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

export const setupInterceptors = () => {
  axiosInstance.interceptors.request.use(
    requestInterceptor,
    requestErrorInterceptor
  );

  axiosInstance.interceptors.response.use(
    responseInterceptor,
    responseErrorInterceptor
  );
};