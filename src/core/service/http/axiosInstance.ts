import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors } from './interceptors';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

console.log('🔧 Axios baseURL:', baseURL);

const axiosInstance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false, // Set to true if your backend requires credentials
});

export type PromiseWithCancel<T> = Promise<T> & {
  cancel: () => void;
};

setupInterceptors(axiosInstance);

/**
 * Custom instance untuk Orval
 * Mengkonversi Fetch API RequestInit ke Axios config
 */
export const customInstance = <T>(
  url: string,
  options?: RequestInit
): PromiseWithCancel<T> => {
  const source = axios.CancelToken.source();

  // Parse body if exists
  let parsedBody: unknown = undefined;
  if (options?.body) {
    try {
      if (typeof options.body === 'string') {
        parsedBody = JSON.parse(options.body);
      } else {
        parsedBody = options.body;
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      parsedBody = options.body;
    }
  }

  // Convert Fetch API headers to Axios format
  const headers: Record<string, string> = {};
  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  // Build Axios config
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: (options?.method as AxiosRequestConfig['method']) || 'GET',
    headers,
    data: parsedBody,
    cancelToken: source.token,
  };

  console.log('📤 API Request:', {
    baseURL: axiosInstance.defaults.baseURL,
    url: axiosConfig.url,
    method: axiosConfig.method,
    fullURL: `${axiosInstance.defaults.baseURL}${url}`,
    hasData: !!axiosConfig.data,
    hasAuth: !!headers.Authorization
  });

  const promise = axiosInstance(axiosConfig)
    .then(({ data }) => {
      console.log('✅ API Response:', {
        url: axiosConfig.url,
        status: 'success',
        hasData: !!data
      });
      return data;
    })
    .catch((error) => {
      console.error('❌ API Error:', {
        url: axiosConfig.url,
        method: axiosConfig.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }) as PromiseWithCancel<T>;

  promise.cancel = () => {
    console.log('🚫 Request cancelled:', url);
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default axiosInstance;