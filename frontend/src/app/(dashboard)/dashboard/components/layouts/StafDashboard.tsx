// frontend/src/app/(dashboard)/dashboard/components/layouts/StafDashboard.tsx
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, UserPlus, Clock, CheckCircle2, TrendingUp, CalendarIcon, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { ROUTES } from '@/core/constants';
import { Card, Button, Badge, Skeleton, EmptyState, StatsCard, Tabs, TabPanel, Avatar, DataTable } from '@/components/ui';
import type { StatCardData, DashboardLayoutProps } from '../../types/dashboard.types';
import { usePatientsControllerFindAll } from '@/core/api/generated/patients/patients';
import { PatientsControllerFindAllSortBy, PatientsControllerFindAllSortOrder } from '@/core/api/model';

export function StafDashboard({
    user,
    patientStats,
    todayAppointments,
    loading
}: DashboardLayoutProps) {
    const router = useRouter();

    const {
        data: recentPatientsData,
        isLoading: loadingRecentPatients
    } = usePatientsControllerFindAll({
        page: 1,
        limit: 10,
        sortBy: PatientsControllerFindAllSortBy.created_at,
        sortOrder: PatientsControllerFindAllSortOrder.desc
    });

    const recentPatients = useMemo(() => (recentPatientsData as any)?.data || [], [recentPatientsData]);

    const stats: StatCardData[] = useMemo(() => [
        { title: 'Total Pasien', value: patientStats?.total ?? 0, icon: <Users className="w-6 h-6" />, color: 'blue' },
        { title: 'Antrian Hari Ini', value: todayAppointments?.count ?? 0, icon: <Calendar className="w-6 h-6" />, color: 'purple' },
        { title: 'Pasien Baru', value: patientStats?.new_this_month ?? 0, icon: <UserPlus className="w-6 h-6" />, color: 'green' },
        { title: 'Selesai', value: 8, icon: <CheckCircle2 className="w-6 h-6" />, color: 'teal' },
    ], [patientStats, todayAppointments]);

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
            render: (row: any) => {
                try {
                    return (
                        <span className="text-gray-600 flex items-center gap-2 text-sm">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                            {format(new Date(row.created_at), 'dd MMM yyyy', { locale: id })}
                        </span>
                    );
                } catch {
                    return '-';
                }
            }
        },
        {
            key: 'jenis_kelamin',
            header: 'Gender',
            render: (row: any) => (
                <Badge variant="outline" size="sm">
                    {row.jenis_kelamin === 'L' ? 'Laki-laki' : row.jenis_kelamin === 'P' ? 'Perempuan' : 'Tidak Diketahui'}
                </Badge>
            )
        },
    ], []);

    if (loading?.patients || loading?.appointments) {
        return (
            <div className="flex flex-col gap-6 w-full pb-24 animate-pulse">
                <Skeleton className="h-32 w-full rounded-xl bg-gray-100" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl bg-gray-100" />)}
                </div>
                <Skeleton className="h-96 w-full rounded-2xl bg-gray-100" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full min-h-screen pb-24 animate-in fade-in duration-500">
            {/* Header */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        description=""
                        className="hover:shadow-md transition-shadow duration-300 bg-white"
                    />
                ))}
            </div>

            {/* Main Content */}
            <Card className="overflow-hidden border-gray-100 shadow-lg shadow-gray-100/50 bg-white">
                <Tabs
                    variant="line"
                    className="w-full"
                    defaultTab="patients"
                    tabs={[
                        {
                            id: 'patients',
                            label: 'Pasien Terbaru',
                            icon: <TrendingUp className="w-4 h-4" />,
                            badge: recentPatients.length > 0 ? recentPatients.length : undefined
                        }
                    ]}
                >
                    <TabPanel tabId="patients">
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
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                </Tabs>
            </Card>

            {/* Quick Actions */}
            <Card>
                <Card.Header divider>
                    <Card.Title>Aksi Cepat</Card.Title>
                    <Card.Description>Menu yang sering digunakan</Card.Description>
                </Card.Header>
                <Card.Body padding="md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Daftar Pasien', icon: <UserPlus className="w-6 h-6 text-purple-600" />, route: ROUTES.PATIENT_CREATE, bg: 'bg-purple-50', hover: 'hover:border-purple-500' },
                            { label: 'Jadwal', icon: <Calendar className="w-6 h-6 text-blue-600" />, route: ROUTES.APPOINTMENTS, bg: 'bg-blue-50', hover: 'hover:border-blue-500' },
                            { label: 'Data Pasien', icon: <Users className="w-6 h-6 text-green-600" />, route: ROUTES.PATIENTS, bg: 'bg-green-50', hover: 'hover:border-green-500' },
                            { label: 'Rekam Medis', icon: <Stethoscope className="w-6 h-6 text-orange-600" />, route: ROUTES.MEDICAL_RECORDS, bg: 'bg-orange-50', hover: 'hover:border-orange-500' }
                        ].map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => router.push(action.route)}
                                className={`group p-5 bg-white border-2 border-gray-200 rounded-xl ${action.hover} hover:shadow-lg transition-all`}
                            >
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={`p-3 ${action.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {action.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}