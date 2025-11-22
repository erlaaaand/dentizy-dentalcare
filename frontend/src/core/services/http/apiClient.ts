import { AxiosRequestConfig } from 'axios';
import { customInstance } from './axiosInstance';
import { ApiResponse, ApiError } from '../../types/api';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await customInstance.request<T>({
        ...config,
        url: `${this.baseURL}${config.url}`,
      });

      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      const axiosError = error as any;
      return {
        message: axiosError.response?.data?.message || error.message,
        statusCode: axiosError.response?.status || 500,
        errors: axiosError.response?.data?.errors,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

export const apiClient = new ApiClient();