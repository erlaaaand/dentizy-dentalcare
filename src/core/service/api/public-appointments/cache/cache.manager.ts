import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getPublicAppointmentsControllerGetDoctorsQueryKey
} from '../../../../api/generated/public-appointments/public-appointments';

import { publicAppointmentsService } from '../public-appointments.api';

/**
 * Public Appointments Cache Manager
 * Manages React Query cache for public appointments
 * Extends BaseService for common cache operations
 */
export class PublicAppointmentsCacheManager extends BaseService {
  /**
   * Get doctors query key
   */
  getDoctorsQueryKey() {
    return getPublicAppointmentsControllerGetDoctorsQueryKey();
  }

  /**
   * Invalidate doctors
   */
  invalidateDoctors(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, this.getDoctorsQueryKey());
  }

  /**
   * Invalidate all
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, ['/public-appointments']);
  }

  /**
   * Prefetch doctors list
   */
  async prefetchDoctors(queryClient: QueryClient): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getDoctorsQueryKey(),
      () => publicAppointmentsService.getDoctors()
    );
  }

  /**
   * Refetch doctors
   */
  async refetchDoctors(queryClient: QueryClient): Promise<void> {
    await this.refetchQueries(queryClient, this.getDoctorsQueryKey());
  }
}

export const publicAppointmentsCacheManager = new PublicAppointmentsCacheManager();