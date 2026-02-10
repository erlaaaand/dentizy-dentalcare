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
} from '../../../api/generated/treatments/treatments';

import type {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentQueryParams,
  Treatment,
  PaginatedTreatmentResponse,
} from '../../../types/treatments/treatment.types';

/**
 * Treatments Service
 * Handles all treatment-related API calls
 * Extends BaseService for common query operations
 */
export class TreatmentsService extends BaseService {
  /**
   * Get all treatments with pagination
   */
  async findAll(params?: TreatmentQueryParams): Promise<PaginatedTreatmentResponse> {
    const response = await treatmentsControllerFindAll(params);
    return response.data as unknown as PaginatedTreatmentResponse;
  }

  /**
   * Get single treatment by ID
   */
  async findOne(id: string): Promise<Treatment> {
    const response = await treatmentsControllerFindOne(id);
    return response.data as Treatment;
  }

  /**
   * Get treatment by code
   */
  async findByKode(kode: string): Promise<Treatment> {
    const response = await treatmentsControllerFindByKode(kode);
    return response.data as Treatment;
  }

  /**
   * Create new treatment
   */
  async create(data: CreateTreatmentDto): Promise<Treatment> {
    const response = await treatmentsControllerCreate(data);
    if (response.status === 201) {
      return response.data as Treatment;
    }
    throw new Error('Failed to create treatment');
  }

  /**
   * Update treatment
   */
  async update(id: string, data: UpdateTreatmentDto): Promise<Treatment> {
    const response = await treatmentsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to update treatment');
  }

  /**
   * Soft delete treatment
   */
  async remove(id: string): Promise<void> {
    const response = await treatmentsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove treatment');
    }
  }

  /**
   * Restore soft deleted treatment
   */
  async restore(id: string): Promise<Treatment> {
    const response = await treatmentsControllerRestore(id);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to restore treatment');
  }

  /**
   * Activate treatment
   */
  async activate(id: string): Promise<Treatment> {
    const response = await treatmentsControllerActivate(id);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to activate treatment');
  }

  /**
   * Deactivate treatment
   */
  async deactivate(id: string): Promise<Treatment> {
    const response = await treatmentsControllerDeactivate(id);
    if (response.status === 200) {
      return response.data as Treatment;
    }
    throw new Error('Failed to deactivate treatment');
  }

  /**
   * Toggle treatment active status
   */
  async toggleStatus(id: string, isActive: boolean): Promise<Treatment> {
    return isActive 
      ? await this.activate(id)
      : await this.deactivate(id);
  }
}

export const treatmentsService = new TreatmentsService();