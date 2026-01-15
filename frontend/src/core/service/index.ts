// frontend/src/core/services/index.ts
export * from './cache/cache.service';
export * from './cache/storage.service';
export * from './http/axiosInstance';
export * from './http/interceptors';

// Export API hooks
// export * from './api/appointment.api';
// export * from './api/auth.api';
// export * from './api/patient.api';
// export * from './api/medicalRecord.api';
// export * from './api/user.api';
// export * from './api/role.api';
// export * from './api/notification.api';
// export * from './api/treatments.api';
// export * from './api/treatment-categories.api';
// export * from './api/medical-record-treatments.api'
// export * from './api/payments.api'

// Export service instances
export { cacheService } from './cache/cache.service';
export { storageService, sessionStorageService } from './cache/storage.service';
export { customInstance } from './http/axiosInstance';
export { setupInterceptors } from './http/interceptors';