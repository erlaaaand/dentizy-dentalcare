import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getPatientsControllerFindAllQueryKey,
  getPatientsControllerFindOneQueryKey,
  getPatientsControllerSearchQueryKey,
  getPatientsControllerGetStatisticsQueryKey,
  getPatientsControllerFindByMedicalRecordNumberQueryKey,
  getPatientsControllerFindByNikQueryKey,
  getPatientsControllerFindByDoctorQueryKey
} from '../../../../api/generated/patients/patients';

import type {
  PatientQueryParams,
  PatientSearchParams,
  PatientByDoctorParams,
  Patient,
} from '../../../../types/patients/patient.types';

import { patientsService } from '../patient.api';

/**
 * Patients Cache Manager
 * Manages React Query cache for patients
 * Extends BaseService for common cache operations
 */
export class PatientsCacheManager extends BaseService {
  /**
   * Get list query key
   */
  getListQueryKey(params?: PatientQueryParams) {
    return getPatientsControllerFindAllQueryKey(params);
  }

  /**
   * Get detail query key
   */
  getDetailQueryKey(id: string) {
    return getPatientsControllerFindOneQueryKey(id);
  }

  /**
   * Get search query key
   */
  getSearchQueryKey(params?: PatientSearchParams) {
    return getPatientsControllerSearchQueryKey(params);
  }

  /**
   * Get statistics query key
   */
  getStatisticsQueryKey() {
    return getPatientsControllerGetStatisticsQueryKey();
  }

  /**
   * Get by medical record number query key
   */
  getByMedicalRecordNumberQueryKey(number: string) {
    return getPatientsControllerFindByMedicalRecordNumberQueryKey(number);
  }

  /**
   * Get by NIK query key
   */
  getByNikQueryKey(nik: string) {
    return getPatientsControllerFindByNikQueryKey(nik);
  }

  /**
   * Get by doctor query key
   */
  getByDoctorQueryKey(doctorId: string, params?: PatientByDoctorParams) {
    return getPatientsControllerFindByDoctorQueryKey(doctorId, params);
  }

  /**
   * Invalidate list
   */
  invalidateList(queryClient: QueryClient, params?: PatientQueryParams): Promise<void> {
    return this.invalidateQueries(queryClient, [...this.getListQueryKey(params)]);
  }

  /**
   * Invalidate detail
   */
  invalidateDetail(queryClient: QueryClient, id: string): Promise<void> {
    return this.invalidateQueries(queryClient, [...this.getDetailQueryKey(id)]);
  }

  /**
   * Invalidate search
   */
  invalidateSearch(queryClient: QueryClient, params?: PatientSearchParams): Promise<void> {
    return this.invalidateQueries(queryClient, [...this.getSearchQueryKey(params)]);
  }

  /**
   * Invalidate statistics
   */
  invalidateStatistics(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, [...this.getStatisticsQueryKey()]);
  }

  /**
   * Invalidate all
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, ['/patients']);
  }

  /**
   * Prefetch list
   */
  async prefetchList(queryClient: QueryClient, params?: PatientQueryParams): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      [...this.getListQueryKey(params)],
      () => patientsService.findAll(params)
    );
  }

  /**
   * Prefetch detail
   */
  async prefetchDetail(queryClient: QueryClient, id: string): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      [...this.getDetailQueryKey(id)],
      () => patientsService.findOne(id)
    );
  }

  /**
   * Optimistic update
   */
  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: Patient) => Patient
  ): Patient | undefined {
    const queryKey = [...this.getDetailQueryKey(id)];
    const previousData = this.getQueryData<Patient>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const patientsCacheManager = new PatientsCacheManager();