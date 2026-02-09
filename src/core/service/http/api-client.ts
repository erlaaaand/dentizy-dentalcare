import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { setupInterceptors } from './interceptors';
import type { ApiResponse } from '../../types/api/api.types';

class ApiClient {
  private static instance: ApiClient;
  public axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
    });

    setupInterceptors(this.axiosInstance);
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return {
        data: response.data,
        status: response.status,
        headers: Object.fromEntries(
            Object.entries(response.headers).map(([key, value]) => [key, String(value)])
        ),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        let message = error.message;

        if (typeof data === 'object' && data !== null && 'message' in data) {
        message = (data as { message: string }).message;
        }

        return new Error(message);
    }
    return error instanceof Error ? error : new Error('Unknown error');
    }
}

export const apiClient = ApiClient.getInstance();
export const axiosInstance = apiClient.axiosInstance;