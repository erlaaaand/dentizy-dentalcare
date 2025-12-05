// frontend/src/app/(dashboard)/dashboard/components/layouts/KepalaKlinikDashboard.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, BarChart3, Settings,
    TrendingUp, Activity, Stethoscope, ArrowRight,
    UserPlus, FileText
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
    const [activeTab, setActiveTab] = useState('overview');

    // [FIX] State untuk Pagination (Sesuai contekan)
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10
    });

    // --- FETCH DATA ---
    const { data: patientStats, isLoading: l1 } = usePatientsControllerGetStatistics();
    const { data: userStats, isLoading: l2 } = useUsersControllerGetStatistics();
    
    // [FIX] Gunakan queryParams untuk fetch data pasien
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

    // [FIX] Extract patientList dan Meta untuk Pagination
    const patientList = useMemo(() => (recentPatientsData as any)?.data || [], [recentPatientsData]);
    const patientMeta = useMemo(() => (recentPatientsData as any)?.meta || {}, [recentPatientsData]);

    const quickActions = [
        { label: 'Manajemen User', icon: <Users className="w-5 h-5 text-blue-600" />, route: ROUTES.USERS, bgColor: 'bg-blue-50', hoverColor: 'blue-500' },
        { label: 'Laporan Klinik', icon: <BarChart3 className="w-5 h-5 text-emerald-600" />, route: ROUTES.REPORTS, bgColor: 'bg-emerald-50', hoverColor: 'emerald-500' },
        { label: 'Keuangan', icon: <FileText className="w-5 h-5 text-amber-600" />, route: ROUTES.REPORTS, bgColor: 'bg-amber-50', hoverColor: 'amber-500' },
        { label: 'Pengaturan', icon: <Settings className="w-5 h-5 text-gray-600" />, route: ROUTES.SETTINGS, bgColor: 'bg-gray-50', hoverColor: 'gray-500' },
    ];

    // --- COLUMN DEFINITIONS ---
    const recentPatientColumns = [
        { 
            header: 'Nama Pasien', 
            render: (r: any) => (
                <div className="flex items-center gap-3">
                    <Avatar name={r.nama_lengkap} size="sm" />
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{r.nama_lengkap}</span>
                        <span className="text-xs text-gray-500">{r.nomor_rekam_medis || '-'}</span>
                    </div>
                </div>
            )
        },
        { 
            header: 'NIK', 
            render: (r: any) => <span className="text-gray-600 font-mono text-sm">{r.nik || '-'}</span> 
        },
        { 
            header: 'Tanggal Daftar', 
            render: (r: any) => <span className="text-gray-500 text-sm">{r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span> 
        },
        { 
            header: 'L/P', 
            render: (r: any) => (
                <Badge variant="outline" size="sm" className={r.jenis_kelamin === 'L' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'}>
                    {r.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </Badge>
            )
        },
        {
            header: 'No. HP',
            render: (r: any) => <span className="text-gray-600 text-sm">{r.no_hp || '-'}</span>
        }
    ];

    if (isLoadingStats) return <DashboardSkeleton />;

    return (
        <div className="w-full pb-24 animate-in fade-in duration-500">
            <DashboardHeader 
                title="Dashboard Kepala Klinik" 
                subtitle="Ringkasan operasional dan statistik klinik hari ini"
            />

            <div className="flex flex-col gap-8">
                {/* 1. Statistik Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard 
                        title="Total Pasien" 
                        value={stats.totalPatients} 
                        icon={<Users className="w-5 h-5" />} 
                        // color="blue"
                        description="Database pasien"
                    />
                    <StatsCard 
                        title="Kunjungan Hari Ini" 
                        value={stats.todayApts} 
                        icon={<Activity className="w-5 h-5" />} 
                        // color="violet"
                        description="Janji temu aktif"
                    />
                    <StatsCard 
                        title="Pasien Baru (Bulan Ini)" 
                        value={stats.newPatients} 
                        icon={<TrendingUp className="w-5 h-5" />} 
                        // color="emerald"
                        description="Pertumbuhan"
                    />
                    <StatsCard 
                        title="Dokter Tersedia" 
                        value={stats.activeDoctors} 
                        icon={<Stethoscope className="w-5 h-5" />} 
                        // color="amber"
                        description="Siap melayani"
                    />
                </div>

                {/* 2. Quick Actions */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Akses Cepat</h3>
                    <QuickActionGrid actions={quickActions} />
                </div>

                {/* 3. Tabel Utama (FULL WIDTH & FIXED) */}
                <Card className="border-gray-200 shadow-lg shadow-gray-100/50 overflow-hidden">
                    <Tabs variant="line" className="w-full" defaultTab="overview"
                        tabs={[
                            { id: 'overview', label: 'Data Pasien Terbaru', icon: <UserPlus className="w-4 h-4" /> },
                            { id: 'staff', label: 'Jadwal Dokter Aktif', icon: <Stethoscope className="w-4 h-4" /> }
                        ]}
                        onChange={setActiveTab}
                    >
                        <TabPanel tabId="overview">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 gap-4 bg-gray-50/30">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Registrasi Terakhir</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Data real-time dari database pasien klinik.
                                    </p>
                                </div>
                                <Button onClick={() => router.push(ROUTES.PATIENTS)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">
                                    Lihat Database Lengkap <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            </div>
                            
                            <div className="w-full">
                                {/* [FIX] DataTable Implementation sesuai patokan */}
                                <DataTable
                                    data={patientList}
                                    columns={recentPatientColumns}
                                    isLoading={loadingRecentPatients}
                                    emptyMessage="Tidak ada data pasien ditemukan."
                                    className="border-none w-full"
                                    pagination={{
                                        currentPage: queryParams.page,
                                        totalPages: patientMeta?.lastPage || patientMeta?.pageCount || 1,
                                        totalItems: patientMeta?.total || 0,
                                        itemsPerPage: queryParams.limit,
                                        // onPageChange: (p: number) => setQueryParams(prev => ({ ...prev, page: p }))
                                    }}
                                />
                            </div>
                        </TabPanel>

                        <TabPanel tabId="staff">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Tim Dokter yang Bertugas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {(doctorsData as any)?.data?.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md bg-white transition-all duration-300">
                                            <Avatar name={doc.nama_lengkap} src={doc.profile_photo} size="lg" className="ring-2 ring-gray-50" />
                                            <div>
                                                <p className="font-bold text-gray-900">{doc.nama_lengkap}</p>
                                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mt-0.5">Dokter Gigi</p>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-xs text-gray-500">Online</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(doctorsData as any)?.data?.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-500">
                                            Tidak ada dokter yang aktif saat ini.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabPanel>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}