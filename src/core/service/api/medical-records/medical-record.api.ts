import { BaseService } from '../../base/base.service';
import {
  medicalRecordsControllerCreate,
  medicalRecordsControllerFindAll,
  medicalRecordsControllerSearch,
  medicalRecordsControllerFindByAppointmentId,
  medicalRecordsControllerGetDoctorStats,
  medicalRecordsControllerFindOne,
  medicalRecordsControllerUpdate,
  medicalRecordsControllerRemove,
  medicalRecordsControllerRestore,
  medicalRecordsControllerHardDelete,
  getMedicalRecordsControllerFindAllQueryKey,
  getMedicalRecordsControllerFindOneQueryKey,
  getMedicalRecordsControllerSearchQueryKey,
  getMedicalRecordsControllerGetDoctorStatsQueryKey
} from '../../../api/generated/medical-records/medical-records';

import type { QueryClient } from '@tanstack/react-query';
import type {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordQueryParams,
  MedicalRecordSearchParams,
  DoctorStatsParams,
  MedicalRecord,
  MedicalRecordPaginatedResponse,
  DoctorStatsResponse
} from '../../../types/medical-records/medical-record.types';

export {
  useMedicalRecordsControllerCreate,
  useMedicalRecordsControllerFindAll,
  useMedicalRecordsControllerSearch,
  useMedicalRecordsControllerFindByAppointmentId,
  useMedicalRecordsControllerGetDoctorStats,
  useMedicalRecordsControllerFindOne,
  useMedicalRecordsControllerUpdate,
  useMedicalRecordsControllerRemove,
  useMedicalRecordsControllerRestore,
  useMedicalRecordsControllerHardDelete
} from '../../../api/generated/medical-records/medical-records';

export {
  getMedicalRecordsControllerFindAllQueryKey,
  getMedicalRecordsControllerFindOneQueryKey,
  getMedicalRecordsControllerSearchQueryKey,
  getMedicalRecordsControllerGetDoctorStatsQueryKey
};

class MedicalRecordsService extends BaseService {
  
  async findAll(params?: MedicalRecordQueryParams): Promise<MedicalRecordPaginatedResponse> {
    const response = await medicalRecordsControllerFindAll(params);
    return response.data as unknown as MedicalRecordPaginatedResponse;
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerFindOne(id);
    return response.data as MedicalRecord;
  }

  async search(params: MedicalRecordSearchParams): Promise<MedicalRecordPaginatedResponse> {
    const response = await medicalRecordsControllerSearch(params);
    return response.data as unknown as MedicalRecordPaginatedResponse;
  }

  async findByAppointmentId(appointmentId: string): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerFindByAppointmentId(appointmentId);
    return response.data as MedicalRecord;
  }

  async getDoctorStats(params?: DoctorStatsParams): Promise<DoctorStatsResponse> {
    const response = await medicalRecordsControllerGetDoctorStats(params);
    return (response as unknown) as DoctorStatsResponse;
  }
  
  async create(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerCreate(data);
    if (response.status === 201) {
      return response.data as MedicalRecord;
    }
    throw new Error('Failed to create medical record');
  }

  async update(id: string, data: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as MedicalRecord;
    }
    throw new Error('Failed to update medical record');
  }

  async remove(id: string): Promise<void> {
    const response = await medicalRecordsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove medical record');
    }
  }

  async restore(id: string): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerRestore(id);
    if (response.status === 200) {
      return response.data as MedicalRecord;
    }
    throw new Error('Failed to restore medical record');
  }

  async hardDelete(id: string): Promise<void> {
    const response = await medicalRecordsControllerHardDelete(id);
    if (response.status !== 204) {
      throw new Error('Failed to permanently delete medical record');
    }
  }
  
  getListQueryKey(params?: MedicalRecordQueryParams) {
    return getMedicalRecordsControllerFindAllQueryKey(params);
  }

  getDetailQueryKey(id: string) {
    return getMedicalRecordsControllerFindOneQueryKey(id);
  }

  getSearchQueryKey(params?: MedicalRecordSearchParams) {
    return getMedicalRecordsControllerSearchQueryKey(params);
  }

  getDoctorStatsQueryKey(params?: DoctorStatsParams) {
    return getMedicalRecordsControllerGetDoctorStatsQueryKey(params);
  }

  invalidateList(queryClient: QueryClient, params?: MedicalRecordQueryParams) {
    return this.invalidateQueries(queryClient,[...this.getListQueryKey(params)]);
  }

  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, [...this.getDetailQueryKey(id)]);
  }

  invalidateSearch(queryClient: QueryClient, params?: MedicalRecordSearchParams) {
    return this.invalidateQueries(queryClient, [...this.getSearchQueryKey(params)]);
  }

  invalidateStats(queryClient: QueryClient, params?: DoctorStatsParams) {
    return this.invalidateQueries(queryClient, [...this.getDoctorStatsQueryKey(params)]);
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/medical-records']);
  }

  async prefetchList(queryClient: QueryClient, params?: MedicalRecordQueryParams) {
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
    updater: (old: MedicalRecord) => MedicalRecord
  ) {
    const queryKey = [...this.getDetailQueryKey(id)];
    const previousData = this.getQueryData<MedicalRecord>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const medicalRecordsService = new MedicalRecordsService();

// Helper functions
export const medicalRecordsHelpers = {
  /**
   * Calculate age of medical record in days
   */
  calculateAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  /**
   * Check if medical record can be edited
   */
  canEdit(record: MedicalRecord): boolean {

    if (record.deleted_at) return false;

    if (!record.created_at) return false;

    const age = this.calculateAge(record.created_at);
    return age <= 30;
  },

  /**
   * Check if medical record can be deleted
   */
  canDelete(record: MedicalRecord): boolean {
    return !record.deleted_at;
  },

  /**
   * Check if medical record can be restored
   */
  canRestore(record: MedicalRecord): boolean {
    return !!record.deleted_at;
  },

  /**
   * Format SOAP notes for display
   */
  formatSOAP(record: MedicalRecord): string {
    const parts: string[] = [];
    
    if (record.subjektif) parts.push(`S: ${record.subjektif}`);
    if (record.objektif) parts.push(`O: ${record.objektif}`);
    if (record.assessment) parts.push(`A: ${record.assessment}`);
    if (record.plan) parts.push(`P: ${record.plan}`);
    
    return parts.join('\n\n');
  }
};