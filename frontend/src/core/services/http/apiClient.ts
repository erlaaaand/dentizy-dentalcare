// frontend/src/core/services/api/apiClient.ts
import { AxiosRequestConfig } from 'axios';
import { customInstance } from '../http/axiosInstance';

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
    timestamp?: string;
}

export class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = '') {
        this.baseURL = baseURL;
    }

    private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await customInstance<T>({
                ...config,
                url: `${this.baseURL}${config.url}`,
            });

            return {
                data: response as T,
                success: true,
            };
        } catch (error) {
            throw error;
        }
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'GET', url });
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'POST', url, data });
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'PUT', url, data });
    }

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'PATCH', url, data });
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, method: 'DELETE', url });
    }
}

export const apiClient = new ApiClient();
