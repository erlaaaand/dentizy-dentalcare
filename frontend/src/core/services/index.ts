// Export API client and services
export { default as apiClient } from './http/apiClient';
export { http, default as axiosInstance } from './http/axiosInstance';

export {
    authApi,
    usersApi,
    rolesApi,
    patientsApi,
    appointmentsApi,
    medicalRecordsApi,
    notificationsApi,
    healthApi,
} from './http/apiClient';

export {
    default as services,
    authService,
    userService,
    roleService,
    patientService,
    appointmentService,
    medicalRecordService,
    notificationService,
    healthService,
    getCurrentUser,
    hasRole,
    hasAnyRole,
    hasAllRoles,
} from './api';