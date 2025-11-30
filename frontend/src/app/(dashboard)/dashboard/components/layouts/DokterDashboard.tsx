// frontend/src/app/(dashboard)/dashboard/components/layouts/DokterDashboard.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, ClipboardList, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { ROUTES } from '@/core/constants';
import { Card, DataTable, Badge, EmptyState, Skeleton, Button, StatsCard, Tabs, TabPanel } from '@/components/ui';
import type { StatCardData, AppointmentListItem, DashboardLayoutProps } from '../../types/dashboard.types';
import { StatsGrid } from '../stats/StatsGrid';
import { AppointmentList } from '../widgets/AppointmentList';
import { useDebounce } from '@/core/hooks/ui/useDebounce';
import { useGetPatients} from '@/core/services/api';

export function DokterDashboard({
    user,
    patientStats,
    todayAppointments,
    loading
}: DashboardLayoutProps) {
    const router = useRouter();

    const stats: StatCardData[] = useMemo(() => [
        { title: 'Pasien Saya', value: patientStats?.total ?? 0, icon: <Users className="w-6 h-6" />, color: 'teal' },
        { title: 'Jadwal Hari Ini', value: todayAppointments?.count ?? 0, icon: <Calendar className="w-6 h-6" />, color: 'blue' },
        { title: 'Selesai Hari Ini', value: 3, icon: <CheckCircle2 className="w-6 h-6" />, color: 'green' },
        { title: 'Sedang Berjalan', value: 1, icon: <Clock className="w-6 h-6" />, color: 'orange' },
    ], [patientStats, todayAppointments]);

    const appointments: AppointmentListItem[] = useMemo(() =>
        todayAppointments?.data?.map((apt: any) => ({
            id: apt.id,
            time: apt.jam_janji,
            patientName: apt.patient?.nama_lengkap || 'Pasien',
            complaint: apt.keluhan,
            status: apt.status
        })) || []
        , [todayAppointments]);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [genderFilter, setGenderFilter] = useState<string>('');

    const { data: patientsResponse, isLoading, refetch } = useGetPatients({
        page,
        limit,
        search: debouncedSearch || undefined,
        jenis_kelamin: (genderFilter as any) || undefined,
    });

    const patientsList = Array.isArray(patientsResponse)
        ? patientsResponse
        : (patientsResponse as any)?.data || [];

    const meta = (patientsResponse as any)?.meta || (patientsResponse as any)?.pagination || {
        total: patientsList.length,
        totalPages: 1,
        page: 1,
        limit: 10
    };

    const paginationProps = {
        currentPage: page,
        totalPages: meta.totalPages || 1,
        totalItems: meta.total || 0,
        itemsPerPage: limit,
    };

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
            key: 'keluhan',
            header: 'Keluhan',
            render: (row: any) => (
                <span className="text-sm text-gray-600">{row.keluhan || '-'}</span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
                <Badge
                    variant={row.status === 'completed' ? 'success' : row.status === 'confirmed' ? 'info' : 'warning'}
                    size="sm"
                >
                    {row.status === 'completed' ? 'Selesai' : row.status === 'confirmed' ? 'Terkonfirmasi' : 'Menunggu'}
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
                    defaultTab="appointments"
                    tabs={[
                        {
                            id: 'appointments',
                            label: 'Jadwal Hari Ini',
                            icon: <Clock className="w-4 h-4" />,
                            badge: appointments.length > 0 ? appointments.length : undefined
                        }
                    ]}
                >
                    <TabPanel tabId="appointments">
                        <div className="p-6 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Antrian Pasien Hari Ini</h3>
                                <p className="text-sm text-gray-500">
                                    Daftar janji temu untuk tanggal {format(new Date(), 'dd MMMM yyyy', { locale: id })}.
                                    {appointments.length > 0 && ` (${appointments.length} pasien)`}
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

                        {loading?.appointments ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="p-12">
                                <EmptyState
                                    icon={<Clock className="w-12 h-12 text-gray-300" />}
                                    title="Tidak Ada Jadwal"
                                    description="Tidak ada jadwal praktik hari ini"
                                    variant="minimal"
                                />
                            </div>
                        ) : (
                            <DataTable
                                data={todayAppointments?.data || []}
                                columns={appointmentColumns || []}
                                pagination={{
                                    currentPage: paginationProps.currentPage,
                                    totalPages: paginationProps.totalPages,
                                    totalItems: paginationProps.totalItems,
                                    itemsPerPage: limit,
                                }}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                                isLoading={isLoading}
                            />
                        )}
                    </TabPanel>
                </Tabs>
            </Card>

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