import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getMedicalRecordsControllerFindAllQueryKey,
  getMedicalRecordsControllerFindOneQueryKey,
  getMedicalRecordsControllerSearchQueryKey,
  getMedicalRecordsControllerGetDoctorStatsQueryKey
} from '../../../../api/generated/medical-records/medical-records';
import type { 
  MedicalRecordQueryParams, 
  MedicalRecordSearchParams, 
  DoctorStatsParams,
  MedicalRecord
} from '../../../../types/medical-records/medical-record.types';
import { medicalRecordsService } from '../medical-record.api';

export class MedicalRecordsCacheManager extends BaseService {
  
  // ==================== QUERY KEYS ====================
  
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

  // ==================== INVALIDATION ====================

  invalidateList(queryClient: QueryClient, params?: MedicalRecordQueryParams) {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  invalidateSearch(queryClient: QueryClient, params?: MedicalRecordSearchParams) {
    return this.invalidateQueries(queryClient, this.getSearchQueryKey(params));
  }

  invalidateStats(queryClient: QueryClient, params?: DoctorStatsParams) {
    return this.invalidateQueries(queryClient, this.getDoctorStatsQueryKey(params));
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/medical-records']);
  }

  // ==================== PREFETCHING ====================

  async prefetchList(queryClient: QueryClient, params?: MedicalRecordQueryParams) {
    return this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => medicalRecordsService.findAll(params)
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => medicalRecordsService.findOne(id)
    );
  }

  // ==================== OPTIMISTIC UPDATES ====================

  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: MedicalRecord) => MedicalRecord
  ) {
    const queryKey = this.getDetailQueryKey(id);
    const previousData = this.getQueryData<MedicalRecord>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const medicalRecordsCacheManager = new MedicalRecordsCacheManager();