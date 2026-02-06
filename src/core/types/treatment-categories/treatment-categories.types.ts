import type { 
  TreatmentCategoryResponseDto,
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoriesControllerFindAllParams,
  CategoryInfoDto
} from '../../api/model';

// Re-export all DTOs
export type { 
  TreatmentCategoryResponseDto,
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoriesControllerFindAllParams,
  CategoryInfoDto
};

// Alias types untuk kemudahan penggunaan
export type TreatmentCategory = TreatmentCategoryResponseDto;
export type CategoryInfo = CategoryInfoDto;
export type TreatmentCategoryQueryParams = TreatmentCategoriesControllerFindAllParams;

// Response types untuk pagination
export interface TreatmentCategoryPaginatedResponse {
  data: TreatmentCategoryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form data untuk create category
export interface CreateTreatmentCategoryFormData extends CreateTreatmentCategoryDto {
  validateUniqueness?: boolean;
}

// Form data untuk update category
export interface UpdateTreatmentCategoryFormData extends UpdateTreatmentCategoryDto {
  validateBeforeUpdate?: boolean;
}

// Filter options untuk UI
export interface TreatmentCategoryFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Category dengan informasi tambahan untuk display
export interface TreatmentCategoryDisplay extends TreatmentCategoryResponseDto {
  status_label: string;
  treatment_count?: number;
  total_revenue?: number;
  is_deletable: boolean;
}

// Category status tracking
export interface TreatmentCategoryStatus {
  isActive: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  hasTreatments: boolean;
}

// Type untuk category dengan status yang dihitung
export interface TreatmentCategoryWithStatus extends TreatmentCategoryResponseDto {
  status: TreatmentCategoryStatus;
}

// Category dengan statistik
export interface TreatmentCategoryWithStats extends TreatmentCategoryResponseDto {
  stats: {
    total_treatments: number;
    active_treatments: number;
    total_uses: number;
    average_price: number;
  };
}

// Category tree structure (untuk hierarchical display jika diperlukan)
export interface TreatmentCategoryTree extends TreatmentCategoryResponseDto {
  children?: TreatmentCategoryTree[];
  parent?: CategoryInfoDto;
  level: number;
}

// Category selection untuk form
export interface TreatmentCategoryOption {
  value: string;
  label: string;
  isActive: boolean;
  treatmentCount?: number;
}

// Helper type untuk validation
export interface TreatmentCategoryValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// Category summary for dashboard
export interface TreatmentCategorySummary {
  total_categories: number;
  active_categories: number;
  inactive_categories: number;
  most_used_categories: {
    id: string;
    name: string;
    usage_count: number;
  }[];
}

// Sort options
export interface TreatmentCategorySortOptions {
  field: 'namaKategori' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}