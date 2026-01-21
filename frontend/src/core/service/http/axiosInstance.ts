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
});

export type PromiseWithCancel<T> = Promise<T> & {
  cancel: () => void;
};

setupInterceptors(axiosInstance);

// Fix customInstance untuk handle body dari Fetch API
export const customInstance = <T>(
  url: string,
  options?: RequestInit
): PromiseWithCancel<T> => {
  const source = axios.CancelToken.source();

  // Convert Fetch API RequestInit to Axios config
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: options?.method || 'GET',
    headers: options?.headers as Record<string, string>,
    // Convert body to data for Axios
    data: options?.body ? JSON.parse(options.body as string) : undefined,
    cancelToken: source.token,
  };

  console.log('📤 Request Config:', {
    baseURL: axiosInstance.defaults.baseURL,
    url: axiosConfig.url,
    method: axiosConfig.method,
    fullURL: `${axiosInstance.defaults.baseURL}${url}`,
    data: axiosConfig.data
  });

  const promise = axiosInstance(axiosConfig)
    .then(({ data }) => data) as PromiseWithCancel<T>;

  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default axiosInstance;