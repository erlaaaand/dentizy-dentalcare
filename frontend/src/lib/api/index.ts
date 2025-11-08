/**
 * Complete API Services Export
 * ✅ FIXED: Disesuaikan dengan backend endpoints yang sebenarnya
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
    // ✅ FIXED: Backend menggunakan PATCH bukan PUT
    const response = await apiClient.patch<ApiResponse<Patient>>(`/patients/${id}`, data);
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
  /**
   * ✅ Get all appointments with filters
   * Backend: GET /appointments
   * Returns: { data, count, page, limit, totalPages }
   */
  async getAll(params?: AppointmentFilters) {
    const response = await apiClient.get('/appointments', { params });
    // Backend returns { data, count, page, limit, totalPages }
    return {
      data: response.data.data || [],
      count: response.data.count || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 10,
      totalPages: response.data.totalPages || 0
    };
  },

  /**
   * ✅ Get appointment by ID
   * Backend: GET /appointments/:id
   */
  async getById(id: ID) {
    const response = await apiClient.get(`/appointments/${id}`);
    // Backend returns appointment object directly
    return response.data;
  },

  /**
   * ✅ Create new appointment
   * Backend: POST /appointments
   */
  async create(data: CreateAppointmentDto) {
    // Ensure time format is HH:mm:ss
    const formattedData = {
      ...data,
      jam_janji: data.jam_janji.includes(':00') ? data.jam_janji : `${data.jam_janji}:00`
    };

    const response = await apiClient.post('/appointments', formattedData);
    return response.data;
  },

  /**
   * ✅ FIXED: Update appointment
   * Backend: PATCH /appointments/:id (bukan PUT!)
   */
  async update(id: ID, data: UpdateAppointmentDto) {
    // Ensure time format is HH:mm:ss if provided
    if (data.jam_janji && !data.jam_janji.includes(':00')) {
      data.jam_janji = `${data.jam_janji}:00`;
    }

    const response = await apiClient.patch(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * ✅ Complete appointment
   * Backend: POST /appointments/:id/complete
   */
  async complete(id: ID) {
    const response = await apiClient.post(`/appointments/${id}/complete`);
    return response.data;
  },

  /**
   * ✅ Cancel appointment
   * Backend: POST /appointments/:id/cancel
   */
  async cancel(id: ID) {
    const response = await apiClient.post(`/appointments/${id}/cancel`);
    return response.data;
  },

  /**
   * ✅ Delete appointment
   * Backend: DELETE /appointments/:id
   */
  async delete(id: ID) {
    await apiClient.delete(`/appointments/${id}`);
  },

  // ❌ REMOVED: Endpoint ini tidak ada di backend
  // async updateStatus(id: ID, status: AppointmentStatus) { ... }

  // ❌ REMOVED: Endpoint ini tidak ada di backend
  // async getAvailableSlots(date: string, doctorId: ID) { ... }
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
    // Filter users dengan role=dokter
    const response = await apiClient.get<ApiResponse<User[]>>('/users', {
      params: { role: 'dokter' }
    });
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