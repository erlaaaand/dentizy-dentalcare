// frontend/src/app/(dashboard)/dashboard/components/layouts/DokterDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, ClipboardList, Activity } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import { Card, DataTable } from '@/components/ui';
import type { StatCardData, AppointmentListItem } from '@/app/(dashboard)/dashboard/types/dashboard.types';
import { StatsGrid } from '@/app/(dashboard)/dashboard/components/stats/StatsGrid';
import { AppointmentList } from '@/app/(dashboard)/dashboard/components/widgets/AppointmentList';

interface DokterDashboardProps {
    user: any;
    patientStats: any;
    todayAppointments: any;
    loading: any;
}

export function DokterDashboard({
    user,
    patientStats,
    todayAppointments,
    loading
}: DokterDashboardProps) {
    const router = useRouter();

    const stats: StatCardData[] = [
        { title: 'Pasien Saya', value: patientStats?.total ?? 0, icon: <Users className="w-6 h-6" />, color: 'teal' },
        { title: 'Jadwal Hari Ini', value: todayAppointments?.count ?? 0, icon: <Calendar className="w-6 h-6" />, color: 'blue' },
        { title: 'Rekam Medis', value: 12, icon: <ClipboardList className="w-6 h-6" />, color: 'purple' },
        { title: 'Treatment Aktif', value: 5, icon: <Activity className="w-6 h-6" />, color: 'green' },
    ];

    const appointments: AppointmentListItem[] = todayAppointments?.data?.map((apt: any) => ({
        id: apt.id,
        time: apt.jam_janji,
        patientName: apt.patient?.nama_lengkap || 'Pasien',
        complaint: apt.keluhan,
        status: apt.status
    })) || [];

    // Mock data
    const recentPatients = [
        { id: 1, nama: 'Ahmad Fauzi', lastVisit: '2024-01-15', diagnosis: 'Pembersihan Karang Gigi', status: 'completed' },
        { id: 2, nama: 'Siti Nurhaliza', lastVisit: '2024-01-14', diagnosis: 'Perawatan Saluran Akar', status: 'ongoing' },
    ];

    const patientColumns = [
        { key: 'nama', header: 'Nama Pasien' },
        { key: 'diagnosis', header: 'Diagnosis' },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {row.status === 'completed' ? 'Selesai' : 'Perawatan'}
                </span>
            )
        },
    ];

    return (
        <div className="flex flex-col gap-6 w-full min-h-screen pb-24 animate-in fade-in duration-500">

            {/* 2. Stats Grid */}
            <div className="w-full">
                <StatsGrid stats={stats} loading={loading.patients || loading.appointments} />
            </div>

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full h-full">
                {/* Kolom Kiri: Appointment List (Lebih Lebar) */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <AppointmentList
                        appointments={appointments}
                        loading={loading.appointments}
                        title="Antrian Pasien Hari Ini"
                        emptyMessage="Tidak ada jadwal praktik hari ini"
                    />
                </div>

                {/* Kolom Kanan: Riwayat Pasien */}
                <div className="lg:col-span-1 flex flex-col h-full">
                    <Card className="h-full flex flex-col">
                        <Card.Header divider className="py-4 px-5">
                            <div className="flex items-center justify-between w-full">
                                <Card.Title className="text-base">Pasien Terakhir</Card.Title>
                                <button
                                    onClick={() => router.push(ROUTES.PATIENTS)}
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                >
                                    Lihat Semua
                                </button>
                            </div>
                        </Card.Header>
                        <Card.Body padding="none" className="flex-1 overflow-hidden">
                            <div className="w-full overflow-x-auto">
                                <DataTable
                                    data={recentPatients}
                                    columns={patientColumns}
                                    striped
                                    hoverable
                                    compact
                                    onRowClick={(row) => router.push(`${ROUTES.PATIENTS}/${row.id}`)}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
}