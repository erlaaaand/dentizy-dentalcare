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

// INITIALIZE INTERCEPTORS
setupInterceptors(axiosInstance);

// --- CUSTOM INSTANCE WRAPPER (TanStack Query / Orval) ---
export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig
): Promise<T> => {
    const source = axios.CancelToken.source();

    const promise = axiosInstance({
        ...config,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

export default axiosInstance;