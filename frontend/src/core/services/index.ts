// Update: frontend/src/core/services/index.ts
export * from './cache/cache.service';
export * from './cache/storage.service';
export * from './http/axiosInstance';
export * from './http/interceptors';
export * from './api/apiClient';
export * from './api';

export { cacheService } from './cache/cache.service';
export { storageService } from './cache/storage.service';
export { apiClient } from './api/apiClient';
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