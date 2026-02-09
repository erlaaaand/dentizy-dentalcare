import { BaseService } from '../../base/base.service';
import {
  medicalRecordTreatmentsControllerFindAll,
  medicalRecordTreatmentsControllerCreate,
  medicalRecordTreatmentsControllerUpdate,
  medicalRecordTreatmentsControllerRemove,
  medicalRecordTreatmentsControllerFindOne,
  medicalRecordTreatmentsControllerFindByMedicalRecordId,
  medicalRecordTreatmentsControllerGetTotalByMedicalRecordId,
  medicalRecordTreatmentsControllerGetTopTreatments,
  getMedicalRecordTreatmentsControllerFindAllQueryKey,
  getMedicalRecordTreatmentsControllerFindOneQueryKey,
  getMedicalRecordTreatmentsControllerFindByMedicalRecordIdQueryKey,
  getMedicalRecordTreatmentsControllerGetTotalByMedicalRecordIdQueryKey,
  getMedicalRecordTreatmentsControllerGetTopTreatmentsQueryKey
} from '../../../api/generated/medical-record-treatments/medical-record-treatments';

import type { QueryClient } from '@tanstack/react-query';
import type {
  CreateMedicalRecordTreatmentDto,
  UpdateMedicalRecordTreatmentDto,
  MedicalRecordTreatmentQueryParams,
  TopTreatmentsParams,
  MedicalRecordTreatment,
  TreatmentTotalResponse,
} from '../../../types/medical-record-treatments/medical-record-treatments.types';

// Re-export hooks
export {
  useMedicalRecordTreatmentsControllerFindAll,
  useMedicalRecordTreatmentsControllerCreate,
  useMedicalRecordTreatmentsControllerUpdate,
  useMedicalRecordTreatmentsControllerRemove,
  useMedicalRecordTreatmentsControllerFindOne,
  useMedicalRecordTreatmentsControllerFindByMedicalRecordId,
  useMedicalRecordTreatmentsControllerGetTotalByMedicalRecordId,
  useMedicalRecordTreatmentsControllerGetTopTreatments
} from '../../../api/generated/medical-record-treatments/medical-record-treatments';

// Re-export query keys
export {
  getMedicalRecordTreatmentsControllerFindAllQueryKey,
  getMedicalRecordTreatmentsControllerFindOneQueryKey,
  getMedicalRecordTreatmentsControllerFindByMedicalRecordIdQueryKey,
  getMedicalRecordTreatmentsControllerGetTotalByMedicalRecordIdQueryKey,
  getMedicalRecordTreatmentsControllerGetTopTreatmentsQueryKey
};

class MedicalRecordTreatmentsService extends BaseService {
  // ==================== QUERIES ====================
  
  async findAll(params?: MedicalRecordTreatmentQueryParams): Promise<MedicalRecordTreatment[]> {
    const response = await medicalRecordTreatmentsControllerFindAll(params);
    return response.data as MedicalRecordTreatment[];
  }

  async findOne(id: string): Promise<MedicalRecordTreatment> {
    const response = await medicalRecordTreatmentsControllerFindOne(id);
    return response.data as MedicalRecordTreatment;
  }

  async findByMedicalRecordId(medicalRecordId: string): Promise<MedicalRecordTreatment[]> {
    const response = await medicalRecordTreatmentsControllerFindByMedicalRecordId(medicalRecordId);
    return response.data as MedicalRecordTreatment[];
  }

  async getTotalByMedicalRecordId(medicalRecordId: string): Promise<TreatmentTotalResponse> {
    const response = await medicalRecordTreatmentsControllerGetTotalByMedicalRecordId(medicalRecordId);
    return response.data as TreatmentTotalResponse;
  }

  async getTopTreatments(params?: TopTreatmentsParams): Promise<unknown> {
    const response = await medicalRecordTreatmentsControllerGetTopTreatments(params);
    return response.data;
  }

  // ==================== MUTATIONS ====================
  
  async create(data: CreateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatment> {
    const response = await medicalRecordTreatmentsControllerCreate(data);
    if (response.status === 201) {
      return response.data as MedicalRecordTreatment;
    }
    throw new Error('Failed to create medical record treatment');
  }

  async update(id: string, data: UpdateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatment> {
    const response = await medicalRecordTreatmentsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as MedicalRecordTreatment;
    }
    throw new Error('Failed to update medical record treatment');
  }

  async remove(id: string): Promise<void> {
    const response = await medicalRecordTreatmentsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove medical record treatment');
    }
  }

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

  // ==================== CACHE UTILITIES ====================
  
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
    return this.invalidateQueries(queryClient, ['/medical-record-treatments'] as const);
  }

  async prefetchList(queryClient: QueryClient, params?: MedicalRecordTreatmentQueryParams) {
    return this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => this.findAll(params)
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => this.findOne(id)
    );
  }

  async prefetchByMedicalRecordId(queryClient: QueryClient, medicalRecordId: string) {
    return this.prefetchQuery(
      queryClient,
      this.getByMedicalRecordIdQueryKey(medicalRecordId),
      () => this.findByMedicalRecordId(medicalRecordId)
    );
  }
}

export const medicalRecordTreatmentsService = new MedicalRecordTreatmentsService();

// Helper functions
export const medicalRecordTreatmentsHelpers = {
  /**
   * Calculate total cost from treatments
   */
  calculateTotalCost(treatments: MedicalRecordTreatment[]): number {
    return treatments.reduce((total, treatment) => {
      const subtotal = treatment.hargaSatuan * treatment.jumlah;
      const discount = subtotal * (treatment.diskon / 100);
      return total + (subtotal - discount);
    }, 0);
  },

  /**
   * Calculate subtotal for a treatment
   */
  calculateSubtotal(harga: number, jumlah: number): number {
    return harga * jumlah;
  },

  /**
   * Calculate discount amount
   */
  calculateDiscount(harga: number, jumlah: number, diskon: number): number {
    const subtotal = this.calculateSubtotal(harga, jumlah);
    return subtotal * (diskon / 100);
  },

  /**
   * Calculate final price after discount
   */
  calculateFinalPrice(harga: number, jumlah: number, diskon: number): number {
    const subtotal = this.calculateSubtotal(harga, jumlah);
    const discount = this.calculateDiscount(harga, jumlah, diskon);
    return subtotal - discount;
  },

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  },
};