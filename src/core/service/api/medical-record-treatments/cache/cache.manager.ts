import { BaseService } from "../../../base/base.service";
import type { QueryClient } from '@tanstack/react-query';
import {
  getMedicalRecordTreatmentsControllerFindAllQueryKey,
  getMedicalRecordTreatmentsControllerFindOneQueryKey,
  getMedicalRecordTreatmentsControllerFindByMedicalRecordIdQueryKey,
  getMedicalRecordTreatmentsControllerGetTotalByMedicalRecordIdQueryKey,
  getMedicalRecordTreatmentsControllerGetTopTreatmentsQueryKey
} from '../../../../api/generated/medical-record-treatments/medical-record-treatments';
import type { 
  MedicalRecordTreatmentQueryParams, 
  TopTreatmentsParams 
} from '../../../../types/medical-record-treatments/medical-record-treatments.types';
import { medicalRecordTreatmentsService } from "../medical-record-treatments.api";

export class MedicalRecordTreatmentsCacheManager extends BaseService {
  
  // ==================== QUERY KEYS ====================

  getListQueryKey(params?: MedicalRecordTreatmentQueryParams) {
    return getMedicalRecordTreatmentsControllerFindAllQueryKey(params);
  }

  getDetailQueryKey(id: string) {
    return getMedicalRecordTreatmentsControllerFindOneQueryKey(id);
  }

  getByMedicalRecordIdQueryKey(medicalRecordId: string) {
    return getMedicalRecordTreatmentsControllerFindByMedicalRecordIdQueryKey(medicalRecordId);
  }

  getTotalByMedicalRecordIdQueryKey(medicalRecordId: string) {
    return getMedicalRecordTreatmentsControllerGetTotalByMedicalRecordIdQueryKey(medicalRecordId);
  }

  getTopTreatmentsQueryKey(params?: TopTreatmentsParams) {
    return getMedicalRecordTreatmentsControllerGetTopTreatmentsQueryKey(params);
  }

  // ==================== CACHE INVALIDATION ====================

  invalidateList(queryClient: QueryClient, params?: MedicalRecordTreatmentQueryParams) {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  invalidateByMedicalRecordId(queryClient: QueryClient, medicalRecordId: string) {
    return this.invalidateQueries(queryClient, this.getByMedicalRecordIdQueryKey(medicalRecordId));
  }

  invalidateTotalByMedicalRecordId(queryClient: QueryClient, medicalRecordId: string) {
    return this.invalidateQueries(queryClient, this.getTotalByMedicalRecordIdQueryKey(medicalRecordId));
  }

  invalidateTopTreatments(queryClient: QueryClient, params?: TopTreatmentsParams) {
    return this.invalidateQueries(queryClient, this.getTopTreatmentsQueryKey(params));
  }

  invalidateAll(queryClient: QueryClient) {
    // String array literal otomatis kompatibel dengan readonly unknown[]
    return this.invalidateQueries(queryClient, ['/medical-record-treatments']);
  }

  // ==================== PREFETCHING ====================

  async prefetchList(queryClient: QueryClient, params?: MedicalRecordTreatmentQueryParams) {
    return this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => medicalRecordTreatmentsService.findAll(params)
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => medicalRecordTreatmentsService.findOne(id)
    );
  }

  async prefetchByMedicalRecordId(queryClient: QueryClient, medicalRecordId: string) {
    return this.prefetchQuery(
      queryClient,
      this.getByMedicalRecordIdQueryKey(medicalRecordId),
      () => medicalRecordTreatmentsService.findByMedicalRecordId(medicalRecordId)
    );
  }
}

export const medicalRecordTreatmentsCacheManager = new MedicalRecordTreatmentsCacheManager();