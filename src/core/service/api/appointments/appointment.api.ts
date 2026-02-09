import { BaseService } from '../../base/base.service';
import {
  appointmentsControllerFindAll,
  appointmentsControllerFindOne,
  appointmentsControllerCreate,
  appointmentsControllerUpdate,
  appointmentsControllerCancel,
  appointmentsControllerComplete,
  appointmentsControllerRemove,
  getAppointmentsControllerFindAllQueryKey,
  getAppointmentsControllerFindOneQueryKey,
} from '../../../api/generated/appointments/appointments';
import type { QueryClient } from '@tanstack/react-query';
import type {
  AppointmentQueryParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
} from '../../../types/appointments/appointment.types';

export class AppointmentsApi extends BaseService {
  // ==================== QUERIES ====================
  
  /**
   * Get all appointments with filters
   */
  async findAll(params?: AppointmentQueryParams) {
    const response = await appointmentsControllerFindAll(params);
    return response.data as PaginatedAppointmentResponseDto;
  }

  /**
   * Get single appointment by ID
   */
  async findOne(id: string) {
    const response = await appointmentsControllerFindOne(id);
    return response.data as AppointmentResponseDto;
  }

  // ==================== MUTATIONS ====================
  
  /**
   * Create new appointment
   */
  async create(data: CreateAppointmentDto) {
    const response = await appointmentsControllerCreate({ data });
    return response.data as AppointmentResponseDto;
  }

  /**
   * Update existing appointment
   */
  async update(id: string, data: UpdateAppointmentDto) {
    const response = await appointmentsControllerUpdate(id, { data });
    return response.data as AppointmentResponseDto;
  }

  /**
   * Complete appointment
   */
  async complete(id: string) {
    const response = await appointmentsControllerComplete(id);
    return response.data as AppointmentResponseDto;
  }

  /**
   * Cancel appointment
   */
  async cancel(id: string) {
    const response = await appointmentsControllerCancel(id);
    return response.data as AppointmentResponseDto;
  }

  /**
   * Delete appointment
   */
  async remove(id: string) {
    const response = await appointmentsControllerRemove(id);
    return response;
  }

  // ==================== QUERY KEYS ====================
  
  getListQueryKey(params?: AppointmentQueryParams) {
    return getAppointmentsControllerFindAllQueryKey(params);
  }

  getDetailQueryKey(id: string) {
    return getAppointmentsControllerFindOneQueryKey(id);
  }

  // ==================== CACHE UTILITIES ====================
  
  /**
   * Invalidate all appointment lists
   */
  invalidateList(queryClient: QueryClient, params?: AppointmentQueryParams) {
    return this.invalidateQueries(queryClient, [...this.getListQueryKey(params)]);
  }

  /**
   * Invalidate specific appointment detail
   */
  invalidateDetail(queryClient: QueryClient, id: string) {
    return this.invalidateQueries(queryClient, [...this.getDetailQueryKey(id)]);
  }

  /**
   * Invalidate all appointment queries
   */
  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/appointments']);
  }

  /**
   * Prefetch appointment list
   */
  async prefetchList(queryClient: QueryClient, params?: AppointmentQueryParams) {
    return this.prefetchQuery(
      queryClient,
      [...this.getListQueryKey(params)],
      () => this.findAll(params)
    );
  }

  /**
   * Prefetch appointment detail
   */
  async prefetchDetail(queryClient: QueryClient, id: string) {
    return this.prefetchQuery(
      queryClient,
      [...this.getDetailQueryKey(id)],
      () => this.findOne(id)
    );
  }

  /**
   * Optimistic update for appointment
   */
  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: AppointmentResponseDto) => AppointmentResponseDto
  ) {
    const queryKey = [...this.getDetailQueryKey(id)];
    const previousData = this.getQueryData<AppointmentResponseDto>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const appointmentsApi = new AppointmentsApi();