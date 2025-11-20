// frontend/src/core/services/http/apiClient.ts

import { http } from './axiosInstance';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import { ApiResponse, PaginatedResponse } from '@/core/types/api';

/**
 * API Client Service
 * Wrapper untuk semua HTTP requests dengan type safety
 */
export const apiClient = {
  /**
   * Generic GET request
   */
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await http.get<ApiResponse<T>>(url, { params });
    return response.data;
  },

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await http.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await http.put<ApiResponse<T>>(url, data);
    return response.data;
  },

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await http.patch<ApiResponse<T>>(url, data);
    return response.data;
  },

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await http.delete<ApiResponse<T>>(url);
    return response.data;
  },

  /**
   * GET with pagination
   */
  async getPaginated<T>(
    url: string,
    params?: any
  ): Promise<PaginatedResponse<T>> {
    const response = await http.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  },

  /**
   * Upload file
   */
  async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await http.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Download file
   */
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await http.get(url, {
      responseType: 'blob',
    });

    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || 'download';
    link.click();

    // Clean up
    window.URL.revokeObjectURL(link.href);
  },
};

/**
 * Specific API Services
 */

// Health Check
export const healthApi = {
  check: () => apiClient.get(API_ENDPOINTS.HEALTH.BASE),
  details: () => apiClient.get(API_ENDPOINTS.HEALTH.DETAILS),
  liveness: () => apiClient.get(API_ENDPOINTS.HEALTH.LIVE),
  readiness: () => apiClient.get(API_ENDPOINTS.HEALTH.READY),
};

// Auth API
export const authApi = {
  login: (data: any) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data),
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  refresh: () => apiClient.post(API_ENDPOINTS.AUTH.REFRESH),
  verify: (token: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY, { token }),
  me: () => apiClient.get(API_ENDPOINTS.AUTH.ME),
  updateProfile: (data: any) =>
    apiClient.patch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
};

// Users API
export const usersApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.USERS.BASE, params),
  getById: (id: number) => apiClient.get(API_ENDPOINTS.USERS.DETAIL(id)),
  create: (data: any) => apiClient.post(API_ENDPOINTS.USERS.BASE, data),
  update: (id: number, data: any) =>
    apiClient.patch(API_ENDPOINTS.USERS.DETAIL(id), data),
  delete: (id: number) => apiClient.delete(API_ENDPOINTS.USERS.DETAIL(id)),
  statistics: () => apiClient.get(API_ENDPOINTS.USERS.STATISTICS),
  recent: (limit?: number) =>
    apiClient.get(API_ENDPOINTS.USERS.RECENT, { limit }),
  checkUsername: (username: string) =>
    apiClient.get(API_ENDPOINTS.USERS.CHECK_USERNAME(username)),
  changePassword: (data: any) =>
    apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data),
  resetPassword: (id: number, data: any) =>
    apiClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id), data),
  generateTempPassword: (id: number) =>
    apiClient.post(API_ENDPOINTS.USERS.GENERATE_TEMP_PASSWORD(id)),
};

// Roles API
export const rolesApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.ROLES.BASE),
  getById: (id: number) => apiClient.get(API_ENDPOINTS.ROLES.DETAIL(id)),
};

// Patients API
export const patientsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.PATIENTS.BASE, params),
  getById: (id: number) => apiClient.get(API_ENDPOINTS.PATIENTS.DETAIL(id)),
  create: (data: any) => apiClient.post(API_ENDPOINTS.PATIENTS.BASE, data),
  update: (id: number, data: any) =>
    apiClient.patch(API_ENDPOINTS.PATIENTS.DETAIL(id), data),
  delete: (id: number) => apiClient.delete(API_ENDPOINTS.PATIENTS.DETAIL(id)),
  search: (params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.PATIENTS.SEARCH, params),
  statistics: () => apiClient.get(API_ENDPOINTS.PATIENTS.STATISTICS),
  getByMedicalRecord: (number: string) =>
    apiClient.get(API_ENDPOINTS.PATIENTS.BY_MEDICAL_RECORD(number)),
  getByNik: (nik: string) => apiClient.get(API_ENDPOINTS.PATIENTS.BY_NIK(nik)),
  getByDoctor: (doctorId: number, params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.PATIENTS.BY_DOCTOR(doctorId), params),
  restore: (id: number) =>
    apiClient.patch(API_ENDPOINTS.PATIENTS.RESTORE(id)),
};

// Appointments API
export const appointmentsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.APPOINTMENTS.BASE, params),
  getById: (id: number) =>
    apiClient.get(API_ENDPOINTS.APPOINTMENTS.DETAIL(id)),
  create: (data: any) => apiClient.post(API_ENDPOINTS.APPOINTMENTS.BASE, data),
  update: (id: number, data: any) =>
    apiClient.patch(API_ENDPOINTS.APPOINTMENTS.DETAIL(id), data),
  delete: (id: number) =>
    apiClient.delete(API_ENDPOINTS.APPOINTMENTS.DETAIL(id)),
  complete: (id: number) =>
    apiClient.post(API_ENDPOINTS.APPOINTMENTS.COMPLETE(id)),
  cancel: (id: number) =>
    apiClient.post(API_ENDPOINTS.APPOINTMENTS.CANCEL(id)),
};

// Medical Records API
export const medicalRecordsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.MEDICAL_RECORDS.BASE, params),
  getById: (id: number) =>
    apiClient.get(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id)),
  create: (data: any) =>
    apiClient.post(API_ENDPOINTS.MEDICAL_RECORDS.BASE, data),
  update: (id: number, data: any) =>
    apiClient.patch(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id), data),
  delete: (id: number) =>
    apiClient.delete(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id)),
  search: (params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.MEDICAL_RECORDS.SEARCH, params),
  getByAppointment: (appointmentId: number) =>
    apiClient.get(API_ENDPOINTS.MEDICAL_RECORDS.BY_APPOINTMENT(appointmentId)),
  restore: (id: number) =>
    apiClient.post(API_ENDPOINTS.MEDICAL_RECORDS.RESTORE(id)),
  permanentDelete: (id: number) =>
    apiClient.delete(API_ENDPOINTS.MEDICAL_RECORDS.PERMANENT_DELETE(id)),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated(API_ENDPOINTS.NOTIFICATIONS.BASE, params),
  getById: (id: number) =>
    apiClient.get(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)),
  statistics: () => apiClient.get(API_ENDPOINTS.NOTIFICATIONS.STATISTICS),
  getFailed: (limit?: number) =>
    apiClient.get(API_ENDPOINTS.NOTIFICATIONS.FAILED, { limit }),
  retry: (id: number) =>
    apiClient.post(API_ENDPOINTS.NOTIFICATIONS.RETRY(id)),
  retryAllFailed: (limit?: number) =>
    apiClient.post(API_ENDPOINTS.NOTIFICATIONS.RETRY_ALL_FAILED, { limit }),
  jobs: {
    status: () => apiClient.get(API_ENDPOINTS.NOTIFICATIONS.JOBS.STATUS),
    triggerManual: () =>
      apiClient.post(API_ENDPOINTS.NOTIFICATIONS.JOBS.TRIGGER_MANUAL),
    stopAll: () => apiClient.post(API_ENDPOINTS.NOTIFICATIONS.JOBS.STOP_ALL),
    startAll: () => apiClient.post(API_ENDPOINTS.NOTIFICATIONS.JOBS.START_ALL),
  },
};

export default apiClient;