// frontend/src/app/(dashboard)/dashboard/components/layouts/KepalaKlinikDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Users, UserPlus, FileText, Bell, BarChart3, Settings } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import { DataTable, Card } from '@/components/ui';
import type { StatCardData, QuickAction } from '@/app/(dashboard)/dashboard/types/dashboard.types';
import { StatsGrid } from '@/app/(dashboard)/dashboard/components/stats/StatsGrid';
import { QuickActions } from '@/app/(dashboard)/dashboard/components/widgets/QuickActions';

interface KepalaKlinikDashboardProps {
    user: any;
    patientStats: any;
    userStats: any;
    notifStats: any;
    loading: any;
}

export function KepalaKlinikDashboard({
    user,
    patientStats,
    userStats,
    notifStats,
    loading
}: KepalaKlinikDashboardProps) {
    const router = useRouter();

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

    // Mock Data (Placeholder untuk UI tabel)
    const recentPatients = [
        { id: 1, nama: 'Ahmad Fauzi', email: 'ahmad@example.com', status: 'active', lastVisit: '2024-01-15' },
        { id: 2, nama: 'Siti Nurhaliza', email: 'siti@example.com', status: 'active', lastVisit: '2024-01-14' },
    ];

    const patientColumns = [
        { key: 'nama', header: 'Nama Pasien' },
        { key: 'email', header: 'Email' },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {row.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
            )
        },
    ];

    return (
        // CONTAINER UTAMA: w-full agar melebar, pb-24 agar scrollable sampai bawah
        <div className="flex flex-col gap-6 w-full min-h-screen pb-24 animate-in fade-in duration-500">


            {/* 2. Statistik Utama */}
            <div className="w-full">
                <StatsGrid
                    stats={stats}
                    loading={loading.patients || loading.users || loading.notifications}
                />
            </div>

            {/* 3. Aksi Cepat */}
            <div className="w-full">
                <QuickActions actions={quickActions} />
            </div>

            {/* 4. Tabel Data */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                <Card className="w-full h-full flex flex-col">
                    <Card.Header divider className="py-4 px-6">
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <Card.Title className="text-base">Pasien Terbaru</Card.Title>
                                <Card.Description>Registrasi minggu ini</Card.Description>
                            </div>
                            <button
                                onClick={() => router.push(ROUTES.PATIENTS)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Lihat Semua
                            </button>
                        </div>
                    </Card.Header>
                    <Card.Body padding="none" className="flex-1 overflow-hidden">
                        {/* Wrapper overflow-x-auto untuk responsivitas tabel */}
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

                {/* Placeholder untuk tabel lain/chart di masa depan */}
                <Card className="w-full h-full flex flex-col min-h-[300px] justify-center items-center text-gray-400 border-dashed">
                    <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">Analitik Aktivitas (Segera Hadir)</p>
                </Card>
            </div>
        </div>
    );
}