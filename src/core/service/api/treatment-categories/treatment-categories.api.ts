import { BaseService } from '../../base/base.service';
import {
  treatmentCategoriesControllerCreate,
  treatmentCategoriesControllerFindAll,
  treatmentCategoriesControllerFindOne,
  treatmentCategoriesControllerUpdate,
  treatmentCategoriesControllerRemove,
  treatmentCategoriesControllerRestore,
} from '../../../api/generated/treatment-categories/treatment-categories';

import type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoriesControllerFindAllParams,
  TreatmentCategoryResponseDto
} from '../../../api/model';

import type {
  TreatmentCategoryPaginatedResponse,
  TreatmentCategoryOption,
} from '../../../types/treatment-categories/treatment-categories.types';

/**
 * Treatment Categories Service
 * Handles all treatment category-related API calls
 * Extends BaseService for common query operations
 */
export class TreatmentCategoriesService extends BaseService {
  /**
   * Create new treatment category
   */
  async create(data: CreateTreatmentCategoryDto): Promise<TreatmentCategoryResponseDto> {
    const response = await treatmentCategoriesControllerCreate(data);
    
    if (response.status === 201) {
      return response.data;
    }
    
    throw new Error('Failed to create treatment category');
  }

  /**
   * Get all treatment categories with pagination
   */
  async findAll(
    params?: TreatmentCategoriesControllerFindAllParams
  ): Promise<TreatmentCategoryPaginatedResponse> {
    const response = await treatmentCategoriesControllerFindAll(params);
    return response.data as unknown as TreatmentCategoryPaginatedResponse;
  }

  /**
   * Get treatment category by ID
   */
  async findOne(id: number): Promise<TreatmentCategoryResponseDto> {
    const response = await treatmentCategoriesControllerFindOne(id);
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error('Treatment category not found');
  }

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
  }

  /**
   * Soft delete treatment category
   */
  async remove(id: number): Promise<void> {
    const response = await treatmentCategoriesControllerRemove(id);
    
    if (response.status !== 200) {
      throw new Error('Failed to delete treatment category');
    }
  }

  /**
   * Restore soft deleted category
   */
  async restore(id: number): Promise<TreatmentCategoryResponseDto> {
    const response = await treatmentCategoriesControllerRestore(id);
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error('Failed to restore treatment category');
  }

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
      .filter((category) => !category.deletedAt)
      .map((category) => ({
        value: category.id,
        label: category.namaKategori,
        isActive: !category.deletedAt
      }));
  }
}

export const treatmentCategoriesService = new TreatmentCategoriesService();