import { useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import {
  usePaymentsControllerProcess,
  usePaymentsControllerCreate,
  usePaymentsControllerFindAll,
  usePaymentsControllerFindByNomorInvoice,
  usePaymentsControllerFindByMedicalRecordId,
  usePaymentsControllerFindByPatientId,
  usePaymentsControllerGetStatistics,
  usePaymentsControllerGetTotalRevenue,
  usePaymentsControllerGetRevenueByPeriod,
  usePaymentsControllerFindOne,
  usePaymentsControllerUpdate,
  usePaymentsControllerRemove,
  usePaymentsControllerCancel,
  getPaymentsControllerFindAllQueryKey,
  getPaymentsControllerFindOneQueryKey,
  getPaymentsControllerFindByNomorInvoiceQueryKey,
  getPaymentsControllerFindByMedicalRecordIdQueryKey,
  getPaymentsControllerFindByPatientIdQueryKey
} from '../../api/generated/payments/payments';

import {
    paymentsApi,
    paymentsHelpers,
} from '../../service/api/payments/payments.api'

import type {
  PaymentResponseDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentsControllerFindAllParams,
  PaymentsControllerFindByPatientIdParams,
  PaymentsControllerGetRevenueByPeriodParams,
  PaymentsControllerGetStatisticsParams,
  PaymentsControllerGetTotalRevenueParams,
  CreatePaymentFormData,
  UpdatePaymentFormData,
  ProcessPaymentFormData,
  PaymentValidation
} from '../../types/payments/payments.types';

/**
 * Hook untuk mendapatkan daftar payments
 */
export const usePayments = (
  params?: PaymentsControllerFindAllParams,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
  }
) => {
  const { enabled = true, refetchOnMount = true } = options || {};

  const query = usePaymentsControllerFindAll(params, {
    query: {
      enabled,
      refetchOnMount,
      staleTime: 1 * 60 * 1000 // 1 minute
    }
  });

  const payments = query.data?.data || [];

  return {
    ...query,
    payments,
    totalPayments: payments.length
  };
};

/**
 * Hook untuk mendapatkan single payment
 */
export const usePayment = (
  id: number,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = usePaymentsControllerFindOne(id, {
    query: {
      enabled: enabled && !!id
    }
  });

  const payment = query.data?.data;

  return {
    ...query,
    payment,
    status: payment ? paymentsApi.getPaymentStatus(payment) : undefined
  };
};

/**
 * Hook untuk mencari payment by invoice
 */
export const usePaymentByInvoice = (
  nomorInvoice: string,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = usePaymentsControllerFindByNomorInvoice(nomorInvoice, {
    query: {
      enabled: enabled && !!nomorInvoice
    }
  });

  return {
    ...query,
    payment: query.data?.data
  };
};

/**
 * Hook untuk mencari payment by medical record
 */
export const usePaymentByMedicalRecord = (
  medicalRecordId: number,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = usePaymentsControllerFindByMedicalRecordId(medicalRecordId, {
    query: {
      enabled: enabled && !!medicalRecordId
    }
  });

  return {
    ...query,
    payment: query.data?.data
  };
};

/**
 * Hook untuk mendapatkan payment history by patient
 */
export const usePaymentsByPatient = (
  patientId: number,
  params?: PaymentsControllerFindByPatientIdParams,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = usePaymentsControllerFindByPatientId(patientId, params, {
    query: {
      enabled: enabled && !!patientId
    }
  });

  const payments = query.data?.data || [];

  return {
    ...query,
    payments,
    totalPayments: payments.length
  };
};

/**
 * Hook untuk process payment (cashier)
 */
export const useProcessPayment = () => {
  const mutation = usePaymentsControllerProcess();

  const processPayment = useCallback(
    async (id: number, data: ProcessPaymentDto) => {
      const response = await mutation.mutateAsync({ id, data });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    processPayment,
    isProcessing: mutation.isPending
  };
};

/**
 * Hook untuk create payment
 */
export const useCreatePayment = () => {
  const mutation = usePaymentsControllerCreate();

  const createPayment = useCallback(
    async (data: CreatePaymentDto) => {
      const response = await mutation.mutateAsync({ data });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    createPayment,
    isCreating: mutation.isPending
  };
};

/**
 * Hook untuk update payment
 */
export const useUpdatePayment = () => {
  const mutation = usePaymentsControllerUpdate();

  const updatePayment = useCallback(
    async (id: number, data: UpdatePaymentDto) => {
      const response = await mutation.mutateAsync({ id, data });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    updatePayment,
    isUpdating: mutation.isPending
  };
};

/**
 * Hook untuk cancel payment
 */
export const useCancelPayment = () => {
  const mutation = usePaymentsControllerCancel();

  const cancelPayment = useCallback(
    async (id: number) => {
      const response = await mutation.mutateAsync({ id });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    cancelPayment,
    isCancelling: mutation.isPending
  };
};

/**
 * Hook untuk delete payment
 */
export const useDeletePayment = () => {
  const mutation = usePaymentsControllerRemove();

  const deletePayment = useCallback(
    async (id: number) => {
      await mutation.mutateAsync({ id });
    },
    [mutation]
  );

  return {
    ...mutation,
    deletePayment,
    isDeleting: mutation.isPending
  };
};

/**
 * Hook untuk payment statistics
 */
export const usePaymentStatistics = (
  params?: PaymentsControllerGetStatisticsParams,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = usePaymentsControllerGetStatistics(params, {
    query: {
      enabled,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  });

  return {
    ...query,
    statistics: query.data?.data
  };
};

/**
 * Hook untuk total revenue
 */
export const useTotalRevenue = (
  params?: PaymentsControllerGetTotalRevenueParams,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = usePaymentsControllerGetTotalRevenue(params, {
    query: {
      enabled,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  });

  return {
    ...query,
    totalRevenue: query.data?.data
  };
};

/**
 * Hook untuk revenue by period
 */
export const useRevenueByPeriod = (
  params: PaymentsControllerGetRevenueByPeriodParams,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  const query = usePaymentsControllerGetRevenueByPeriod(params, {
    query: {
      enabled,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  });

  return {
    ...query,
    revenueByPeriod: query.data?.data
  };
};

/**
 * Hook untuk payment validation
 */
export const usePaymentValidation = () => {
  const validate = useCallback((data: CreatePaymentFormData): PaymentValidation => {
    return paymentsApi.validatePayment(data);
  }, []);

  const calculateKembalian = useCallback(
    (totalBiaya: number, jumlahBayar: number): number => {
      return paymentsApi.calculateKembalian(totalBiaya, jumlahBayar);
    },
    []
  );

  return {
    validate,
    calculateKembalian
  };
};

/**
 * Hook untuk payment actions
 */
export const usePaymentActions = (queryClient: QueryClient) => {
  const invalidateAll = useCallback(async () => {
    await paymentsApi.invalidateAll(queryClient);
  }, [queryClient]);

  const invalidateOne = useCallback(
    async (id: number) => {
      await queryClient.invalidateQueries({
        queryKey: getPaymentsControllerFindOneQueryKey(id)
      });
    },
    [queryClient]
  );

  const invalidateByInvoice = useCallback(
    async (nomorInvoice: string) => {
      await queryClient.invalidateQueries({
        queryKey: getPaymentsControllerFindByNomorInvoiceQueryKey(nomorInvoice)
      });
    },
    [queryClient]
  );

  return {
    invalidateAll,
    invalidateOne,
    invalidateByInvoice
  };
};

/**
 * Hook untuk complete payment flow (cashier)
 */
export const usePaymentCashierFlow = (queryClient: QueryClient) => {
  const { processPayment, isProcessing } = useProcessPayment();
  const { calculateKembalian } = usePaymentValidation();
  const { invalidateAll } = usePaymentActions(queryClient);

  const processCashierPayment = useCallback(
    async (
      id: number,
      data: ProcessPaymentFormData
    ): Promise<{
      success: boolean;
      data?: PaymentResponseDto;
      kembalian?: number;
      error?: Error;
    }> => {
      try {
        // Calculate change
        const payment = await paymentsApi.processPayment(id, data);
        const kembalian = calculateKembalian(
          payment.totalBiaya,
          data.jumlah_bayar
        );

        // Invalidate queries
        await invalidateAll();

        return {
          success: true,
          data: payment,
          kembalian
        };
      } catch (error) {
        return {
          success: false,
          error: error as Error
        };
      }
    },
    [processPayment, calculateKembalian, invalidateAll]
  );

  return {
    processCashierPayment,
    isProcessing
  };
};

/**
 * Hook untuk complete CRUD flow
 */
export const usePaymentCRUD = (queryClient: QueryClient) => {
  const { createPayment, isCreating } = useCreatePayment();
  const { updatePayment, isUpdating } = useUpdatePayment();
  const { deletePayment, isDeleting } = useDeletePayment();
  const { cancelPayment, isCancelling } = useCancelPayment();
  const { invalidateAll } = usePaymentActions(queryClient);
  const { validate } = usePaymentValidation();

  const create = useCallback(
    async (data: CreatePaymentFormData): Promise<{
      success: boolean;
      data?: PaymentResponseDto;
      validation?: PaymentValidation;
      error?: Error;
    }> => {
      const validation = validate(data);
      if (!validation.isValid) {
        return { success: false, validation };
      }

      try {
        const result = await createPayment(data);
        await invalidateAll();
        return { success: true, data: result ?? undefined};
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [createPayment, validate, invalidateAll]
  );

  const update = useCallback(
    async (
      id: number,
      data: UpdatePaymentFormData
    ): Promise<{
      success: boolean;
      data?: PaymentResponseDto;
      error?: Error;
    }> => {
      try {
        const result = await updatePayment(id, data);
        await invalidateAll();
        return { success: true, data: result ?? undefined };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [updatePayment, invalidateAll]
  );

  const remove = useCallback(
    async (id: number): Promise<{
      success: boolean;
      error?: Error;
    }> => {
      try {
        await deletePayment(id);
        await invalidateAll();
        return { success: true };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [deletePayment, invalidateAll]
  );

  const cancel = useCallback(
    async (id: number): Promise<{
      success: boolean;
      data?: PaymentResponseDto;
      error?: Error;
    }> => {
      try {
        const result = await cancelPayment(id);
        await invalidateAll();
        return { success: true, data: result ?? undefined };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    [cancelPayment, invalidateAll]
  );

  return {
    create,
    update,
    remove,
    cancel,
    isCreating,
    isUpdating,
    isDeleting,
    isCancelling,
    isLoading: isCreating || isUpdating || isDeleting || isCancelling
  };
};

/**
 * Hook untuk query keys
 */
export const usePaymentQueryKeys = () => {
  const getListKey = useCallback((params?: PaymentsControllerFindAllParams) => {
    return getPaymentsControllerFindAllQueryKey(params);
  }, []);

  const getOneKey = useCallback((id: number) => {
    return getPaymentsControllerFindOneQueryKey(id);
  }, []);

  const getByInvoiceKey = useCallback((nomorInvoice: string) => {
    return getPaymentsControllerFindByNomorInvoiceQueryKey(nomorInvoice);
  }, []);

  const getByMedicalRecordKey = useCallback((medicalRecordId: number) => {
    return getPaymentsControllerFindByMedicalRecordIdQueryKey(medicalRecordId);
  }, []);

  const getByPatientKey = useCallback(
    (patientId: number, params?: PaymentsControllerFindByPatientIdParams) => {
      return getPaymentsControllerFindByPatientIdQueryKey(patientId, params);
    },
    []
  );

  return {
    getListKey,
    getOneKey,
    getByInvoiceKey,
    getByMedicalRecordKey,
    getByPatientKey
  };
};

// Export helpers
export { paymentsHelpers };

// Export types
export type {
  PaymentResponseDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentValidation
};