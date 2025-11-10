import api from './axiosInstance';
import { Patient, PaginatedResponse } from '@/types/api';

interface GetPatientsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface GetPatientsByDoctorParams extends GetPatientsParams {
  doctor_id: number | string;
}

/**
 * Get all patients (Admin/Staff)
 */
export const getAllPatients = async (params?: GetPatientsParams): Promise<PaginatedResponse<Patient>> => {
  try {
    // Remove undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined)
    );

    const response = await api.get<PaginatedResponse<Patient>>('/patients', {
      params: cleanParams
    });

    if (!response.data) {
      throw new Error('Invalid response structure from server');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    throw new Error(error.response?.data?.message || 'Gagal memuat data pasien');
  }
};

/**
 * Get patients by doctor (Doctor role)
 * Backend expects: GET /patients/by-doctor/:doctorId?page=1&limit=10&search=...
 */
export const getPatientsByDoctor = async (params: GetPatientsByDoctorParams): Promise<PaginatedResponse<Patient>> => {
  try {
    // Extract doctorId and other params
    const { doctor_id, ...queryParams } = params;

    // Validate doctorId
    if (!doctor_id) {
      throw new Error('Doctor ID is required');
    }

    // Remove undefined values from query params
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined)
    );

    // Use path parameter for doctorId
    const response = await api.get<PaginatedResponse<Patient>>(`/patients/by-doctor/${doctor_id}`, {
      params: cleanParams
    });

    if (!response.data) {
      throw new Error('Invalid response structure from server');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error fetching patients by doctor:', error);
    throw new Error(error.response?.data?.message || 'Gagal memuat data pasien dokter');
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (id: number | string): Promise<Patient> => {
  try {
    const response = await api.get<Patient>(`/patients/${id}`);

    if (!response.data) {
      throw new Error('Patient not found');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error fetching patient:', error);
    throw new Error(error.response?.data?.message || 'Gagal memuat data pasien');
  }
};

/**
 * Create new patient
 */
export const createPatient = async (data: Partial<Patient>): Promise<Patient> => {
  try {
    const response = await api.post<Patient>('/patients', data);

    if (!response.data) {
      throw new Error('Failed to create patient');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error creating patient:', error);
    throw new Error(error.response?.data?.message || 'Gagal menambahkan pasien');
  }
};

/**
 * Update patient
 */
export const updatePatient = async (id: number | string, data: Partial<Patient>): Promise<Patient> => {
  try {
    const response = await api.patch<Patient>(`/patients/${id}`, data);

    if (!response.data) {
      throw new Error('Failed to update patient');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error updating patient:', error);
    throw new Error(error.response?.data?.message || 'Gagal mengupdate pasien');
  }
};

/**
 * Delete patient
 */
export const deletePatient = async (id: number | string): Promise<void> => {
  try {
    await api.delete(`/patients/${id}`);
  } catch (error: any) {
    console.error('Error deleting patient:', error);
    throw new Error(error.response?.data?.message || 'Gagal menghapus pasien');
  }
};

/**
 * Search patients
 */
export const searchPatients = async (query: string, params?: GetPatientsParams): Promise<PaginatedResponse<Patient>> => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries({
        ...params,
        search: query,
      }).filter(([_, v]) => v !== undefined)
    );

    const response = await api.get<PaginatedResponse<Patient>>('/patients/search', {
      params: cleanParams
    });

    if (!response.data) {
      throw new Error('Invalid response structure from server');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error searching patients:', error);
    throw new Error(error.response?.data?.message || 'Gagal mencari pasien');
  }
};