import { AxiosRequestConfig } from 'axios';
import { customInstance, PromiseWithCancel } from '@/core/services/http/axiosInstance';

export const orvalAxios = <T>(
    config: AxiosRequestConfig,
): PromiseWithCancel<T> => {
    return customInstance<T>(config);
};
