import { ApiResponse, ID } from '@/types/api';
import { apiClient } from './client';

const BASE_URL = '/reports';

export interface AppointmentReportData {
  total: number;
  byStatus: {
    dijadwalkan: number;
    selesai: number;
    dibatalkan: number;
  };
  byDoctor: Array<{
    doctorId: ID;
    doctorName: string;
    count: number;
  }>;
  byDate: Array<{
    date: string;
    count: number;
  }>;
}

export interface PatientReportData {
  total: number;
  newPatients: number;
  byGender: {
    L: number;
    P: number;
  };
  byAgeGroup: Array<{
    range: string;
    count: number;
  }>;
  topPatients: Array<{
    patientId: ID;
    patientName: string;
    visitCount: number;
  }>;
}

export interface MedicalRecordReportData {
  total: number;
  byDoctor: Array<{
    doctorId: ID;
    doctorName: string;
    count: number;
  }>;
  completionRate: number;
}

export interface DashboardStats {
  appointments: {
    total: number;
    today: number;
    upcoming: number;
    completed: number;
  };
  patients: {
    total: number;
    newThisMonth: number;
  };
  medicalRecords: {
    total: number;
    thisMonth: number;
  };
}

/**
 * Report Service
 */
export const reportService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(`${BASE_URL}/dashboard`);
    return response.data.data!;
  },
  
  /**
   * Get appointment report
   */
  async getAppointmentReport(params: {
    startDate: string;
    endDate: string;
    doctorId?: ID;
  }): Promise<AppointmentReportData> {
    const response = await apiClient.get<ApiResponse<AppointmentReportData>>(
      `${BASE_URL}/appointments`,
      { params }
    );
    return response.data.data!;
  },
  
  /**
   * Get patient report
   */
  async getPatientReport(params: {
    startDate: string;
    endDate: string;
  }): Promise<PatientReportData> {
    const response = await apiClient.get<ApiResponse<PatientReportData>>(
      `${BASE_URL}/patients`,
      { params }
    );
    return response.data.data!;
  },
  
  /**
   * Get medical record report
   */
  async getMedicalRecordReport(params: {
    startDate: string;
    endDate: string;
    doctorId?: ID;
  }): Promise<MedicalRecordReportData> {
    const response = await apiClient.get<ApiResponse<MedicalRecordReportData>>(
      `${BASE_URL}/medical-records`,
      { params }
    );
    return response.data.data!;
  },
  
  /**
   * Export appointment report to Excel
   */
  async exportAppointmentReport(params: {
    startDate: string;
    endDate: string;
    doctorId?: ID;
  }): Promise<Blob> {
    const response = await apiClient.get(`${BASE_URL}/appointments/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Export patient report to Excel
   */
  async exportPatientReport(params: {
    startDate: string;
    endDate: string;
  }): Promise<Blob> {
    const response = await apiClient.get(`${BASE_URL}/patients/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Download report file
   */
  downloadReport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};