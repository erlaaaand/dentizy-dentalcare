// frontend/src/core/services/http/axiosInstance.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '@/core/config/api.config';
import { AUTH_CONFIG } from '@/core/config/auth.config';
import { parseApiError } from '@/core/errors/api.error';
import { ROUTES } from '@/core/constants/routes.constants';
import { storageService } from '@/core/services/cache/storage.service';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// --- REQUEST INTERCEPTOR ---
axiosInstance.interceptors.request.use(
    (config: any) => {
        const token = storageService.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (process.env.NODE_ENV === 'development') {
            // Menggunakan console.debug agar tidak terlalu bising di console
            console.debug(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
axiosInstance.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`✅ [API] ${response.status}: ${response.config.url}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // 1. Handle Request Canceled (React Strict Mode)
        // Ini normal terjadi saat navigasi cepat atau double-mount di dev
        if (axios.isCancel(error)) {
            if (process.env.NODE_ENV === 'development') {
                console.debug(`ℹ️ Request canceled: ${error.message}`);
            }
            // Reject dengan error asli agar React Query tahu statusnya, 
            // tapi UI tidak perlu menampilkan ini sebagai error fatal.
            return Promise.reject(error);
        }

        // 2. Enhanced Error Logging dengan JSON.stringify
        // Ini mengatasi masalah log error muncul sebagai "{}"
        if (process.env.NODE_ENV === 'development') {
            const errorLog = {
                url: error.config?.url || 'Unknown URL',
                method: error.config?.method?.toUpperCase() || 'UNKNOWN',
                status: error.response?.status || 'No Status (Network Error/Timeout)',
                message: error.message || 'Unknown Error',
                serverMessage: (error.response?.data as any)?.message || 'No Server Message',
            };

            console.error('❌ API Error Details:', JSON.stringify(errorLog, null, 2));
        }

        // 3. Handle Refresh Token (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = typeof window !== 'undefined'
                    ? localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY)
                    : null;

                if (refreshToken) {
                    const response = await axios.post(
                        `${API_CONFIG.baseURL}/auth/refresh`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${refreshToken}`,
                            },
                        }
                    );

                    const { access_token } = response.data;
                    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, access_token);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                localStorage.clear();
                if (typeof window !== 'undefined') {
                    window.location.href = ROUTES.LOGIN;
                }
                return Promise.reject(refreshError);
            }
        }

        const apiError = parseApiError(error);
        return Promise.reject(apiError);
    }
);

// --- CUSTOM INSTANCE WRAPPER (Untuk Orval/TanStack Query) ---
export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    const source = axios.CancelToken.source();

    const promise = axiosInstance({
        ...config,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data); // PENTING: Hanya return data agar UI tidak perlu mengakses .data lagi

    // @ts-ignore
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

export default axiosInstance;