// frontend/src/app/(dashboard)/dashboard/components/layouts/DokterDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, ClipboardList, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import { Card, DataTable, Badge, EmptyState, Skeleton } from '@/components/ui';
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
        { title: 'Selesai Hari Ini', value: 3, icon: <CheckCircle2 className="w-6 h-6" />, color: 'green' },
        { title: 'Sedang Berjalan', value: 1, icon: <Clock className="w-6 h-6" />, color: 'orange' },
    ];

    const appointments: AppointmentListItem[] = todayAppointments?.data?.map((apt: any) => ({
        id: apt.id,
        time: apt.jam_janji,
        patientName: apt.patient?.nama_lengkap || 'Pasien',
        complaint: apt.keluhan,
        status: apt.status
    })) || [];

    const recentPatients = [
        { id: 1, nama: 'Ahmad Fauzi', lastVisit: '2024-01-15', diagnosis: 'Pembersihan Karang Gigi', status: 'completed' },
        { id: 2, nama: 'Siti Nurhaliza', lastVisit: '2024-01-14', diagnosis: 'Perawatan Saluran Akar', status: 'ongoing' },
    ];

    const patientColumns = [
        { key: 'nama', header: 'Nama Pasien' },
        { key: 'diagnosis', header: 'Diagnosis Terakhir' },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
                <Badge
                    variant={row.status === 'completed' ? 'success' : 'info'}
                    size="sm"
                >
                    {row.status === 'completed' ? 'Selesai' : 'Perawatan'}
                </Badge>
            )
        },
    ];

    if (loading.patients || loading.appointments) {
        return (
            <div className="flex flex-col gap-6 w-full pb-24">
                <Skeleton className="h-32 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full min-h-screen pb-24 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0">
                <Card.Body padding="lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                Selamat Bekerja, Dr. {user?.nama_lengkap || 'Dokter'}!
                            </h2>
                            <p className="text-teal-100">
                                Anda memiliki {todayAppointments?.count ?? 0} pasien hari ini
                            </p>
                        </div>
                        <Activity className="w-16 h-16 opacity-50" />
                    </div>
                </Card.Body>
            </Card>

            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={false} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Appointment List - Larger */}
                <div className="lg:col-span-2">
                    <AppointmentList
                        appointments={appointments}
                        loading={loading.appointments}
                        title="Antrian Pasien Hari Ini"
                        emptyMessage="Tidak ada jadwal praktik hari ini"
                    />
                </div>

                {/* Patient History - Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="h-full flex flex-col">
                        <Card.Header divider className="py-4 px-5">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <Card.Title className="text-base">Pasien Terakhir</Card.Title>
                                    <Card.Description>Riwayat perawatan</Card.Description>
                                </div>
                                <button
                                    onClick={() => router.push(ROUTES.PATIENTS)}
                                    className="text-xs font-medium text-teal-600 hover:underline"
                                >
                                    Lihat Semua
                                </button>
                            </div>
                        </Card.Header>
                        <Card.Body padding="none" className="flex-1">
                            {recentPatients.length === 0 ? (
                                <div className="p-6">
                                    <EmptyState
                                        icon={<ClipboardList className="w-10 h-10" />}
                                        title="Belum Ada Riwayat"
                                        description="Riwayat pasien akan muncul di sini"
                                        size="sm"
                                    />
                                </div>
                            ) : (
                                <DataTable
                                    data={recentPatients}
                                    columns={patientColumns}
                                    striped
                                    hoverable
                                    compact
                                    onRowClick={(row) => router.push(`${ROUTES.PATIENTS}/${row.id}`)}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => router.push(ROUTES.MEDICAL_RECORDS)}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-lg transition-all text-left group"
                >
                    <ClipboardList className="w-6 h-6 text-teal-600 mb-2" />
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600">Rekam Medis</h3>
                    <p className="text-sm text-gray-500">Akses rekam medis pasien</p>
                </button>

                <button
                    onClick={() => router.push(ROUTES.APPOINTMENTS)}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                >
                    <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Jadwal Lengkap</h3>
                    <p className="text-sm text-gray-500">Lihat semua jadwal praktik</p>
                </button>

                <button
                    onClick={() => router.push(ROUTES.PATIENTS)}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all text-left group"
                >
                    <Users className="w-6 h-6 text-purple-600 mb-2" />
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Daftar Pasien</h3>
                    <p className="text-sm text-gray-500">Kelola data pasien Anda</p>
                </button>
            </div>
        </div>
    );
}