// frontend/src/core/services/http/apiClient.ts

import { http } from './axiosInstance';
import { API_ENDPOINTS } from '@/core/constants/api.constants';
import type { 
  ApiResponse, 
  PaginatedResponse,
  // Auth Types
  LoginDto,
  LoginResponse,
  VerifyTokenDto,
  UpdateProfileDto,
  // User Types
  User,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  PasswordChangeResponseDto,
  UserStatistics,
  // Patient Types
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  PatientStatistics,
  // Appointment Types
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  // Medical Record Types
  MedicalRecord,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  // Notification Types
  Notification,
  NotificationStatsDto,
  // Role Types
  Role,
  // Health Types
  HealthCheckResponse,
} from '@/core/types/api';

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
  async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
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

    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || 'download';
    link.click();
    window.URL.revokeObjectURL(link.href);
  },
};

// ============================================
// HEALTH CHECK API
// ============================================
export const healthApi = {
  check: () => apiClient.get<HealthCheckResponse>(API_ENDPOINTS.HEALTH.BASE),
  details: () => apiClient.get(API_ENDPOINTS.HEALTH.DETAILS),
  liveness: () => apiClient.get(API_ENDPOINTS.HEALTH.LIVE),
  readiness: () => apiClient.get(API_ENDPOINTS.HEALTH.READY),
};

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (data: LoginDto) => 
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data),
  
  logout: () => 
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  
  refresh: () => 
    apiClient.post<{ access_token: string }>(API_ENDPOINTS.AUTH.REFRESH),
  
  verify: (token: string) =>
    apiClient.post<User>(API_ENDPOINTS.AUTH.VERIFY, { token }),
  
  me: () => 
    apiClient.get<User>(API_ENDPOINTS.AUTH.ME),
  
  updateProfile: (data: UpdateProfileDto) =>
    apiClient.patch<User>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
};

// ============================================
// USERS API
// ============================================
export const usersApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated<User>(API_ENDPOINTS.USERS.BASE, params),
  
  getById: (id: number) => 
    apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id)),
  
  create: (data: CreateUserDto) => 
    apiClient.post<User>(API_ENDPOINTS.USERS.BASE, data),
  
  update: (id: number, data: UpdateUserDto) =>
    apiClient.patch<User>(API_ENDPOINTS.USERS.DETAIL(id), data),
  
  delete: (id: number) => 
    apiClient.delete<{ message: string }>(API_ENDPOINTS.USERS.DETAIL(id)),
  
  statistics: () => 
    apiClient.get<UserStatistics>(API_ENDPOINTS.USERS.STATISTICS),
  
  recent: (limit?: number) =>
    apiClient.get<User[]>(API_ENDPOINTS.USERS.RECENT, { limit }),
  
  checkUsername: (username: string) =>
    apiClient.get<{ available: boolean; message: string }>(
      API_ENDPOINTS.USERS.CHECK_USERNAME(username)
    ),
  
  changePassword: (data: ChangePasswordDto) =>
    apiClient.post<PasswordChangeResponseDto>(
      API_ENDPOINTS.USERS.CHANGE_PASSWORD, 
      data
    ),
  
  resetPassword: (id: number, data: ResetPasswordDto) =>
    apiClient.post<PasswordChangeResponseDto>(
      API_ENDPOINTS.USERS.RESET_PASSWORD(id), 
      data
    ),
  
  generateTempPassword: (id: number) =>
    apiClient.post<{ temporaryPassword: string; message: string }>(
      API_ENDPOINTS.USERS.GENERATE_TEMP_PASSWORD(id)
    ),
};

// ============================================
// ROLES API
// ============================================
export const rolesApi = {
  getAll: () => 
    apiClient.get<Role[]>(API_ENDPOINTS.ROLES.BASE),
  
  getById: (id: number) => 
    apiClient.get<Role>(API_ENDPOINTS.ROLES.DETAIL(id)),
};

// ============================================
// PATIENTS API
// ============================================
export const patientsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated<Patient>(API_ENDPOINTS.PATIENTS.BASE, params),
  
  getById: (id: number) => 
    apiClient.get<Patient>(API_ENDPOINTS.PATIENTS.DETAIL(id)),
  
  create: (data: CreatePatientDto) => 
    apiClient.post<Patient>(API_ENDPOINTS.PATIENTS.BASE, data),
  
  update: (id: number, data: UpdatePatientDto) =>
    apiClient.patch<Patient>(API_ENDPOINTS.PATIENTS.DETAIL(id), data),
  
  delete: (id: number) => 
    apiClient.delete<{ message: string }>(API_ENDPOINTS.PATIENTS.DETAIL(id)),
  
  search: (params?: any) =>
    apiClient.getPaginated<Patient>(API_ENDPOINTS.PATIENTS.SEARCH, params),
  
  statistics: () => 
    apiClient.get<PatientStatistics>(API_ENDPOINTS.PATIENTS.STATISTICS),
  
  getByMedicalRecord: (number: string) =>
    apiClient.get<Patient>(API_ENDPOINTS.PATIENTS.BY_MEDICAL_RECORD(number)),
  
  getByNik: (nik: string) => 
    apiClient.get<Patient>(API_ENDPOINTS.PATIENTS.BY_NIK(nik)),
  
  getByDoctor: (doctorId: number, params?: any) =>
    apiClient.getPaginated<Patient>(
      API_ENDPOINTS.PATIENTS.BY_DOCTOR(doctorId), 
      params
    ),
  
  restore: (id: number) =>
    apiClient.patch<{ message: string }>(API_ENDPOINTS.PATIENTS.RESTORE(id)),
};

// ============================================
// APPOINTMENTS API
// ============================================
export const appointmentsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, params),
  
  getById: (id: number) =>
    apiClient.get<Appointment>(API_ENDPOINTS.APPOINTMENTS.DETAIL(id)),
  
  create: (data: CreateAppointmentDto) => 
    apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, data),
  
  update: (id: number, data: UpdateAppointmentDto) =>
    apiClient.patch<Appointment>(API_ENDPOINTS.APPOINTMENTS.DETAIL(id), data),
  
  delete: (id: number) =>
    apiClient.delete<{ message: string }>(API_ENDPOINTS.APPOINTMENTS.DETAIL(id)),
  
  complete: (id: number) =>
    apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.COMPLETE(id)),
  
  cancel: (id: number) =>
    apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.CANCEL(id)),
};

// ============================================
// MEDICAL RECORDS API
// ============================================
export const medicalRecordsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated<MedicalRecord>(
      API_ENDPOINTS.MEDICAL_RECORDS.BASE, 
      params
    ),
  
  getById: (id: number) =>
    apiClient.get<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id)),
  
  create: (data: CreateMedicalRecordDto) => 
    apiClient.post<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.BASE, data),
  
  update: (id: number, data: UpdateMedicalRecordDto) =>
    apiClient.patch<MedicalRecord>(
      API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id), 
      data
    ),
  
  delete: (id: number) =>
    apiClient.delete<{ message: string }>(
      API_ENDPOINTS.MEDICAL_RECORDS.DETAIL(id)
    ),
  
  search: (params?: any) =>
    apiClient.getPaginated<MedicalRecord>(
      API_ENDPOINTS.MEDICAL_RECORDS.SEARCH, 
      params
    ),
  
  getByAppointment: (appointmentId: number) =>
    apiClient.get<MedicalRecord>(
      API_ENDPOINTS.MEDICAL_RECORDS.BY_APPOINTMENT(appointmentId)
    ),
  
  restore: (id: number) =>
    apiClient.post<{ message: string }>(
      API_ENDPOINTS.MEDICAL_RECORDS.RESTORE(id)
    ),
  
  permanentDelete: (id: number) =>
    apiClient.delete(API_ENDPOINTS.MEDICAL_RECORDS.PERMANENT_DELETE(id)),
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  getAll: (params?: any) =>
    apiClient.getPaginated<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.BASE, 
      params
    ),
  
  getById: (id: number) =>
    apiClient.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)),
  
  statistics: () => 
    apiClient.get<NotificationStatsDto>(API_ENDPOINTS.NOTIFICATIONS.STATISTICS),
  
  getFailed: (limit?: number) =>
    apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.FAILED, { limit }),
  
  retry: (id: number) =>
    apiClient.post(API_ENDPOINTS.NOTIFICATIONS.RETRY(id)),
  
  retryAllFailed: (limit?: number) =>
    apiClient.post(API_ENDPOINTS.NOTIFICATIONS.RETRY_ALL_FAILED, { limit }),
  
  jobs: {
    status: () => 
      apiClient.get(API_ENDPOINTS.NOTIFICATIONS.JOBS.STATUS),
    
    triggerManual: () =>
      apiClient.post(API_ENDPOINTS.NOTIFICATIONS.JOBS.TRIGGER_MANUAL),
    
    stopAll: () => 
      apiClient.post(API_ENDPOINTS.NOTIFICATIONS.JOBS.STOP_ALL),
    
    startAll: () => 
      apiClient.post(API_ENDPOINTS.NOTIFICATIONS.JOBS.START_ALL),
  },
};

export default apiClient;