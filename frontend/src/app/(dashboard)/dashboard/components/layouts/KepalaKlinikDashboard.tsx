'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, UserPlus, BarChart3, Settings,
    TrendingUp, Clock, Stethoscope, CheckCircle2,
    Calendar as CalendarIcon, Bell, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { ROUTES } from '@/core/constants';
import {
    DataTable,
    Card,
    EmptyState,
    Badge,
    Skeleton,
    Tabs,
    TabPanel,
    Avatar,
    StatusBadge,
    AlertBanner,
    Button,
    StatsCard
} from '@/components/ui';
import { QuickActions } from '@/app/(dashboard)/dashboard/components/widgets/QuickActions';
import type { QuickAction } from '@/app/(dashboard)/dashboard/types/dashboard.types';

import {
    usePatientsControllerGetStatistics,
    usePatientsControllerFindAll
} from '@/core/api/generated/patients/patients';
import {
    useUsersControllerGetStatistics,
    useUsersControllerFindAll
} from '@/core/api/generated/users/users';
import {
    useNotificationsControllerGetStatistics
} from '@/core/api/generated/notifications/notifications';
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
    const [activeTab, setActiveTab] = useState('overview');
    const todayDate = format(new Date(), 'yyyy-MM-dd');

    // --- 1. Data Fetching ---
    const {
        data: patientStats,
        isLoading: loadingPatientStats,
        error: errorPatientStats
    } = usePatientsControllerGetStatistics();

    const {
        data: userStats,
        isLoading: loadingUserStats,
        error: errorUserStats
    } = useUsersControllerGetStatistics();

    const {
        data: notifStats,
        isLoading: loadingNotifStats,
        error: errorNotifStats
    } = useNotificationsControllerGetStatistics();

    const {
        data: recentPatientsData,
        isLoading: loadingRecentPatients,
        error: errorRecentPatients
    } = usePatientsControllerFindAll({
        page: 1,
        limit: 5,
        sortBy: PatientsControllerFindAllSortBy.created_at,
        sortOrder: PatientsControllerFindAllSortOrder.desc
    });

    const {
        data: todayAppointmentsData,
        isLoading: loadingAppointments,
        error: errorAppointments
    } = useAppointmentsControllerFindAll({
        date: todayDate,
        limit: 50
    });

    const {
        data: doctorsData,
        isLoading: loadingDoctors,
        error: errorDoctors
    } = useUsersControllerFindAll({
        role: UsersControllerFindAllRole.dokter,
        limit: 10,
        isActive: true
    });

    // --- 2. Data Processing dengan useMemo ---
    const { recentPatients, todayAppointments, activeDoctors, pStats, uStats, nStats } = useMemo(() => {
        // Extract arrays dengan safe access
        const patients = (recentPatientsData as any)?.data || [];
        const appointments = (todayAppointmentsData as any)?.data || [];
        const doctors = (doctorsData as any)?.data || [];

        // Stats dengan safe access
        const patientStatistics = {
            total: (patientStats as any)?.total ?? 0,
            new_this_month: (patientStats as any)?.new_this_month ?? 0,
            trend: (patientStats as any)?.trend ?? null
        };

        const userStatistics = {
            total: (userStats as any)?.total ?? 0,
            active: (userStats as any)?.active ?? 0
        };

        const notifStatistics = {
            pending: (notifStats as any)?.pending ?? 0
        };

        return {
            recentPatients: patients,
            todayAppointments: appointments,
            activeDoctors: doctors,
            pStats: patientStatistics,
            uStats: userStatistics,
            nStats: notifStatistics
        };
    }, [patientStats, userStats, notifStats, recentPatientsData, todayAppointmentsData, doctorsData]);

    // --- 3. Safe Date Formatter ---
    const formatSafeDate = (dateString: string | null | undefined, formatStr: string = 'dd MMM yyyy') => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), formatStr, { locale: id });
        } catch (error) {
            return '-';
        }
    };

    // --- 4. Loading & Error Check ---
    const isLoading = loadingPatientStats || loadingUserStats || loadingNotifStats ||
        loadingRecentPatients || loadingAppointments || loadingDoctors;

    const hasError = errorPatientStats || errorUserStats || errorNotifStats ||
        errorRecentPatients || errorAppointments || errorDoctors;

    // --- 5. Debug Effect ---
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Tab Changed to:', activeTab);
            console.log('📊 Dashboard Data Summary:', {
                patients: recentPatients.length,
                appointments: todayAppointments.length,
                doctors: activeDoctors.length,
                stats: { pStats, uStats, nStats }
            });

            // Log data sesuai tab aktif
            if (activeTab === 'overview' && recentPatients.length > 0) {
                console.log('📊 Recent Patients:', recentPatients);
            } else if (activeTab === 'appointments' && todayAppointments.length > 0) {
                console.log('📅 Today Appointments:', todayAppointments);
            } else if (activeTab === 'staff' && activeDoctors.length > 0) {
                console.log('👨‍⚕️ Active Doctors:', activeDoctors);
            }
        }
    }, [activeTab, recentPatients, todayAppointments, activeDoctors, pStats, uStats, nStats]);

    // --- 6. Column Definitions ---
    const recentPatientColumns = useMemo(() => [
        {
            key: 'nama_lengkap',
            header: 'Pasien',
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        name={row.nama_lengkap || 'Unknown'}
                        size="sm"
                        className="ring-2 ring-white shadow-sm"
                    />
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                            {row.nama_lengkap || 'Nama Tidak Tersedia'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {row.nomor_rekam_medis || '-'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'Terdaftar Pada',
            render: (row: any) => (
                <span className="text-gray-600 flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    {formatSafeDate(row.created_at)}
                </span>
            )
        },
        {
            key: 'jenis_kelamin',
            header: 'Gender',
            render: (row: any) => (
                <Badge variant="outline" size="sm">
                    {row.jenis_kelamin === 'L' ? 'Laki-laki' :
                        row.jenis_kelamin === 'P' ? 'Perempuan' :
                            'Tidak Diketahui'}
                </Badge>
            )
        },
    ], []);

    const appointmentColumns = useMemo(() => [
        {
            key: 'jam_janji',
            header: 'Waktu',
            width: '100px',
            render: (row: any) => (
                <div className="font-mono text-sm bg-gray-50 px-2 py-1 rounded text-gray-700 border border-gray-100 text-center">
                    {row.jam_janji ? row.jam_janji.slice(0, 5) : '-'}
                </div>
            )
        },
        {
            key: 'patient',
            header: 'Pasien',
            render: (row: any) => (
                <span className="font-medium text-gray-900">
                    {row.patient?.nama_lengkap || 'Pasien Tidak Diketahui'}
                </span>
            )
        },
        {
            key: 'doctor',
            header: 'Dokter',
            render: (row: any) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                    {row.doctor?.nama_lengkap || 'Dokter Tidak Ditentukan'}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => <StatusBadge status={row.status || 'unknown'} showDot />
        },
    ], []);

    const quickActions: QuickAction[] = useMemo(() => [
        { id: '1', label: 'Tambah User', icon: <UserPlus className="w-5 h-5 text-blue-600" />, href: ROUTES.USER_CREATE },
        { id: '2', label: 'Laporan', icon: <BarChart3 className="w-5 h-5 text-emerald-600" />, href: ROUTES.REPORTS },
        { id: '3', label: 'Manajemen SDM', icon: <Users className="w-5 h-5 text-violet-600" />, href: ROUTES.USERS },
        { id: '4', label: 'Pengaturan', icon: <Settings className="w-5 h-5 text-gray-600" />, href: ROUTES.SETTINGS },
    ], []);

    // --- 7. Error State ---
    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
                    <p className="text-gray-600 mb-4">Gagal memuat data dashboard</p>
                    <Button onClick={() => window.location.reload()}>
                        Muat Ulang
                    </Button>
                </div>
            </div>
        );
    }

    // --- 8. Loading State ---
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 w-full pb-24 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl bg-gray-100" />
                    ))}
                </div>
                <Skeleton className="h-24 w-full rounded-xl bg-gray-100" />
                <Skeleton className="h-96 w-full rounded-2xl bg-gray-100" />
            </div>
        );
    }

    // --- 9. Main Render ---
    return (
        <div className="flex flex-col gap-8 w-full min-h-screen pb-24 animate-in fade-in duration-500 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/20 rounded-3xl p-1">

            {/* Notification Banner */}
            {nStats.pending > 0 && (
                <AlertBanner
                    type="info"
                    title="Pemberitahuan Sistem"
                    message={`Terdapat ${nStats.pending} notifikasi yang belum dibaca atau memerlukan tindakan Anda.`}
                    action={
                        <Button
                            size="xs"
                            variant="ghost"
                            className="text-blue-700 hover:bg-blue-100"
                            onClick={() => router.push('/dashboard/notifications')}
                        >
                            Lihat Detail <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    }
                    icon={Bell}
                    className="border-blue-100 bg-blue-50/50 shadow-sm backdrop-blur-sm"
                />
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Pasien"
                    value={pStats.total}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    trend={pStats.trend ? { value: pStats.trend, isPositive: pStats.trend > 0 } : undefined}
                    description="Total pasien terdaftar"
                    className="hover:shadow-md transition-shadow duration-300 border-blue-100/50 bg-white"
                />
                <StatsCard
                    title="Pasien Baru (Bulan Ini)"
                    value={pStats.new_this_month}
                    icon={<UserPlus className="w-5 h-5 text-emerald-600" />}
                    description="Registrasi bulan ini"
                    className="hover:shadow-md transition-shadow duration-300 border-emerald-100/50 bg-white"
                />
                <StatsCard
                    title="Jadwal Hari Ini"
                    value={todayAppointments.length}
                    icon={<CalendarIcon className="w-5 h-5 text-violet-600" />}
                    description={formatSafeDate(new Date().toISOString(), 'dd MMMM yyyy')}
                    className="hover:shadow-md transition-shadow duration-300 border-violet-100/50 bg-white"
                />
                <StatsCard
                    title="Total Pengguna"
                    value={uStats.total}
                    icon={<CheckCircle2 className="w-5 h-5 text-amber-600" />}
                    description={`${uStats.active} Akun Aktif`}
                    className="hover:shadow-md transition-shadow duration-300 border-amber-100/50 bg-white"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
                <QuickActions actions={quickActions} />
            </div>

            {/* Main Content Tabs */}
            <Card className="overflow-hidden border-gray-100 shadow-lg shadow-gray-100/50 bg-white">
                <Tabs
                    variant="line"
                    className="w-full"
                    defaultTab="overview"
                    tabs={[
                        {
                            id: 'overview',
                            label: 'Pasien Terbaru',
                            icon: <TrendingUp className="w-4 h-4" />,
                            badge: recentPatients.length > 0 ? recentPatients.length : undefined
                        },
                        {
                            id: 'appointments',
                            label: 'Jadwal Hari Ini',
                            icon: <Clock className="w-4 h-4" />,
                            badge: todayAppointments.length > 0 ? todayAppointments.length : undefined
                        },
                        {
                            id: 'staff',
                            label: 'Daftar Dokter',
                            icon: <Stethoscope className="w-4 h-4" />,
                            badge: activeDoctors.length > 0 ? activeDoctors.length : undefined
                        }
                    ]}
                    onChange={setActiveTab}
                >
                    {/* Tab 1: Pasien Terbaru */}
                    <TabPanel tabId="overview">
                        <div className="p-6 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Registrasi Terbaru</h3>
                                <p className="text-sm text-gray-500">
                                    Daftar pasien yang baru saja didaftarkan ke sistem.
                                    {recentPatients.length > 0 && ` (${recentPatients.length} pasien)`}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(ROUTES.PATIENTS)}
                                className="bg-white hover:bg-gray-50"
                            >
                                Lihat Semua Pasien
                            </Button>
                        </div>

                        {loadingRecentPatients ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : recentPatients.length === 0 ? (
                            <div className="p-12">
                                <EmptyState
                                    icon={<Users className="w-12 h-12 text-gray-300" />}
                                    title="Belum Ada Pasien"
                                    description="Belum ada data pasien yang terdaftar."
                                    variant="minimal"
                                />
                            </div>
                        ) : (
                            <DataTable
                                data={recentPatients}
                                columns={recentPatientColumns}
                                hoverable
                                compact={false}
                                className="border-none"
                            />
                        )}
                    </TabPanel>

                    {/* Tab 2: Jadwal Hari Ini */}
                    <TabPanel tabId="appointments">
                        <div className="p-6 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Operasional Hari Ini</h3>
                                <p className="text-sm text-gray-500">
                                    Daftar janji temu untuk tanggal {formatSafeDate(new Date().toISOString(), 'dd MMMM yyyy')}.
                                    {todayAppointments.length > 0 && ` (${todayAppointments.length} janji temu)`}
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.push(ROUTES.APPOINTMENTS)}
                            >
                                Kelola Jadwal
                            </Button>
                        </div>

                        {loadingAppointments ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="p-12">
                                <EmptyState
                                    icon={<Clock className="w-12 h-12 text-gray-300" />}
                                    title="Tidak Ada Jadwal"
                                    description="Tidak ada janji temu untuk hari ini."
                                    variant="minimal"
                                />
                            </div>
                        ) : (
                            <DataTable
                                data={todayAppointments}
                                columns={appointmentColumns}
                                hoverable
                                striped
                                className="border-none"
                            />
                        )}
                    </TabPanel>

                    {/* Tab 3: Daftar Dokter */}
                    <TabPanel tabId="staff">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Tim Dokter</h3>
                                    <p className="text-sm text-gray-500">
                                        Daftar dokter aktif yang tersedia di klinik.
                                        {activeDoctors.length > 0 && ` (${activeDoctors.length} dokter)`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {loadingDoctors ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeDoctors.length > 0 ? activeDoctors.map((doc: any) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                                    >
                                        <Avatar
                                            name={doc.nama_lengkap || 'Unknown'}
                                            src={doc.profile_photo}
                                            size="lg"
                                            className="mr-4 ring-2 ring-gray-50 group-hover:ring-blue-50 transition-all"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                {doc.nama_lengkap || 'Nama Tidak Tersedia'}
                                            </h4>
                                            <p className="text-xs text-gray-500 mb-2">
                                                @{doc.username || 'unknown'}
                                            </p>
                                            <Badge variant="success" size="xs" className="px-2">
                                                Aktif
                                            </Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12">
                                        <EmptyState
                                            icon={<Stethoscope className="w-12 h-12 text-gray-300" />}
                                            title="Tidak Ada Dokter"
                                            description="Tidak ada data dokter aktif ditemukan."
                                            variant="minimal"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </TabPanel>
                </Tabs>
            </Card>
        </div>
    );
}