// frontend/src/core/services/api/payments.api.ts

import {
    // --- Hooks (Untuk React Component) ---
    usePaymentsControllerCreate as useCreatePayment,
    usePaymentsControllerFindAll as usePayments,
    usePaymentsControllerFindOne as usePayment,
    usePaymentsControllerFindByNomorInvoice as usePaymentByInvoice,
    usePaymentsControllerFindByMedicalRecordId as usePaymentByMedicalRecord,
    usePaymentsControllerFindByPatientId as usePaymentsByPatient,
    usePaymentsControllerUpdate as useUpdatePayment,
    usePaymentsControllerRemove as useDeletePayment,
    usePaymentsControllerCancel as useCancelPayment,

    // Hooks Statistik & Revenue
    usePaymentsControllerGetStatistics as usePaymentStatistics,
    usePaymentsControllerGetTotalRevenue as useTotalRevenue,
    usePaymentsControllerGetRevenueByPeriod as useRevenueByPeriod,

    // --- API Functions (Untuk penggunaan manual non-hook) ---
    paymentsControllerCreate as createPayment,
    paymentsControllerFindAll as getPayments,
    paymentsControllerFindOne as getPayment,
    paymentsControllerFindByNomorInvoice as getPaymentByInvoice,
    paymentsControllerFindByMedicalRecordId as getPaymentByMedicalRecord,
    paymentsControllerFindByPatientId as getPaymentsByPatient,
    paymentsControllerUpdate as updatePayment,
    paymentsControllerRemove as deletePayment,
    paymentsControllerCancel as cancelPayment,

    // Functions Statistik & Revenue
    paymentsControllerGetStatistics as getPaymentStatistics,
    paymentsControllerGetTotalRevenue as getTotalRevenue,
    paymentsControllerGetRevenueByPeriod as getRevenueByPeriod,

    // --- Query Keys (Untuk invalidasi cache) ---
    getPaymentsControllerFindAllQueryKey as getPaymentsQueryKey,
    getPaymentsControllerFindOneQueryKey as getPaymentQueryKey,
    getPaymentsControllerFindByNomorInvoiceQueryKey as getPaymentByInvoiceQueryKey,
    getPaymentsControllerFindByMedicalRecordIdQueryKey as getPaymentByMedicalRecordQueryKey,
    getPaymentsControllerFindByPatientIdQueryKey as getPaymentsByPatientQueryKey,
    getPaymentsControllerGetStatisticsQueryKey as getPaymentStatisticsQueryKey,
    getPaymentsControllerGetTotalRevenueQueryKey as getTotalRevenueQueryKey,
    getPaymentsControllerGetRevenueByPeriodQueryKey as getRevenueByPeriodQueryKey,

} from '@/core/api/generated/payments/payments'; // Pastikan path sesuai hasil generate

// Export Alias
export {
    // Hooks
    useCreatePayment,
    usePayments,
    usePayment,
    usePaymentByInvoice,
    usePaymentByMedicalRecord,
    usePaymentsByPatient,
    useUpdatePayment,
    useDeletePayment,
    useCancelPayment,
    usePaymentStatistics,
    useTotalRevenue,
    useRevenueByPeriod,

    // API Functions
    createPayment,
    getPayments,
    getPayment,
    getPaymentByInvoice,
    getPaymentByMedicalRecord,
    getPaymentsByPatient,
    updatePayment,
    deletePayment,
    cancelPayment,
    getPaymentStatistics,
    getTotalRevenue,
    getRevenueByPeriod,

    // Query Keys
    getPaymentsQueryKey,
    getPaymentQueryKey,
    getPaymentByInvoiceQueryKey,
    getPaymentByMedicalRecordQueryKey,
    getPaymentsByPatientQueryKey,
    getPaymentStatisticsQueryKey,
    getTotalRevenueQueryKey,
    getRevenueByPeriodQueryKey,
};

// Export Types (Model terkait Payments)
export type {
    CreatePaymentDto,
    UpdatePaymentDto,
    PaymentResponseDto,

    // Params untuk Filtering & Reporting
    PaymentsControllerFindAllParams,
    PaymentsControllerFindByPatientIdParams,
    PaymentsControllerGetStatisticsParams,
    PaymentsControllerGetTotalRevenueParams,
    PaymentsControllerGetRevenueByPeriodParams,

    PaymentsControllerFindAllMetodePembayaran,
    PaymentsControllerFindAllStatusPembayaran,
    PaymentsControllerGetRevenueByPeriodGroupBy,

    CreatePaymentDtoMetodePembayaran,
    CreatePaymentDtoStatusPembayaran,
    UpdatePaymentDtoMetodePembayaran,
    UpdatePaymentDtoStatusPembayaran,
} from '@/core/api/model';