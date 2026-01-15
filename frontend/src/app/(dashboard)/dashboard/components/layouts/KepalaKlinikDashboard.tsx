// frontend/src/app/(dashboard)/dashboard/components/layouts/KepalaKlinikDashboard.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, BarChart3, Settings,
    TrendingUp, Activity, Stethoscope, ArrowRight,
    UserPlus, FileText, Calendar, Clock
} from 'lucide-react';

import { ROUTES } from '@/core/constants';
import {
    DataTable, Card,
    Tabs, TabPanel, Avatar, Badge, Button, StatsCard
} from '@/components/ui';
import { DashboardHeader } from '../shared/DashboardHeader';
import { QuickActionGrid } from '../shared/QuickActionGrid';
import { DashboardSkeleton } from '../skeleton/DashboardSkeleton';

// Import Hooks
import {
    usePatientsControllerGetStatistics,
    usePatientsControllerFindAll
} from '@/core/api/generated/patients/patients';
import {
    useUsersControllerGetStatistics,
    useUsersControllerFindAll
} from '@/core/api/generated/users/users';
import {
    useAppointmentsControllerFindAll
} from '@/core/api/generated/appointments/appointments';
import {
    PatientsControllerFindAllSortBy,
    PatientsControllerFindAllSortOrder,
    UsersControllerFindAllRole
} from '@/core/api/model';

export function KepalaKlinikDashboard() {
    const router = useRouter();

    // State untuk Pagination
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10
    });

    // --- FETCH DATA ---
    const { data: patientStats, isLoading: l1 } = usePatientsControllerGetStatistics();
    const { data: userStats, isLoading: l2 } = useUsersControllerGetStatistics();

    const {
        data: recentPatientsData,
        isLoading: loadingRecentPatients
    } = usePatientsControllerFindAll({
        page: queryParams.page,
        limit: queryParams.limit,
        sortBy: PatientsControllerFindAllSortBy.created_at,
        sortOrder: PatientsControllerFindAllSortOrder.desc
    });

    const { data: todayAppointmentsData, isLoading: l4 } = useAppointmentsControllerFindAll({
        date: new Date().toISOString().split('T')[0],
        limit: 50
    });

    const { data: doctorsData, isLoading: l5 } = useUsersControllerFindAll({
        role: UsersControllerFindAllRole.dokter,
        limit: 20,
        isActive: true
    });

    const isLoadingStats = l1 || l2 || l4 || l5;

    // --- DATA PROCESSING ---
    const stats = useMemo(() => ({
        totalPatients: (patientStats as any)?.total ?? 0,
        newPatients: (patientStats as any)?.new_this_month ?? 0,
        totalUsers: (userStats as any)?.total ?? 0,
        activeDoctors: (doctorsData as any)?.data?.length ?? 0,
        todayApts: (todayAppointmentsData as any)?.data?.length ?? 0
    }), [patientStats, userStats, doctorsData, todayAppointmentsData]);

    const patientList = useMemo(() => (recentPatientsData as any)?.data || [], [recentPatientsData]);
    const patientMeta = useMemo(() => (recentPatientsData as any)?.meta || {}, [recentPatientsData]);

    const quickActions = [
        { 
            label: 'Manajemen User', 
            icon: <Users className="w-5 h-5 text-blue-600" />, 
            route: ROUTES.USERS, 
            bgColor: 'bg-blue-50', 
            hoverColor: 'blue-500',
            description: 'Kelola pengguna sistem'
        },
        { 
            label: 'Laporan Klinik', 
            icon: <BarChart3 className="w-5 h-5 text-emerald-600" />, 
            route: ROUTES.REPORTS, 
            bgColor: 'bg-emerald-50', 
            hoverColor: 'emerald-500',
            description: 'Lihat statistik & laporan'
        },
        { 
            label: 'Keuangan', 
            icon: <FileText className="w-5 h-5 text-amber-600" />, 
            route: ROUTES.REPORTS, 
            bgColor: 'bg-amber-50', 
            hoverColor: 'amber-500',
            description: 'Monitor pendapatan'
        },
        { 
            label: 'Jadwal Dokter', 
            icon: <Calendar className="w-5 h-5 text-purple-600" />, 
            route: ROUTES.APPOINTMENTS, 
            bgColor: 'bg-purple-50', 
            hoverColor: 'purple-500',
            description: 'Atur jadwal praktik'
        },
    ];

    if (isLoadingStats) return <DashboardSkeleton />;

    return (
        <div className="w-full pb-24 animate-in fade-in duration-500">
            <DashboardHeader
                title="Dashboard Kepala Klinik"
                subtitle={`Ringkasan operasional klinik - ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            />

            <div className="flex flex-col gap-6">
                {/* 1. Statistik Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Pasien"
                        value={stats.totalPatients}
                        icon={<Users className="w-5 h-5" />}
                        description="Database pasien terdaftar"
                    />
                    <StatsCard
                        title="Kunjungan Hari Ini"
                        value={stats.todayApts}
                        icon={<Activity className="w-5 h-5" />}
                        description="Janji temu aktif"
                    />
                    <StatsCard
                        title="Pasien Baru"
                        value={stats.newPatients}
                        icon={<TrendingUp className="w-5 h-5" />}
                        description="Bulan ini"
                    />
                    <StatsCard
                        title="Dokter Aktif"
                        value={stats.activeDoctors}
                        icon={<Stethoscope className="w-5 h-5" />}
                        description="Siap melayani"
                    />
                </div>

                {/* 2. Quick Actions */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Akses Cepat</h3>
                    </div>
                    <QuickActionGrid actions={quickActions} />
                </div>

                {/* 3. Tim Dokter Aktif - Tanpa Tab Header */}
                <Card className="border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Tim Dokter Bertugas</h3>
                                    <p className="text-sm text-gray-600">Total {stats.activeDoctors} dokter aktif hari ini</p>
                                </div>
                            </div>
                            <Badge variant="success" className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Online
                            </Badge>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {l5 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                                            <div className="w-12 h-12 rounded-full bg-gray-200" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {(doctorsData as any)?.data?.map((doc: any) => (
                                    <div 
                                        key={doc.id} 
                                        className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg bg-white transition-all duration-300 cursor-pointer"
                                        onClick={() => router.push(`${ROUTES.USERS}/${doc.id}`)}
                                    >
                                        <Avatar 
                                            name={doc.nama_lengkap} 
                                            src={doc.profile_photo} 
                                            size="lg" 
                                            className="ring-2 ring-blue-50 group-hover:ring-blue-100 transition-all" 
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                {doc.nama_lengkap}
                                            </p>
                                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mt-0.5">
                                                Dokter Gigi
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-xs text-gray-500 font-medium">Sedang Bertugas</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                                
                                {(doctorsData as any)?.data?.length === 0 && (
                                    <div className="col-span-full py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                            <Stethoscope className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">Tidak ada dokter yang aktif saat ini</p>
                                        <p className="text-sm text-gray-400 mt-1">Dokter akan muncul saat mulai bertugas</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* 4. Aktivitas Terkini (Optional) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-600" />
                                <h3 className="font-bold text-gray-900">Janji Temu Hari Ini</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            {stats.todayApts > 0 ? (
                                <div className="space-y-3">
                                    {(todayAppointmentsData as any)?.data?.slice(0, 5).map((apt: any) => (
                                        <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={apt.patient?.nama_lengkap} size="sm" />
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{apt.patient?.nama_lengkap}</p>
                                                    <p className="text-xs text-gray-500">{apt.waktu_mulai || '-'}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" size="sm">{apt.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Belum ada janji temu hari ini</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-gray-900">Pasien Terbaru</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            {patientList.length > 0 ? (
                                <div className="space-y-3">
                                    {patientList.slice(0, 5).map((patient: any) => (
                                        <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={patient.nama_lengkap} size="sm" />
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{patient.nama_lengkap}</p>
                                                    <p className="text-xs text-gray-500">{patient.nomor_rekam_medis || '-'}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(patient.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Belum ada pasien baru</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}