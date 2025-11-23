// frontend/src/app/(dashboard)/page.tsx
'use client';

import { useAuth, useRole } from '@/core/hooks';
import { Skeleton } from '@/components/ui';
import { useDashboardData } from '@/app/(dashboard)/dashboard/hooks/useDashboardData';
import { WelcomeBanner } from '@/app/(dashboard)/dashboard/components/widgets/WelcomeBanner';
import { StatsGrid } from '@/app/(dashboard)/dashboard/components/stats/StatsGrid';
import { QuickActions } from '@/app/(dashboard)/dashboard/components/widgets/QuickActions';
import { AppointmentList } from '@/app/(dashboard)/dashboard/components/widgets/AppointmentList';
import {
    Users,
    UserPlus,
    FileText,
    Bell,
    ClipboardList,
    Calendar,
    Sparkles,
    Settings,
    BarChart3,
    FolderPlus
} from 'lucide-react';
import { ROUTES } from '@/core/constants';
import type { StatCardData, QuickAction, AppointmentListItem } from '@/app/(dashboard)/dashboard/types/dashboard.types';

// Dashboard Skeleton
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-36 w-full rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    );
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { isKepalaKlinik, isDokter, isStaf } = useRole();
    const { patientStats, userStats, notifStats, todayAppointments, loading } = useDashboardData();

    // Loading state
    if (authLoading) {
        return <DashboardSkeleton />;
    }

    // ========================================
    // KEPALA KLINIK DASHBOARD
    // ========================================
    if (isKepalaKlinik) {
        const stats: StatCardData[] = [
            {
                title: 'Total Pasien',
                value: patientStats?.total ?? 0,
                icon: <Users className="w-6 h-6" />,
                color: 'blue',
                trend: { value: 12, isPositive: true, label: 'vs bulan lalu' }
            },
            {
                title: 'Pasien Baru',
                value: patientStats?.new_this_month ?? 0,
                icon: <UserPlus className="w-6 h-6" />,
                color: 'green',
                trend: { value: 8, isPositive: true, label: 'bulan ini' }
            },
            {
                title: 'Total Pengguna',
                value: userStats?.total ?? 0,
                icon: <FileText className="w-6 h-6" />,
                color: 'purple'
            },
            {
                title: 'Notifikasi',
                value: notifStats?.pending ?? 0,
                icon: <Bell className="w-6 h-6" />,
                color: 'orange'
            },
        ];

        const quickActions: QuickAction[] = [
            { id: '1', label: 'Tambah User', icon: <UserPlus className="w-6 h-6 text-blue-600" />, href: ROUTES.USER_CREATE },
            { id: '2', label: 'Lihat Laporan', icon: <BarChart3 className="w-6 h-6 text-green-600" />, href: ROUTES.REPORTS },
            { id: '3', label: 'Manajemen User', icon: <Users className="w-6 h-6 text-purple-600" />, href: ROUTES.USERS },
            { id: '4', label: 'Pengaturan', icon: <Settings className="w-6 h-6 text-orange-600" />, href: ROUTES.SETTINGS },
        ];

        return (
            <div className="space-y-6">
                <WelcomeBanner
                    userName={user?.nama_lengkap as string || 'Admin'}
                    subtitle="Ringkasan operasional klinik hari ini"
                    loading={authLoading}
                />

                <StatsGrid
                    stats={stats}
                    loading={loading.patients || loading.users || loading.notifications}
                />

                <QuickActions actions={quickActions} />
            </div>
        );
    }

    // ========================================
    // DOKTER DASHBOARD
    // ========================================
    if (isDokter) {
        const stats: StatCardData[] = [
            {
                title: 'Pasien Saya',
                value: patientStats?.total ?? 0,
                icon: <Users className="w-6 h-6" />,
                color: 'teal'
            },
            {
                title: 'Jadwal Hari Ini',
                value: todayAppointments?.count ?? 0,
                icon: <Calendar className="w-6 h-6" />,
                color: 'blue'
            },
        ];

        const appointments: AppointmentListItem[] = todayAppointments?.data?.map((apt: any) => ({
            id: apt.id,
            time: apt.jam_janji,
            patientName: apt.patient?.nama_lengkap || 'Pasien',
            complaint: apt.keluhan,
            status: apt.status
        })) || [];

        return (
            <div className="space-y-6">
                <WelcomeBanner
                    userName={`Dr. ${user?.nama_lengkap as string}` || 'Dokter'}
                    subtitle="Siap melayani pasien hari ini!"
                    loading={authLoading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <StatsGrid stats={stats} loading={loading.patients || loading.appointments} />
                    </div>

                    <div className="lg:col-span-2">
                        <AppointmentList
                            appointments={appointments}
                            loading={loading.appointments}
                            title="Jadwal Praktik Hari Ini"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // STAF DASHBOARD
    // ========================================
    if (isStaf) {
        const stats: StatCardData[] = [
            {
                title: 'Total Pasien',
                value: patientStats?.total ?? 0,
                icon: <ClipboardList className="w-6 h-6" />,
                color: 'blue'
            },
            {
                title: 'Janji Temu Hari Ini',
                value: todayAppointments?.count ?? 0,
                icon: <Calendar className="w-6 h-6" />,
                color: 'purple'
            },
            {
                title: 'Pasien Baru (30 Hari)',
                value: patientStats?.new_this_month ?? 0,
                icon: <Sparkles className="w-6 h-6" />,
                color: 'green'
            },
        ];

        const quickActions: QuickAction[] = [
            { id: '1', label: 'Pendaftaran Baru', icon: <FolderPlus className="w-6 h-6 text-blue-600" />, href: ROUTES.PATIENT_CREATE },
            { id: '2', label: 'Daftar Pasien', icon: <Users className="w-6 h-6 text-purple-600" />, href: ROUTES.PATIENTS },
        ];

        const appointments: AppointmentListItem[] = todayAppointments?.data?.map((apt: any) => ({
            id: apt.id,
            time: apt.jam_janji,
            patientName: apt.patient?.nama_lengkap || 'Pasien',
            complaint: apt.keluhan,
            status: apt.status
        })) || [];

        return (
            <div className="space-y-6">
                <WelcomeBanner
                    userName={user?.nama_lengkap as string || 'Staf'}
                    subtitle="Kelola pendaftaran dan antrian pasien"
                    loading={authLoading}
                />

                <StatsGrid stats={stats} loading={loading.patients || loading.appointments} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <QuickActions actions={quickActions} />
                    </div>

                    <div className="lg:col-span-2">
                        <AppointmentList
                            appointments={appointments}
                            loading={loading.appointments}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return <DashboardSkeleton />;
}