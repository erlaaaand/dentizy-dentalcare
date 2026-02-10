import { keepPreviousData } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { treatmentsService } from '../../service/api/treatments/treatment.api';
import type { TreatmentQueryParams } from '../../types/treatments/treatment.types';
import { TreatmentsCacheManager } from '../../service/api/treatments';

const cacheManager = new TreatmentsCacheManager();

export const useTreatments = createQueryHook({
  queryKey: (params?: TreatmentQueryParams) => 
    cacheManager.getListQueryKey(params),
  queryFn: (params) => treatmentsService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  },
});

export const useTreatment = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => treatmentsService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});

export const useTreatmentByKode = createQueryHook({
  queryKey: (kode?: string) => cacheManager.getByKodeQueryKey(kode!),
  queryFn: (kode) => treatmentsService.findByKode(kode!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});