import { useQuery } from '@tanstack/react-query';
import { customInstance } from '@/core/services/http/axiosInstance';

// 1. Hook Laporan Keuangan (Revenue) - Dari Module Payments
export const useRevenueReport = (params: { startDate: string; endDate: string; groupBy: 'day' | 'month' }) => {
    return useQuery({
        queryKey: ['/payments/revenue/period', params],
        queryFn: () => customInstance({
            url: '/payments/revenue/period',
            method: 'GET',
            params
        })
    });
};

// 2. Hook Kinerja Dokter - Dari Module Medical Records
export const useDoctorPerformance = (params: { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ['/medical-records/stats/doctors', params],
        queryFn: () => customInstance({
            url: '/medical-records/stats/doctors', // Pastikan endpoint ini sudah Anda buat di Backend
            method: 'GET',
            params
        })
    });
};

// 3. Hook Analisis Tindakan - Dari Module Medical Record Treatments
export const useTreatmentAnalytics = (params: { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ['/medical-record-treatments/stats/top-treatments', params],
        queryFn: () => customInstance({
            url: '/medical-record-treatments/stats/top-treatments', // Pastikan endpoint ini sudah Anda buat di Backend
            method: 'GET',
            params
        })
    });
};