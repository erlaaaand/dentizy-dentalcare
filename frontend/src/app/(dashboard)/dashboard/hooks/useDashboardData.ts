// frontend/src/features/dashboard/hooks/useDashboardData.ts

import { useRole } from '@/core/hooks';
import {
    useGetPatientStatistics,
    useGetUserStatistics,
    useGetNotificationStats,
    useGetAppointments
} from '@/core/services/api';
import type { PatientStats, UserStats } from '../types/dashboard.types';

export function useDashboardData() {
    const { isKepalaKlinik, isDokter, isStaf } = useRole();

    // Fetch data berdasarkan role
    const {
        data: rawPatientStats,
        isLoading: loadingPatients
    } = useGetPatientStatistics({
        query: { enabled: isKepalaKlinik || isStaf || isDokter }
    });

    const {
        data: rawUserStats,
        isLoading: loadingUsers
    } = useGetUserStatistics({
        query: { enabled: isKepalaKlinik }
    });

    const {
        data: notifStats,
        isLoading: loadingNotifs
    } = useGetNotificationStats({
        query: { enabled: isKepalaKlinik }
    });

    const {
        data: todayAppointments,
        isLoading: loadingAppointments
    } = useGetAppointments({
        date: new Date().toISOString().split('T')[0],
        limit: 10,
    }, {
        query: { enabled: isDokter || isStaf }
    });

    // Type casting
    const patientStats = rawPatientStats as unknown as PatientStats;
    const userStats = rawUserStats as unknown as UserStats;

    return {
        patientStats,
        userStats,
        notifStats,
        todayAppointments,
        loading: {
            patients: loadingPatients,
            users: loadingUsers,
            notifications: loadingNotifs,
            appointments: loadingAppointments,
        }
    };
}