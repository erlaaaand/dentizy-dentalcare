import { BaseService } from '../../base/base.service';
import {
  treatmentsControllerFindAll,
  treatmentsControllerCreate,
  treatmentsControllerUpdate,
  treatmentsControllerRemove,
  treatmentsControllerRestore,
  treatmentsControllerActivate,
  treatmentsControllerDeactivate,
  treatmentsControllerFindOne,
  treatmentsControllerFindByKode,
  getTreatmentsControllerFindAllQueryKey,
  getTreatmentsControllerFindOneQueryKey,
  getTreatmentsControllerFindByKodeQueryKey
} from '../../../api/generated/treatments/treatments';

import type { QueryClient } from '@tanstack/react-query';
import type {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentQueryParams,
  Treatment,
  PaginatedTreatmentResponse,
} from '../../../types/treatments/treatment.types';

// Re-export hooks
export {
  useTreatmentsControllerFindAll,
  useTreatmentsControllerCreate,
  useTreatmentsControllerUpdate,
  useTreatmentsControllerRemove,
  useTreatmentsControllerRestore,
  useTreatmentsControllerActivate,
  useTreatmentsControllerDeactivate,
  useTreatmentsControllerFindOne,
  useTreatmentsControllerFindByKode
} from '../../../api/generated/treatments/treatments';

// Re-export query keys
export {
  getTreatmentsControllerFindAllQueryKey,
  getTreatmentsControllerFindOneQueryKey,
  getTreatmentsControllerFindByKodeQueryKey
};

class TreatmentsService extends BaseService {
  // ==================== QUERIES ====================
  
  async findAll(params?: TreatmentQueryParams): Promise<PaginatedTreatmentResponse> {
    const response = await treatmentsControllerFindAll(params);
    return response.data as unknown as PaginatedTreatmentResponse;
  }

  async findOne(id: number): Promise<Treatment> {
    const response = await treatmentsControllerFindOne(id);
    return response.data as Treatment;
  }

  async findByKode(kode: string): Promise<Treatment> {
    const response = await treatmentsControllerFindByKode(kode);
    return response.data as Treatment;
  }

  // ==================== MUTATIONS ====================
  
  async create(data: CreateTreatmentDto): Promise<Treatment> {
    const response = await treatmentsControllerCreate(data);
    if (response.status === 201) {
      return response.data as Treatment;
    }
    throw new Error('Failed to create treatment');
  }

  async update(id: number, data: UpdateTreatmentDto): Promise<Treatment> {
    const response = await treatmentsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to update treatment');
  }

  async remove(id: number): Promise<void> {
    const response = await treatmentsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove treatment');
    }
  }

  async restore(id: number): Promise<Treatment> {
    const response = await treatmentsControllerRestore(id);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to restore treatment');
  }

  async activate(id: number): Promise<Treatment> {
    const response = await treatmentsControllerActivate(id);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to activate treatment');
  }

  async deactivate(id: number): Promise<Treatment> {
    const response = await treatmentsControllerDeactivate(id);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to deactivate treatment');
  }

  async toggleStatus(id: number, isActive: boolean): Promise<Treatment> {
    return isActive 
      ? await this.activate(id)
      : await this.deactivate(id);
  }

  // ==================== QUERY KEYS ====================
  
  getListQueryKey(params?: TreatmentQueryParams) {
    return getTreatmentsControllerFindAllQueryKey(params);
  }

  getDetailQueryKey(id: number) {
    return getTreatmentsControllerFindOneQueryKey(id);
  }

  getByKodeQueryKey(kode: string) {
    return getTreatmentsControllerFindByKodeQueryKey(kode);
  }

  // ==================== CACHE UTILITIES ====================
  
  invalidateList(queryClient: QueryClient, params?: TreatmentQueryParams) {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  invalidateDetail(queryClient: QueryClient, id: number) {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  invalidateByKode(queryClient: QueryClient, kode: string) {
    return this.invalidateQueries(queryClient, this.getByKodeQueryKey(kode));
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/treatments'] as const);
  }

  async prefetchList(queryClient: QueryClient, params?: TreatmentQueryParams) {
    return this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => this.findAll(params)
    );
  }

  async prefetchDetail(queryClient: QueryClient, id: number) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => this.findOne(id)
    );
  }

  optimisticUpdate(
    queryClient: QueryClient,
    id: number,
    updater: (old: Treatment) => Treatment
  ) {
    const queryKey = this.getDetailQueryKey(id);
    const previousData = this.getQueryData<Treatment>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const treatmentsService = new TreatmentsService();

// Helper functions
export const treatmentsHelpers = {
  /**
   * Format treatment code
   */
  formatKode(kode: string): string {
    return kode.toUpperCase().trim();
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

  /**
   * Check if treatment is active
   */
  isActive(treatment: Treatment): boolean {
    return treatment.isActive && !treatment.deletedAt;
  },

  /**
   * Check if treatment can be deleted
   */
  canDelete(treatment: Treatment): boolean {
    return !treatment.deletedAt;
  },

  /**
   * Check if treatment can be restored
   */
  canRestore(treatment: Treatment): boolean {
    return !!treatment.deletedAt;
  },

  /**
   * Check if treatment can be activated/deactivated
   */
  canToggleStatus(treatment: Treatment): boolean {
    return !treatment.deletedAt;
  },

  /**
   * Get status label
   */
  getStatusLabel(treatment: Treatment): string {
    if (treatment.deletedAt) return 'Dihapus';
    if (!treatment.isActive) return 'Nonaktif';
    return 'Aktif';
  },

  /**
   * Get status color
   */
  getStatusColor(treatment: Treatment): string {
    if (treatment.deletedAt) return 'gray';
    if (!treatment.isActive) return 'red';
    return 'green';
  },

  /**
   * Calculate discount amount
   */
  calculateDiscount(harga: number, diskon: number): number {
    return harga * (diskon / 100);
  },

  /**
   * Calculate final price after discount
   */
  calculateFinalPrice(harga: number, diskon: number): number {
    return harga - this.calculateDiscount(harga, diskon);
  }
};