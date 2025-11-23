// frontend/src/app/(dashboard)/dashboard/components/layouts/StafDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, UserPlus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import { Card, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
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
        {
            title: 'Total Pasien',
            value: patientStats?.total ?? 0,
            icon: <Users className="w-6 h-6" />,
            color: 'blue'
        },
        {
            title: 'Antrian Hari Ini',
            value: todayAppointments?.count ?? 0,
            icon: <Calendar className="w-6 h-6" />,
            color: 'purple'
        },
        {
            title: 'Pasien Baru',
            value: patientStats?.new_this_month ?? 0,
            icon: <UserPlus className="w-6 h-6" />,
            color: 'green'
        },
        {
            title: 'Selesai',
            value: 8,
            icon: <CheckCircle2 className="w-6 h-6" />,
            color: 'teal'
        },
    ];

    const appointments: AppointmentListItem[] = todayAppointments?.data?.map((apt: any) => ({
        id: apt.id,
        time: apt.jam_janji,
        patientName: apt.patient?.nama_lengkap || 'Pasien',
        complaint: apt.keluhan,
        status: apt.status
    })) || [];

    const quickStats = [
        { label: 'Menunggu', value: 3, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Sedang Dilayani', value: 1, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Selesai', value: 5, color: 'text-green-600', bg: 'bg-green-50' },
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
            {/* Header & Actions */}
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                <Card.Body padding="lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">
                                Selamat Bekerja, {user?.nama_lengkap || 'Staf'}!
                            </h2>
                            <p className="text-purple-100">
                                Kelola pendaftaran dan antrian hari ini dengan efisien
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(ROUTES.PATIENT_CREATE)}
                            className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition shadow-lg flex items-center gap-2 font-semibold whitespace-nowrap"
                        >
                            <UserPlus className="w-5 h-5" />
                            Pendaftaran Baru
                        </button>
                    </div>
                </Card.Body>
            </Card>

            {/* Stats */}
            <StatsGrid stats={stats} loading={false} />

            {/* Quick Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickStats.map((stat, index) => (
                    <Card key={index} className="border-l-4 border-l-gray-300">
                        <Card.Body padding="md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                    <Clock className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {/* Main Content: Appointment Queue */}
            <AppointmentList
                appointments={appointments}
                loading={loading.appointments}
                title="Manajemen Antrian & Jadwal"
                emptyMessage="Belum ada pasien terjadwal hari ini"
            />

            {/* Quick Actions */}
            <Card>
                <Card.Header divider>
                    <Card.Title>Aksi Cepat</Card.Title>
                    <Card.Description>Menu yang sering digunakan</Card.Description>
                </Card.Header>
                <Card.Body padding="md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => router.push(ROUTES.PATIENT_CREATE)}
                            className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-600">
                                    Daftar Pasien
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push(ROUTES.APPOINTMENTS)}
                            className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                                    Jadwal
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push(ROUTES.PATIENTS)}
                            className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600">
                                    Data Pasien
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push(ROUTES.MEDICAL_RECORDS)}
                            className="group p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-orange-50 rounded-xl group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600">
                                    Rekam Medis
                                </span>
                            </div>
                        </button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}