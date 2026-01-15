// frontend/src/core/services/http/axiosInstance.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { setupInterceptors } from './interceptors';

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

setupInterceptors(axiosInstance);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): PromiseWithCancel<T> => {
  const source = axios.CancelToken.source();

  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data) as PromiseWithCancel<T>;

  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default axiosInstance;