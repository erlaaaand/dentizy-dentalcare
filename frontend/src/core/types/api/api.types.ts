/**
 * Tipe standar untuk handling response yang mungkin 'unknown' dari Orval
 * Gunakan ini untuk type casting yang aman.
 */

// Interface untuk Response Login (sesuaikan dengan output backend Anda)
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Interface standar untuk error API
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
}

// Helper type untuk opsi query React Query agar tidak redundan
export type QueryEnabled = {
  enabled?: boolean;
};