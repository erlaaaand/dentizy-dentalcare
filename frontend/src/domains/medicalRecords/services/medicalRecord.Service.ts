import api from './axiosInstance';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from '@/core/types/api';

/**
 * ✅ FIXED: GET /medical-records
 */
export const getAllMedicalRecords = async () => {
  try {
    const response = await api.get('/medical-records');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal mengambil rekam medis');
  }
};

/**
 * ✅ FIXED: GET /medical-records/:id
 */
export const getMedicalRecordById = async (id: number) => {
  try {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal mengambil rekam medis');
  }
};

/**
 * ✅ FIXED: GET /medical-records/by-appointment/:appointmentId
 */
export const getMedicalRecordByAppointmentId = async (appointmentId: number) => {
  try {
    const response = await api.get(`/medical-records/by-appointment/${appointmentId}`);
    return response.data;
  } catch (error: any) {
    // Return null jika tidak ditemukan (404)
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || 'Gagal mengambil rekam medis');
  }
};

/**
 * ✅ FIXED: POST /medical-records
 */
export const createMedicalRecord = async (data: CreateMedicalRecordDto) => {
  try {
    const response = await api.post('/medical-records', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal membuat rekam medis');
  }
};

/**
 * ✅ FIXED: PATCH /medical-records/:id
 */
export const updateMedicalRecord = async (id: number, data: UpdateMedicalRecordDto) => {
  try {
    const response = await api.patch(`/medical-records/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal mengupdate rekam medis');
  }
};

/**
 * ✅ FIXED: DELETE /medical-records/:id
 */
export const deleteMedicalRecord = async (id: number) => {
  try {
    await api.delete(`/medical-records/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Gagal menghapus rekam medis');
  }
};