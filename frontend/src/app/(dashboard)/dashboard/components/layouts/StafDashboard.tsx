// frontend/src/app/(dashboard)/dashboard/components/layouts/StafDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, ClipboardList, Activity, UserPlus } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import { Card, Button } from '@/components/ui'; // Asumsi ada Button component
import type { StatCardData, AppointmentListItem } from '@/app/(dashboard)/dashboard/types/dashboard.types';
import { StatsGrid } from '@/app/(dashboard)/dashboard/components/stats/StatsGrid';
import { AppointmentList } from '@/app/(dashboard)/dashboard/components/widgets/AppointmentList';

interface StafDashboardProps {
    user: any;
    patientStats: any;
    todayAppointments: any;
    loading: any;
}

export function StafDashboard({
    user,
    patientStats,
    todayAppointments,
    loading
}: StafDashboardProps) {
    const router = useRouter();

    const stats: StatCardData[] = [
        { title: 'Total Pasien', value: patientStats?.total ?? 0, icon: <Users className="w-6 h-6" />, color: 'blue' },
        { title: 'Antrian Hari Ini', value: todayAppointments?.count ?? 0, icon: <Calendar className="w-6 h-6" />, color: 'purple' },
        { title: 'Pasien Baru', value: patientStats?.new_this_month ?? 0, icon: <UserPlus className="w-6 h-6" />, color: 'green' },
    ];

    const appointments: AppointmentListItem[] = todayAppointments?.data?.map((apt: any) => ({
        id: apt.id,
        time: apt.jam_janji,
        patientName: apt.patient?.nama_lengkap || 'Pasien',
        complaint: apt.keluhan,
        status: apt.status
    })) || [];

    return (
        <div className="flex flex-col gap-6 w-full min-h-screen pb-24 animate-in fade-in duration-500">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Staf</h1>
                    <p className="text-gray-500 text-sm">Kelola pendaftaran dan antrian hari ini.</p>
                </div>
                <button
                    onClick={() => router.push(ROUTES.PATIENT_CREATE)}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2 font-medium text-sm w-full md:w-auto justify-center"
                >
                    <UserPlus className="w-4 h-4" />
                    Pendaftaran Baru
                </button>
            </div>

            {/* Stats */}
            <div className="w-full">
                <StatsGrid stats={stats} loading={loading.patients || loading.appointments} />
            </div>

            {/* Main Content: Appointment List */}
            <div className="grid grid-cols-1 gap-6 w-full h-full">
                <AppointmentList
                    appointments={appointments}
                    loading={loading.appointments}
                    title="Manajemen Antrian & Jadwal"
                    emptyMessage="Belum ada pasien terjadwal hari ini"
                />
            </div>
        </div>
    );
}