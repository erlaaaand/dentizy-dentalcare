'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useHealthMonitoring } from '@/src/core/hooks/health-check/monitoring';
import type { HealthStatus } from '@/src/core/service/api/health-check';

// ==================== TYPES ====================

interface HealthMonitoringContextType {
  /** Status health check secara keseluruhan */
  status: HealthStatus | undefined;
  /** true jika backend berstatus healthy */
  isHealthy: boolean;
  /** true jika backend berstatus degraded */
  isDegraded: boolean;
  /** true jika backend berstatus unhealthy */
  isUnhealthy: boolean;
  /** Warna representasi status: 'green' | 'yellow' | 'red' | 'gray' */
  statusColor: string;
  /** Label status dalam Bahasa Indonesia */
  statusLabel: string;
  /** Ikon pendek untuk status */
  statusIcon: string;
  /** true saat sedang melakukan health check */
  isLoading: boolean;
  /** true jika health check mengalami error */
  isError: boolean;
  /** Fungsi untuk memicu health check secara manual */
  refetch: () => void;
}

// ==================== OPTIONS ====================

interface HealthMonitoringProviderOptions {
  /** Aktifkan health monitoring (default: true) */
  enabled?: boolean;
  /** Interval polling dalam ms (default: 30.000) */
  refetchInterval?: number;
  /**
   * Tampilkan banner maintenance otomatis di bagian atas
   * ketika status isDegraded atau isUnhealthy (default: true)
   */
  showMaintenanceBanner?: boolean;
}

// ==================== CONTEXT ====================

const HealthMonitoringContext = createContext<
  HealthMonitoringContextType | undefined
>(undefined);

// ==================== PROVIDER ====================

export function HealthMonitoringProvider({
  children,
  enabled = true,
  refetchInterval = 30_000,
  showMaintenanceBanner = true,
}: HealthMonitoringProviderOptions & { children: ReactNode }) {
  const monitoring = useHealthMonitoring({ enabled, refetchInterval });

  const value = useMemo<HealthMonitoringContextType>(
    () => ({
      status: monitoring.status,
      isHealthy: monitoring.isHealthy,
      isDegraded: monitoring.isDegraded,
      isUnhealthy: monitoring.isUnhealthy,
      statusColor: monitoring.statusColor,
      statusLabel: monitoring.statusLabel,
      statusIcon: monitoring.statusIcon,
      isLoading: monitoring.isLoading,
      isError: monitoring.isError,
      refetch: monitoring.refetch,
    }),
    [
      monitoring.status,
      monitoring.isHealthy,
      monitoring.isDegraded,
      monitoring.isUnhealthy,
      monitoring.statusColor,
      monitoring.statusLabel,
      monitoring.statusIcon,
      monitoring.isLoading,
      monitoring.isError,
      monitoring.refetch,
    ]
  );

  const showBanner =
    showMaintenanceBanner &&
    !monitoring.isLoading &&
    (monitoring.isDegraded || monitoring.isUnhealthy);

  return (
    <HealthMonitoringContext.Provider value={value}>
      {showBanner && (
        <MaintenanceBanner
          isDegraded={monitoring.isDegraded}
          isUnhealthy={monitoring.isUnhealthy}
          statusLabel={monitoring.statusLabel}
          onRetry={monitoring.refetch}
        />
      )}
      {children}
    </HealthMonitoringContext.Provider>
  );
}

// ==================== MAINTENANCE BANNER ====================

interface MaintenanceBannerProps {
  isDegraded: boolean;
  isUnhealthy: boolean;
  statusLabel: string;
  onRetry: () => void;
}

function MaintenanceBanner({
  isDegraded,
  isUnhealthy,
  statusLabel,
  onRetry,
}: MaintenanceBannerProps) {
  const isCritical = isUnhealthy;
  
  const bannerClass = isCritical
    ? 'bg-red-600 text-white' 
    : 'bg-yellow-400 text-yellow-900';

  const icon = isCritical ? '🔴' : '🟡';

  const getMessage = () => {
    if (isCritical) {
      return `Sistem sedang mengalami gangguan (${statusLabel}). Beberapa fitur mungkin tidak tersedia sementara waktu.`;
    }
    if (isDegraded) {
      return `Koneksi sistem kurang stabil (${statusLabel}). Anda tetap dapat menggunakan aplikasi, namun performa mungkin melambat.`;
    }
    return '';
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-3 transition-colors duration-300 ${bannerClass}`}
    >
      <span aria-hidden="true">{icon}</span>
      <p>{getMessage()}</p>
      <button
        onClick={onRetry}
        className={`ml-2 px-2 py-1 rounded text-xs font-bold border transition-all ${
          isCritical 
            ? 'border-white hover:bg-white hover:text-red-600' 
            : 'border-yellow-900 hover:bg-yellow-900 hover:text-yellow-400'
        }`}
      >
        Segarkan Status
      </button>
    </div>
  );
}
// ==================== HOOK ====================

export function useHealthMonitoringContext(): HealthMonitoringContextType {
  const ctx = useContext(HealthMonitoringContext);
  if (!ctx) {
    throw new Error(
      'useHealthMonitoringContext harus digunakan di dalam HealthMonitoringProvider'
    );
  }
  return ctx;
}