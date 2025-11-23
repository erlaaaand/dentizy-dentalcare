// frontend/src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useAuth, useRole } from '@/core/hooks';
import { useDashboardData } from '@/app/(dashboard)/dashboard/hooks/useDashboardData';
import { DashboardSkeleton } from './components/skeleton/DashboardSkeleton';
import { KepalaKlinikDashboard } from './components/layouts/KepalaKlinikDashboard';
import { DokterDashboard } from './components/layouts/DokterDashboard';
import { StafDashboard } from './components/layouts/StafDashboard';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { isKepalaKlinik, isDokter, isStaf } = useRole();
    const { patientStats, userStats, notifStats, todayAppointments, loading } = useDashboardData();

    // Loading state awal (Auth check)
    if (authLoading) {
        return <DashboardSkeleton />;
    }

    // Render Layout Berdasarkan Role
    if (isKepalaKlinik) {
        return (
            <KepalaKlinikDashboard />
        );
    }

    if (isDokter) {
        return (
            <DokterDashboard
                user={user}
                patientStats={patientStats}
                todayAppointments={todayAppointments}
                loading={loading}
            />
        );
    }

    if (isStaf) {
        return (
            <StafDashboard
                user={user}
                patientStats={patientStats}
                todayAppointments={todayAppointments}
                loading={loading}
            />
        );
    }

    // Fallback jika role tidak dikenali tapi sudah login
    return <DashboardSkeleton />;
}