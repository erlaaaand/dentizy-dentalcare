import type { QueryClient } from '@tanstack/react-query';
import {
  treatmentCategoriesControllerCreate,
  treatmentCategoriesControllerFindAll,
  treatmentCategoriesControllerFindOne,
  treatmentCategoriesControllerUpdate,
  treatmentCategoriesControllerRemove,
  treatmentCategoriesControllerRestore,
  useTreatmentCategoriesControllerCreate,
  useTreatmentCategoriesControllerFindAll,
  useTreatmentCategoriesControllerFindOne,
  useTreatmentCategoriesControllerUpdate,
  useTreatmentCategoriesControllerRemove,
  useTreatmentCategoriesControllerRestore,
  getTreatmentCategoriesControllerFindAllQueryKey,
  getTreatmentCategoriesControllerFindOneQueryKey
} from '../../../api/generated/treatment-categories/treatment-categories';

import type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoriesControllerFindAllParams,
  TreatmentCategoryResponseDto
} from '../../../api/model';

import type {
  TreatmentCategory,
  TreatmentCategoryPaginatedResponse,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
  TreatmentCategoryFilters,
  TreatmentCategoryValidation,
  TreatmentCategoryOption,
  TreatmentCategorySummary,
  TreatmentCategoryStatus,
  TreatmentCategoryWithStatus
} from '../../../types/treatment-categories/treatment-categories.types';

// Extended type with optional deletedAt for runtime flexibility
type TreatmentCategoryWithOptionalDeleted = TreatmentCategoryResponseDto & {
  deletedAt?: string | null;
};

// Re-export generated hooks
export {
  useTreatmentCategoriesControllerCreate,
  useTreatmentCategoriesControllerFindAll,
  useTreatmentCategoriesControllerFindOne,
  useTreatmentCategoriesControllerUpdate,
  useTreatmentCategoriesControllerRemove,
  useTreatmentCategoriesControllerRestore
};

// Re-export query keys
export {
  getTreatmentCategoriesControllerFindAllQueryKey,
  getTreatmentCategoriesControllerFindOneQueryKey
};

// Re-export generated functions
export {
  treatmentCategoriesControllerCreate,
  treatmentCategoriesControllerFindAll,
  treatmentCategoriesControllerFindOne,
  treatmentCategoriesControllerUpdate,
  treatmentCategoriesControllerRemove,
  treatmentCategoriesControllerRestore
};

// Custom API calls with typed responses
export const treatmentCategoriesApi = {
  /**
   * Create new treatment category
   */
  async create(data: CreateTreatmentCategoryDto): Promise<TreatmentCategoryResponseDto> {
    const response = await treatmentCategoriesControllerCreate(data);
    
    if (response.status === 201) {
      return response.data;
    }
    
    throw new Error('Failed to create treatment category');
  },

  /**
   * Get all treatment categories with pagination
   */
  async findAll(
    params?: TreatmentCategoriesControllerFindAllParams
  ): Promise<TreatmentCategoryPaginatedResponse> {
    const response = await treatmentCategoriesControllerFindAll(params);
    
    // The actual response structure from API
    return response.data as unknown as TreatmentCategoryPaginatedResponse;
  },

  /**
   * Get treatment category by ID
   */
  async findOne(id: number): Promise<TreatmentCategoryResponseDto> {
    const response = await treatmentCategoriesControllerFindOne(id);
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error('Treatment category not found');
  },

  /**
   * Update treatment category
   */
  async update(
    id: number,
    data: UpdateTreatmentCategoryDto
  ): Promise<TreatmentCategoryResponseDto> {
    const response = await treatmentCategoriesControllerUpdate(id, data);
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error('Failed to update treatment category');
  },

  /**
   * Soft delete treatment category
   */
  async remove(id: number): Promise<void> {
    const response = await treatmentCategoriesControllerRemove(id);
    
    if (response.status !== 200) {
      throw new Error('Failed to delete treatment category');
    }
  },

  /**
   * Restore soft deleted category
   */
  async restore(id: number): Promise<TreatmentCategoryResponseDto> {
    const response = await treatmentCategoriesControllerRestore(id);
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error('Failed to restore treatment category');
  },

  /**
   * Get all active categories as options for select input
   */
  async getActiveOptions(): Promise<TreatmentCategoryOption[]> {
    const response = await treatmentCategoriesControllerFindAll({
      page: 1,
      limit: 1000
    });
    
    const data = response.data as unknown as TreatmentCategoryPaginatedResponse;
    
    return data.data
      .filter((category) => {
        const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
        return !categoryWithDeleted.deletedAt;
      })
      .map((category) => {
        const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
        return {
          value: category.id,
          label: category.namaKategori,
          isActive: !categoryWithDeleted.deletedAt
        };
      });
  },

  /**
   * Validate category data before submission
   */
  validate(
    data: CreateTreatmentCategoryFormData | UpdateTreatmentCategoryFormData
  ): TreatmentCategoryValidation {
    const errors: { field: string; message: string }[] = [];

    // Validate nama kategori
    if (!data.namaKategori || data.namaKategori.trim() === '') {
      errors.push({ field: 'namaKategori', message: 'Nama kategori wajib diisi' });
    } else if (data.namaKategori.length < 3) {
      errors.push({ field: 'namaKategori', message: 'Nama kategori minimal 3 karakter' });
    } else if (data.namaKategori.length > 100) {
      errors.push({ field: 'namaKategori', message: 'Nama kategori maksimal 100 karakter' });
    }

    // Validate deskripsi (optional)
    if (data.deskripsi && data.deskripsi.length > 500) {
      errors.push({ field: 'deskripsi', message: 'Deskripsi maksimal 500 karakter' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get category status information
   */
  getCategoryStatus(category: TreatmentCategoryResponseDto): TreatmentCategoryStatus {
    // Type guard to check if deletedAt exists
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    const isDeleted = !!(categoryWithDeleted.deletedAt);
    
    return {
      isActive: !isDeleted,
      canEdit: !isDeleted,
      canDelete: !isDeleted,
      canActivate: isDeleted,
      canDeactivate: !isDeleted,
      hasTreatments: false // This would need to be fetched from API
    };
  },

  /**
   * Get category with status
   */
  async findOneWithStatus(id: number): Promise<TreatmentCategoryWithStatus> {
    const category = await this.findOne(id);
    const status = this.getCategoryStatus(category);
    
    return {
      ...category,
      status
    };
  },

  /**
   * Invalidate all category queries
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey.length > 0 &&
          typeof queryKey[0] === 'string' &&
          queryKey[0].startsWith('/treatment-categories')
        );
      }
    });
  },

  /**
   * Invalidate specific category query
   */
  invalidateOne(queryClient: QueryClient, id: number): Promise<void> {
    return queryClient.invalidateQueries({
      queryKey: getTreatmentCategoriesControllerFindOneQueryKey(id)
    });
  },

  /**
   * Prefetch category list
   */
  async prefetchList(
    queryClient: QueryClient,
    params?: TreatmentCategoriesControllerFindAllParams
  ): Promise<void> {
    await queryClient.prefetchQuery({
      queryKey: getTreatmentCategoriesControllerFindAllQueryKey(params),
      queryFn: () => treatmentCategoriesControllerFindAll(params)
    });
  },

  /**
   * Prefetch single category
   */
  async prefetchOne(queryClient: QueryClient, id: number): Promise<void> {
    await queryClient.prefetchQuery({
      queryKey: getTreatmentCategoriesControllerFindOneQueryKey(id),
      queryFn: () => treatmentCategoriesControllerFindOne(id)
    });
  }
};

// Helper functions
export const treatmentCategoriesHelpers = {
  /**
   * Build query params from filters
   */
  buildQueryParams(filters: TreatmentCategoryFilters): TreatmentCategoriesControllerFindAllParams {
    const params: TreatmentCategoriesControllerFindAllParams = {};

    if (filters.page) {
      params.page = filters.page;
    }

    if (filters.limit) {
      params.limit = filters.limit;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    return params;
  },

  /**
   * Format category name for display
   */
  formatCategoryName(name: string): string {
    return name.trim();
  },

  /**
   * Get status badge color
   */
  getStatusBadgeColor(category: TreatmentCategoryResponseDto): string {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return categoryWithDeleted.deletedAt ? 'gray' : 'green';
  },

  /**
   * Get status label
   */
  getStatusLabel(category: TreatmentCategoryResponseDto): string {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return categoryWithDeleted.deletedAt ? 'Tidak Aktif' : 'Aktif';
  },

  /**
   * Check if category can be deleted
   */
  canDelete(category: TreatmentCategoryResponseDto): boolean {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return !categoryWithDeleted.deletedAt;
  },

  /**
   * Check if category can be restored
   */
  canRestore(category: TreatmentCategoryResponseDto): boolean {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return !!categoryWithDeleted.deletedAt;
  },

  /**
   * Sort categories by name
   */
  sortByName(
    categories: TreatmentCategoryResponseDto[],
    order: 'asc' | 'desc' = 'asc'
  ): TreatmentCategoryResponseDto[] {
    return [...categories].sort((a, b) => {
      const comparison = a.namaKategori.localeCompare(b.namaKategori, 'id');
      return order === 'asc' ? comparison : -comparison;
    });
  },

  /**
   * Sort categories by date
   */
  sortByDate(
    categories: TreatmentCategoryResponseDto[],
    field: 'createdAt' | 'updatedAt' = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): TreatmentCategoryResponseDto[] {
    return [...categories].sort((a, b) => {
      const dateA = new Date(a[field]).getTime();
      const dateB = new Date(b[field]).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  },

  /**
   * Filter active categories
   */
  filterActive(categories: TreatmentCategoryResponseDto[]): TreatmentCategoryResponseDto[] {
    return categories.filter((category) => {
      const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
      return !categoryWithDeleted.deletedAt;
    });
  },

  /**
   * Filter deleted categories
   */
  filterDeleted(categories: TreatmentCategoryResponseDto[]): TreatmentCategoryResponseDto[] {
    return categories.filter((category) => {
      const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
      return !!categoryWithDeleted.deletedAt;
    });
  },

  /**
   * Search categories by name
   */
  searchByName(
    categories: TreatmentCategoryResponseDto[],
    searchTerm: string
  ): TreatmentCategoryResponseDto[] {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      return categories;
    }
    
    return categories.filter((category) =>
      category.namaKategori.toLowerCase().includes(term) ||
      (category.deskripsi && category.deskripsi.toLowerCase().includes(term))
    );
  },

  /**
   * Get category summary statistics
   */
  getSummary(categories: TreatmentCategoryResponseDto[]): TreatmentCategorySummary {
    const activeCategories = this.filterActive(categories);
    const deletedCategories = this.filterDeleted(categories);
    
    return {
      total_categories: categories.length,
      active_categories: activeCategories.length,
      inactive_categories: deletedCategories.length,
      most_used_categories: [] // This would need usage data from API
    };
  }
};

export type {
  TreatmentCategory,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
  TreatmentCategoryPaginatedResponse,
  TreatmentCategoryFilters,
  TreatmentCategoryValidation
};