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

axiosInstance.interceptors.request.use(
    (config: any) => {
        const token = storageService.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                params: config.params,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ API Response:', {
                url: response.config.url,
                status: response.status,
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (process.env.NODE_ENV === 'development') {
            console.error('❌ API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
            });
        }

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

export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
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