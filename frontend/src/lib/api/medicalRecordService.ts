import { 
  MedicalRecord, 
  CreateMedicalRecordDto, 
  UpdateMedicalRecordDto,
  ApiResponse,
  PaginatedResponse,
  ID
} from '@/types/api';
import { apiClient } from './client';

const BASE_URL = '/medical-records';

/**
 * Medical Record Service
 */
export const medicalRecordService = {
  /**
   * Get all medical records
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    patientId?: ID;
    doctorId?: ID;
  }): Promise<PaginatedResponse<MedicalRecord>> {
    const response = await apiClient.get<PaginatedResponse<MedicalRecord>>(BASE_URL, { params });
    return response.data;
  },
  
  /**
   * Get medical record by ID
   */
  async getById(id: ID): Promise<MedicalRecord> {
    const response = await apiClient.get<ApiResponse<MedicalRecord>>(`${BASE_URL}/${id}`);
    return response.data.data!;
  },
  
  /**
   * Get medical record by appointment ID
   */
  async getByAppointmentId(appointmentId: ID): Promise<MedicalRecord | null> {
    try {
      const response = await apiClient.get<ApiResponse<MedicalRecord>>(
        `${BASE_URL}/appointment/${appointmentId}`
      );
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  /**
   * Get medical records by patient ID
   */
  async getByPatientId(patientId: ID, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MedicalRecord>> {
    const response = await apiClient.get<PaginatedResponse<MedicalRecord>>(
      `${BASE_URL}/patient/${patientId}`,
      { params }
    );
    return response.data;
  },
  
  /**
   * Create new medical record
   */
  async create(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>(BASE_URL, data);
    return response.data.data!;
  },
  
  /**
   * Update medical record
   */
  async update(id: ID, data: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await apiClient.put<ApiResponse<MedicalRecord>>(`${BASE_URL}/${id}`, data);
    return response.data.data!;
  },
  
  /**
   * Delete medical record
   */
  async delete(id: ID): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
  
  /**
   * Export medical record to PDF
   */
  async exportToPDF(id: ID): Promise<Blob> {
    const response = await apiClient.get(`${BASE_URL}/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Print medical record
   */
  async print(id: ID): Promise<void> {
    const blob = await this.exportToPDF(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-record-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};