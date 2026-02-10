import type {
  TreatmentCategoryFilters,
  TreatmentCategorySummary,
  TreatmentCategoryStatus,
  TreatmentCategoryResponseDto,
  TreatmentCategoriesControllerFindAllParams
} from '../../../../types/treatment-categories/treatment-categories.types';

// Extended type with optional deletedAt for runtime flexibility
type TreatmentCategoryWithOptionalDeleted = TreatmentCategoryResponseDto & {
  deletedAt?: string | null;
};

/**
 * Treatment Categories Helper Functions
 * Utility functions for treatment categories
 */
export class TreatmentCategoriesHelpers {
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
  }

  /**
   * Format category name for display
   */
  formatCategoryName(name: string): string {
    return name.trim();
  }

  /**
   * Get status badge color
   */
  getStatusBadgeColor(category: TreatmentCategoryResponseDto): string {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return categoryWithDeleted.deletedAt ? 'gray' : 'green';
  }

  /**
   * Get status label
   */
  getStatusLabel(category: TreatmentCategoryResponseDto): string {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return categoryWithDeleted.deletedAt ? 'Tidak Aktif' : 'Aktif';
  }

  /**
   * Check if category can be deleted
   */
  canDelete(category: TreatmentCategoryResponseDto): boolean {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return !categoryWithDeleted.deletedAt;
  }

  /**
   * Check if category can be restored
   */
  canRestore(category: TreatmentCategoryResponseDto): boolean {
    const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
    return !!categoryWithDeleted.deletedAt;
  }

  /**
   * Get category status information
   */
  getCategoryStatus(category: TreatmentCategoryResponseDto): TreatmentCategoryStatus {
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
  }

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
  }

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
  }

  /**
   * Filter active categories
   */
  filterActive(categories: TreatmentCategoryResponseDto[]): TreatmentCategoryResponseDto[] {
    return categories.filter((category) => {
      const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
      return !categoryWithDeleted.deletedAt;
    });
  }

  /**
   * Filter deleted categories
   */
  filterDeleted(categories: TreatmentCategoryResponseDto[]): TreatmentCategoryResponseDto[] {
    return categories.filter((category) => {
      const categoryWithDeleted = category as TreatmentCategoryWithOptionalDeleted;
      return !!categoryWithDeleted.deletedAt;
    });
  }

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
  }

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
}

export const treatmentCategoriesHelpers = new TreatmentCategoriesHelpers();