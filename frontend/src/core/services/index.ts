// Update: frontend/src/core/services/index.ts
export * from './cache/cache.service';
export * from './cache/storage.service';
export * from './http/axiosInstance';
export * from './http/interceptors';
export * from './http/apiClient';
export * from './api/index';

export { cacheService } from './cache/cache.service';
export { storageService } from './cache/storage.service';
export { apiClient } from './http/apiClient';
export { customInstance } from './http/axiosInstance';
export { setupInterceptors } from './http/interceptors';

export {
    authAPI,
    appointmentAPI,
    patientAPI,
    medicalRecordAPI,
    userAPI,
    roleAPI,
} from './api';