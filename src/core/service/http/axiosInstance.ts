// src/core/service/http/axiosInstance.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { setupInterceptors } from './interceptors';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

export type PromiseWithCancel<T> = Promise<T> & {
  cancel: () => void;
};

setupInterceptors(axiosInstance);

/**
 * Custom instance untuk Orval
 */
export const customInstance = <T>(
  url: string,
  options?: RequestInit
): PromiseWithCancel<AxiosResponse<T>> => { // Pastikan mengembalikan AxiosResponse
  const source = axios.CancelToken.source();

  let parsedBody: unknown = undefined;
  if (options?.body) {
    try {
      parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch {
      parsedBody = options.body;
    }
  }

  const headers: Record<string, string> = {};
  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => { headers[key] = value; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => { headers[key] = value; });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: (options?.method as AxiosRequestConfig['method']) || 'GET',
    headers,
    data: parsedBody,
    cancelToken: source.token,
  };

  // Kembalikan response utuh agar .status dan .data bisa diakses di AuthProvider
  const promise = axiosInstance(axiosConfig) as PromiseWithCancel<AxiosResponse<T>>;

  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default axiosInstance;