import type { 
  PaymentResponseDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  CreatePaymentDtoMetodePembayaran,
  CreatePaymentDtoStatusPembayaran,
  UpdatePaymentDtoMetodePembayaran,
  UpdatePaymentDtoStatusPembayaran,
  ProcessPaymentDtoMetodePembayaran,
  PaymentsControllerFindAllParams,
  PaymentsControllerFindByPatientIdParams,
  PaymentsControllerGetRevenueByPeriodParams,
  PaymentsControllerGetRevenueByPeriodGroupBy,
  PaymentsControllerGetStatisticsParams,
  PaymentsControllerGetTotalRevenueParams,
  PaymentsControllerFindAllMetodePembayaran,
  PaymentsControllerFindAllStatusPembayaran,
  MedicalRecordSubsetDto,
  PatientSubsetDto
} from '../../api/model';

// Re-export all DTOs
export type { 
  PaymentResponseDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  CreatePaymentDtoMetodePembayaran,
  CreatePaymentDtoStatusPembayaran,
  UpdatePaymentDtoMetodePembayaran,
  UpdatePaymentDtoStatusPembayaran,
  ProcessPaymentDtoMetodePembayaran,
  PaymentsControllerFindAllParams,
  PaymentsControllerFindByPatientIdParams,
  PaymentsControllerGetRevenueByPeriodParams,
  PaymentsControllerGetRevenueByPeriodGroupBy,
  PaymentsControllerGetStatisticsParams,
  PaymentsControllerGetTotalRevenueParams,
  PaymentsControllerFindAllMetodePembayaran,
  PaymentsControllerFindAllStatusPembayaran,
  MedicalRecordSubsetDto,
  PatientSubsetDto
};

// Re-export enums for runtime use
export { 
  CreatePaymentDtoMetodePembayaran as MetodePembayaran,
  CreatePaymentDtoStatusPembayaran as StatusPembayaran,
  PaymentsControllerGetRevenueByPeriodGroupBy as RevenueGroupBy
} from '../../api/model';

// Alias types untuk kemudahan penggunaan
export type Payment = PaymentResponseDto;
export type PaymentQueryParams = PaymentsControllerFindAllParams;
export type PaymentByPatientParams = PaymentsControllerFindByPatientIdParams;
export type RevenueByPeriodParams = PaymentsControllerGetRevenueByPeriodParams;
export type PaymentStatisticsParams = PaymentsControllerGetStatisticsParams;
export type TotalRevenueParams = PaymentsControllerGetTotalRevenueParams;

// Payment statistics response
export interface PaymentStatistics {
  total_payments: number;
  total_revenue: number;
  total_pending: number;
  total_completed: number;
  total_cancelled: number;
  payment_by_method: {
    tunai: number;
    transfer: number;
    kartu_kredit: number;
    kartu_debit: number;
    qris: number;
  };
  average_payment_amount: number;
}

// Revenue by period response
export interface RevenueByPeriod {
  period: string;
  total_revenue: number;
  total_payments: number;
  average_payment: number;
  payment_methods: {
    method: string;
    count: number;
    total: number;
  }[];
}

// Response types untuk pagination
export interface PaymentPaginatedResponse {
  data: PaymentResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form data untuk create payment
export interface CreatePaymentFormData extends CreatePaymentDto {
  autoCalculate?: boolean;
}

// Form data untuk update payment
export interface UpdatePaymentFormData extends UpdatePaymentDto {
  updateKembalian?: boolean;
}

// Form data untuk process payment
export interface ProcessPaymentFormData extends ProcessPaymentDto {
  validateAmount?: boolean;
}

// Filter options untuk UI
export interface PaymentFilters {
  medicalRecordId?: string;
  patientId?: string;
  statusPembayaran?: CreatePaymentDtoStatusPembayaran;
  metodePembayaran?: CreatePaymentDtoMetodePembayaran;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Payment dengan informasi tambahan untuk display
export interface PaymentDisplay extends PaymentResponseDto {
  status_label: string;
  method_label: string;
  is_overdue: boolean;
  days_since_created: number;
}

// Payment status tracking
export interface PaymentStatus {
  isPending: boolean;
  isCompleted: boolean;
  isPartial: boolean;
  isCancelled: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canProcess: boolean;
  canRefund: boolean;
}

// Type untuk payment dengan status yang dihitung
export interface PaymentWithStatus extends PaymentResponseDto {
  status: PaymentStatus;
}

// Payment dengan relasi yang sudah di-populate
export interface PaymentWithRelations extends PaymentResponseDto {
  patient: PatientSubsetDto;
  medicalRecord: MedicalRecordSubsetDto;
}

// Total revenue response
export interface TotalRevenueResponse {
  total_revenue: number;
  period: {
    start_date: string;
    end_date: string;
  };
  comparison?: {
    previous_period_revenue: number;
    growth_percentage: number;
  };
}

// Invoice details for display
export interface InvoiceDetails {
  nomorInvoice: string;
  tanggalPembayaran: string;
  patient: {
    id: string;
    name: string;
    medical_record_number: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount: number;
    total: number;
  }[];
  totalBiaya: number;
  totalAkhir: number;
  jumlahBayar: number;
  kembalian: number;
  metodePembayaran: string;
  statusPembayaran: string;
  keterangan?: string;
}

// Enum untuk metode pembayaran (untuk type safety dan UI)
export enum PaymentMethod {
  TUNAI = 'tunai',
  TRANSFER = 'transfer',
  KARTU_KREDIT = 'kartu_kredit',
  KARTU_DEBIT = 'kartu_debit',
  QRIS = 'qris'
}

// Enum untuk status pembayaran
export enum PaymentStatusEnum {
  PENDING = 'pending',
  LUNAS = 'lunas',
  SEBAGIAN = 'sebagian',
  DIBATALKAN = 'dibatalkan'
}

// Enum untuk grouping revenue
export enum RevenueGroupByEnum {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year'
}

// Helper type untuk payment validation
export interface PaymentValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// Payment summary for dashboard
export interface PaymentSummary {
  today: {
    count: number;
    total: number;
  };
  this_week: {
    count: number;
    total: number;
  };
  this_month: {
    count: number;
    total: number;
  };
  pending: {
    count: number;
    total: number;
  };
}