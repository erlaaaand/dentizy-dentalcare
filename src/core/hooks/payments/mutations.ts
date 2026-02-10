import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { paymentsService } from '../../service/api/payments/payments.api';
import { PaymentsCacheManager } from '../../service/api/payments/cache/cache.manager';
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
} from '../../types/payments/payments.types';

const cacheManager = new PaymentsCacheManager();

export const useCreatePayment = createMutationHook({
  mutationFn: (data: CreatePaymentDto) => paymentsService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Pembayaran berhasil dibuat');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal membuat pembayaran');
  },
});

export const useUpdatePayment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdatePaymentDto }) =>
    paymentsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Pembayaran berhasil diperbarui');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui pembayaran');
  },
});

export const useProcessPayment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: ProcessPaymentDto }) =>
    paymentsService.processPayment(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Pembayaran berhasil diproses');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal memproses pembayaran');
  },
});

export const useCancelPayment = createMutationHook({
  mutationFn: (id: string) => paymentsService.cancel(id),
  onSuccess: (_, id, queryClient) => {
    toast.success('Pembayaran berhasil dibatalkan');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal membatalkan pembayaran');
  },
});

export const useRemovePayment = createMutationHook({
  mutationFn: (id: string) => paymentsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Pembayaran berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus pembayaran');
  },
});