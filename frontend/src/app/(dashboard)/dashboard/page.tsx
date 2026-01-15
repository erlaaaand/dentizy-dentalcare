// frontend/src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useAuth, useRole } from '@/core/hooks';
import { DashboardSkeleton } from './components/skeleton/DashboardSkeleton';
import { KepalaKlinikDashboard } from './components/layouts/KepalaKlinikDashboard';
import { DokterDashboard } from './components/layouts/DokterDashboard';
import { StafDashboard } from './components/layouts/StafDashboard';

export default function DashboardPage() {
    const { loading: authLoading } = useAuth();
    const { isKepalaKlinik, isDokter, isStaf } = useRole();

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
            <DokterDashboard />
        );
    }

    if (isStaf) {
        return (
            <StafDashboard />
        );
    }

    // Fallback jika role tidak dikenali tapi sudah login
    return <DashboardSkeleton />;
}