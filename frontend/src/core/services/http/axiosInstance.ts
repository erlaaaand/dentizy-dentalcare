// frontend/src/core/services/http/axiosInstance.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/core/config/api.config';
import { setupInterceptors } from './interceptors'; // Pastikan path import benar

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export type PromiseWithCancel<T> = Promise<T> & {
  cancel: () => void;
};

// INITIALIZE INTERCEPTORS
setupInterceptors(axiosInstance);

// --- CUSTOM INSTANCE WRAPPER (TanStack Query / Orval) ---
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): PromiseWithCancel<T> => { // <--- 1. Ubah Return Type fungsi ini
  const source = axios.CancelToken.source();

  // 2. Lakukan Casting 'as PromiseWithCancel<T>' saat inisialisasi
  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data) as PromiseWithCancel<T>;

  // 3. Sekarang properti .cancel valid dan dikenali TypeScript
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default axiosInstance;