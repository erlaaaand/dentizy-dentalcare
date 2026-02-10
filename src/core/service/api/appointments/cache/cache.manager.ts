import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getAppointmentsControllerFindAllQueryKey,
  getAppointmentsControllerFindOneQueryKey,
} from '../../../../api/generated/appointments/appointments';

import type {
  AppointmentQueryParams,
  AppointmentResponseDto,
} from '../../../../types/appointments/appointment.types';

import { appointmentsService } from '../appointment.api';

/**
 * Appointments Cache Manager
 * Manages React Query cache for appointments
 * Extends BaseService for common cache operations
 */
export class AppointmentsCacheManager extends BaseService {
  /**
   * Get query key for list
   */
  getListQueryKey(params?: AppointmentQueryParams) {
    return getAppointmentsControllerFindAllQueryKey(params);
  }

  /**
   * Get query key for detail
   */
  getDetailQueryKey(id: string) {
    return getAppointmentsControllerFindOneQueryKey(id);
  }

  /**
   * Invalidate all appointment lists
   */
  invalidateList(queryClient: QueryClient, params?: AppointmentQueryParams): Promise<void> {
    return this.invalidateQueries(queryClient, [...this.getListQueryKey(params)]);
  }

  /**
   * Invalidate specific appointment detail
   */
  invalidateDetail(queryClient: QueryClient, id: string): Promise<void> {
    return this.invalidateQueries(queryClient, [...this.getDetailQueryKey(id)]);
  }

  /**
   * Invalidate all appointment queries
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, ['/appointments']);
  }

  /**
   * Remove appointment detail cache (after delete)
   */
  removeDetail(queryClient: QueryClient, id: string): void {
    this.removeQueries(queryClient, [...this.getDetailQueryKey(id)]);
  }

  /**
   * Prefetch appointment list
   */
  async prefetchList(queryClient: QueryClient, params?: AppointmentQueryParams): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      [...this.getListQueryKey(params)],
      () => appointmentsService.findAll(params)
    );
  }

  /**
   * Prefetch appointment detail
   */
  async prefetchDetail(queryClient: QueryClient, id: string): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      [...this.getDetailQueryKey(id)],
      () => appointmentsService.findOne(id)
    );
  }

  /**
   * Optimistic update for appointment
   */
  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: AppointmentResponseDto) => AppointmentResponseDto
  ): AppointmentResponseDto | undefined {
    const queryKey = [...this.getDetailQueryKey(id)];
    const previousData = this.getQueryData<AppointmentResponseDto>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const appointmentsCacheManager = new AppointmentsCacheManager();