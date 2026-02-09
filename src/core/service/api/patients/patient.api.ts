import { BaseService } from '../../base/base.service';
import {
  patientsControllerCreate,
  patientsControllerFindAll,
  patientsControllerSearch,
  patientsControllerGetStatistics,
  patientsControllerFindByMedicalRecordNumber,
  patientsControllerFindByNik,
  patientsControllerFindByDoctor,
  patientsControllerFindOne,
  patientsControllerUpdate,
  patientsControllerRemove,
  patientsControllerActivatePatient,
  patientsControllerRestore,
  getPatientsControllerFindAllQueryKey,
  getPatientsControllerFindOneQueryKey,
  getPatientsControllerSearchQueryKey,
  getPatientsControllerGetStatisticsQueryKey,
  getPatientsControllerFindByMedicalRecordNumberQueryKey,
  getPatientsControllerFindByNikQueryKey,
  getPatientsControllerFindByDoctorQueryKey
} from '../../../api/generated/patients/patients';

import type { QueryClient } from '@tanstack/react-query';
import type {
  CreatePatientDto,
  UpdatePatientDto,
  PatientQueryParams,
  PatientSearchParams,
  PatientByDoctorParams,
  Patient,
  PatientPaginatedResponse,
  PatientStatistics
} from '../../../types/patients/patient.types';

// Re-export hooks
export {
  usePatientsControllerCreate,
  usePatientsControllerFindAll,
  usePatientsControllerSearch,
  usePatientsControllerGetStatistics,
  usePatientsControllerFindByMedicalRecordNumber,
  usePatientsControllerFindByNik,
  usePatientsControllerFindByDoctor,
  usePatientsControllerFindOne,
  usePatientsControllerUpdate,
  usePatientsControllerRemove,
  usePatientsControllerActivatePatient,
  usePatientsControllerRestore
} from '../../../api/generated/patients/patients';

// Re-export query keys
export {
  getPatientsControllerFindAllQueryKey,
  getPatientsControllerFindOneQueryKey,
  getPatientsControllerSearchQueryKey,
  getPatientsControllerGetStatisticsQueryKey,
  getPatientsControllerFindByMedicalRecordNumberQueryKey,
  getPatientsControllerFindByNikQueryKey,
  getPatientsControllerFindByDoctorQueryKey
};

class PatientsService extends BaseService {
  // ==================== QUERIES ====================
  
  async findAll(params?: PatientQueryParams): Promise<PatientPaginatedResponse> {
    const response = await patientsControllerFindAll(params);
    return response.data as unknown as PatientPaginatedResponse;
  }

  async findOne(id: string): Promise<Patient> {
    const response = await patientsControllerFindOne(id);
    return response.data as Patient;
  }

  async search(params?: PatientSearchParams): Promise<PatientPaginatedResponse> {
    const response = await patientsControllerSearch(params);
    return response.data as unknown as PatientPaginatedResponse;
  }

  async getStatistics(): Promise<PatientStatistics> {
    const response = await patientsControllerGetStatistics();
    return response.data as PatientStatistics;
  }

  async findByMedicalRecordNumber(number: string): Promise<Patient> {
    const response = await patientsControllerFindByMedicalRecordNumber(number);
    return response.data as Patient;
  }

  async findByNik(nik: string): Promise<Patient> {
    const response = await patientsControllerFindByNik(nik);
    return response.data as Patient;
  }

  async findByDoctor(doctorId: string, params?: PatientByDoctorParams): Promise<PatientPaginatedResponse> {
    const response = await patientsControllerFindByDoctor(doctorId, params);
    return response.data as unknown as PatientPaginatedResponse;
  }

  // ==================== MUTATIONS ====================
  
  async create(data: CreatePatientDto): Promise<Patient> {
    const response = await patientsControllerCreate(data);
    if (response.status === 201) {
      return response.data as Patient;
    }
    throw new Error('Failed to create patient');
  }

  async update(id: string, data: UpdatePatientDto): Promise<Patient> {
    const response = await patientsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as Patient;
    }
    throw new Error('Failed to update patient');
  }

  async remove(id: string): Promise<void> {
    const response = await patientsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove patient');
    }
  }

  async activate(id: string): Promise<Patient> {
    const response = await patientsControllerActivatePatient(id);
    if (response.status === 200) {
      return response.data as Patient;
    }
    throw new Error('Failed to activate patient');
  }

  async restore(id: string): Promise<Patient> {
    const response = await patientsControllerRestore(id);
    if (response.status === 200) {
      return response.data as Patient;
    }
    throw new Error('Failed to restore patient');
  }

  // ==================== QUERY KEYS ====================
  
  getListQueryKey(params?: PatientQueryParams) {
    return getPatientsControllerFindAllQueryKey(params);
  }

  getDetailQueryKey(id: string) {
    return getPatientsControllerFindOneQueryKey(id);
  }

  getSearchQueryKey(params?: PatientSearchParams) {
    return getPatientsControllerSearchQueryKey(params);
  }

  getStatisticsQueryKey() {
    return getPatientsControllerGetStatisticsQueryKey();
  }

  getByMedicalRecordNumberQueryKey(number: string) {
    return getPatientsControllerFindByMedicalRecordNumberQueryKey(number);
  }

  getByNikQueryKey(nik: string) {
    return getPatientsControllerFindByNikQueryKey(nik);
  }

  getByDoctorQueryKey(doctorId: string, params?: PatientByDoctorParams) {
    return getPatientsControllerFindByDoctorQueryKey(doctorId, params);
  }

  // ==================== CACHE UTILITIES ====================
  
  invalidateList(queryClient: QueryClient, params?: PatientQueryParams) {
    return this.invalidateQueries(queryClient, [...this.getListQueryKey(params)]);
  }

  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, [...this.getDetailQueryKey(id)]);
  }

  invalidateSearch(queryClient: QueryClient, params?: PatientSearchParams) {
    return this.invalidateQueries(queryClient, [...this.getSearchQueryKey(params)]);
  }

  invalidateStatistics(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, [...this.getStatisticsQueryKey()]);
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/patients']);
  }

  async prefetchList(queryClient: QueryClient, params?: PatientQueryParams) {
    return this.prefetchQuery(
      queryClient,
      [...this.getListQueryKey(params)],
      () => this.findAll(params)
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      [...this.getDetailQueryKey(id)],
      () => this.findOne(id)
    );
  }

  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: Patient) => Patient
  ) {
    const queryKey = [...this.getDetailQueryKey(id)];
    const previousData = this.getQueryData<Patient>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const patientsService = new PatientsService();

// Helper functions
export const patientsHelpers = {
  /**
   * Calculate patient age from birth date
   */
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Format NIK with spaces for readability
   */
  formatNIK(nik: string): string {
    const cleaned = nik.replace(/\D/g, '');
    return cleaned.replace(/(\d{6})(\d{6})(\d{4})/, '$1 $2 $3');
  },

  /**
   * Validate NIK format
   */
  isValidNIK(nik: string): boolean {
    const cleaned = nik.replace(/\D/g, '');
    return /^\d{16}$/.test(cleaned);
  },

  /**
   * Format phone number to standard format
   */
  formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return '+' + cleaned;
  },

  /**
   * Get age group
   */
  getAgeGroup(age: number): string {
    if (age < 18) return '0-17';
    if (age <= 30) return '18-30';
    if (age <= 50) return '31-50';
    return '51+';
  },

  /**
   * Check if patient is new (registered within last 30 days)
   */
  isNewPatient(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }
};