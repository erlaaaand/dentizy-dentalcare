import api from './axiosInstance';
import {CreatePatientDto, UpdatePatientDto, SearchPatientDto} from '@/types/api';

interface PaginatedPatientsResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * ✅ FIXED: GET /patients dengan pagination
 */
export const getAllPatients = async (params?: SearchPatientDto): Promise<PaginatedPatientsResponse> => {
  try {
    const response = await api.get('/patients', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal mengambil data pasien');
  }
};

/**
 * ✅ FIXED: GET /patients/search
 */
export const searchPatients = async (params: SearchPatientDto): Promise<PaginatedPatientsResponse> => {
  try {
    const response = await api.get('/patients/search', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal mencari pasien');
  }
};

/**
 * ✅ FIXED: GET /patients/:id
 */
export const getPatientById = async (id: number) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Gagal mengambil data pasien`);
  }
};

/**
 * ✅ FIXED: GET /patients/by-medical-record/:number
 */
export const getPatientByMedicalRecord = async (number: string) => {
  try {
    const response = await api.get(`/patients/by-medical-record/${number}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Pasien tidak ditemukan');
  }
};

/**
 * ✅ FIXED: GET /patients/by-nik/:nik
 */
export const getPatientByNik = async (nik: string) => {
  try {
    const response = await api.get(`/patients/by-nik/${nik}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Pasien tidak ditemukan');
  }
};

/**
 * ✅ FIXED: POST /patients
 */
export const createPatient = async (data: CreatePatientDto) => {
  try {
    const response = await api.post('/patients', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal membuat pasien baru');
  }
};

/**
 * ✅ FIXED: PATCH /patients/:id (bukan PUT!)
 */
export const updatePatient = async (id: number, data: UpdatePatientDto) => {
  try {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal mengupdate pasien');
  }
};

/**
 * ✅ FIXED: DELETE /patients/:id
 */
export const deletePatient = async (id: number) => {
  try {
    await api.delete(`/patients/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal menghapus pasien');
  }
};