import {
  type PaymentResponseDto,
  type ProcessPaymentDto,
  type PaymentsControllerFindAllParams,
  // Import Enums dari Generated Model
  PaymentsControllerFindAllStatusPembayaran,
  PaymentsControllerFindAllMetodePembayaran,
  ProcessPaymentDtoMetodePembayaran
} from "@/src/core/api/model"

export type {
  PaymentResponseDto,
  ProcessPaymentDto,
  PaymentsControllerFindAllParams
}

// Export Enum agar bisa dipakai di Schema & Component
export { 
  PaymentsControllerFindAllStatusPembayaran,
  PaymentsControllerFindAllMetodePembayaran,
  ProcessPaymentDtoMetodePembayaran 
}

// --- STRICT PAYLOAD ---
// Payload untuk form frontend
export interface StrictProcessPaymentDto {
  jumlahBayar: number
  metodePembayaran: ProcessPaymentDtoMetodePembayaran
  keterangan?: string
}

// Helper untuk Response API yang Paginated (Sesuai struktur backend Anda)
export interface ApiPaginatedResponse<T> {
  data: T[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  // Fallback field jika struktur di root
  total?: number
  totalPages?: number
}