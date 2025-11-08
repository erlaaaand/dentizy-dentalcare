/**
 * Complete API Services Export
 * This file aggregates all API service modules
 */

import { apiClient, handleApiError, extractValidationErrors } from '@/lib/api/client';
import { 
  User, Patient, Appointment, MedicalRecord, Role,
  CreatePatientDto, UpdatePatientDto, PatientSearchParams,
  CreateAppointmentDto, UpdateAppointmentDto, AppointmentFilters,
  CreateUserDto, UpdateUserDto, UserFilters,
  ApiResponse, PaginatedResponse, ID, AppointmentStatus
} from '@/types/api';

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  async login(username: string, password: string) {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },
  
  async getProfile() {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },
  
  async changePassword(oldPassword: string, newPassword: string) {
    const response = await apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

// ============================================
// PATIENT SERVICE
// ============================================
export const patientService = {
  async getAll(params?: PatientSearchParams) {
    const response = await apiClient.get<PaginatedResponse<Patient>>('/patients', { params });
    return response.data;
  },
  
  async getById(id: ID) {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data!;
  },
  
  async search(query: string) {
    const response = await apiClient.get<ApiResponse<Patient[]>>('/patients/search', {
      params: { q: query },
    });
    return response.data.data!;
  },
  
  async create(data: CreatePatientDto) {
    const response = await apiClient.post<ApiResponse<Patient>>('/patients', data);
    return response.data.data!;
  },
  
  async update(id: ID, data: UpdatePatientDto) {
    const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return response.data.data!;
  },
  
  async delete(id: ID) {
    await apiClient.delete(`/patients/${id}`);
  },
  
  async getHistory(id: ID) {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      `/patients/${id}/appointments`
    );
    return response.data.data!;
  },
};

// ============================================
// APPOINTMENT SERVICE
// ============================================
export const appointmentService = {
  async getAll(params?: AppointmentFilters) {
    const response = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', { params });
    return response.data;
  },
  
  async getById(id: ID) {
    const response = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data!;
  },
  
  async create(data: CreateAppointmentDto) {
    const response = await apiClient.post<ApiResponse<Appointment>>('/appointments', data);
    return response.data.data!;
  },
  
  async update(id: ID, data: UpdateAppointmentDto) {
    const response = await apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}`, data);
    return response.data.data!;
  },
  
  async updateStatus(id: ID, status: AppointmentStatus) {
    const response = await apiClient.patch<ApiResponse<Appointment>>(
      `/appointments/${id}/status`,
      { status }
    );
    return response.data.data!;
  },
  
  async delete(id: ID) {
    await apiClient.delete(`/appointments/${id}`);
  },
  
  async getAvailableSlots(date: string, doctorId: ID) {
    const response = await apiClient.get<ApiResponse<string[]>>(
      '/appointments/available-slots',
      { params: { date, doctorId } }
    );
    return response.data.data!;
  },
};

// ============================================
// USER SERVICE
// ============================================
export const userService = {
  async getAll(params?: UserFilters) {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data.data!;
  },
  
  async getById(id: ID) {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },
  
  async getDoctors() {
    const response = await apiClient.get<ApiResponse<User[]>>('/users/doctors');
    return response.data.data!;
  },
  
  async create(data: CreateUserDto) {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data.data!;
  },
  
  async update(id: ID, data: UpdateUserDto) {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  },
  
  async delete(id: ID) {
    await apiClient.delete(`/users/${id}`);
  },
  
  async resetPassword(id: ID, newPassword: string) {
    const response = await apiClient.post(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
};

// ============================================
// ROLE SERVICE
// ============================================
export const roleService = {
  async getAll() {
    const response = await apiClient.get<ApiResponse<Role[]>>('/roles');
    return response.data.data!;
  },
};

// Export utilities
export { apiClient, handleApiError, extractValidationErrors };

// Export medical record and report services
export { medicalRecordService } from './medicalRecordService';
export { reportService } from './reportService';