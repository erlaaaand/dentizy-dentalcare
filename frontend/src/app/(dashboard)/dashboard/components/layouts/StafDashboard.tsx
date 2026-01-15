// frontend/src/app/(dashboard)/dashboard/components/layouts/StafDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { UserPlus, Calendar, Users, Stethoscope } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import { Button, Card } from '@/components/ui';
import { DashboardHeader } from '../shared/DashboardHeader';
import { QuickActionGrid } from '../shared/QuickActionGrid';
import { StatsCard } from '@/components/ui';
import type { DashboardLayoutProps } from '../../types/dashboard.types';

export function StafDashboard({
    user,
    patientStats,
    todayAppointments,
    loading
}: DashboardLayoutProps) {
    const router = useRouter();

    const quickActions = [
        { label: 'Pendaftaran Pasien', icon: <UserPlus className="w-6 h-6 text-white" />, route: ROUTES.PATIENT_CREATE, bgColor: 'bg-blue-600', hoverColor: 'blue-700' }, // Custom style handling needed
        { label: 'Cek Jadwal Dokter', icon: <Calendar className="w-6 h-6 text-white" />, route: ROUTES.APPOINTMENTS, bgColor: 'bg-purple-600', hoverColor: 'purple-700' },
        { label: 'Database Pasien', icon: <Users className="w-6 h-6 text-white" />, route: ROUTES.PATIENTS, bgColor: 'bg-emerald-600', hoverColor: 'emerald-700' },
    ];

    if (loading?.patients) return <div>Loading...</div>;

    return (
        <div className="w-full pb-24 animate-in fade-in duration-500">
            {/* Header dengan Tombol CTA Besar */}
            <DashboardHeader 
                title="Front Desk" 
                subtitle="Kelola antrian dan pendaftaran."
                action={
                    <Button size="lg" onClick={() => router.push(ROUTES.PATIENT_CREATE)} className="shadow-lg shadow-blue-200">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Pasien Baru
                    </Button>
                }
            />

            <div className="flex flex-col gap-8">
                {/* 1. Quick Access Cards (Besar & Jelas untuk layar sentuh/klik cepat) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                        onClick={() => router.push(ROUTES.PATIENT_CREATE)}
                        className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-blue-200/50 transition-all text-left"
                    >
                        <div className="relative z-10 text-white">
                            <div className="p-3 bg-white/20 w-fit rounded-xl mb-4 backdrop-blur-sm">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">Pendaftaran Baru</h3>
                            <p className="text-blue-100 text-sm">Input data pasien walk-in</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
                    </button>

                    <button 
                        onClick={() => router.push(ROUTES.APPOINTMENTS)}
                        className="group relative overflow-hidden p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-purple-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="relative z-10">
                            <div className="p-3 bg-purple-100 w-fit rounded-xl mb-4 text-purple-600">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Jadwal & Antrian</h3>
                            <p className="text-gray-500 text-sm">{todayAppointments?.count || 0} Pasien hari ini</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => router.push(ROUTES.PATIENTS)}
                        className="group relative overflow-hidden p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="relative z-10">
                            <div className="p-3 bg-emerald-100 w-fit rounded-xl mb-4 text-emerald-600">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Data Pasien</h3>
                            <p className="text-gray-500 text-sm">Cari database pasien lama</p>
                        </div>
                    </button>
                </div>

                {/* 2. Statistik Ringkas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-50 border-0">
                        <Card.Body padding="sm" className="text-center">
                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Pasien</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{patientStats?.total || 0}</p>
                        </Card.Body>
                    </Card>
                    <Card className="bg-gray-50 border-0">
                        <Card.Body padding="sm" className="text-center">
                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Pasien Baru (Bulan Ini)</span>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{patientStats?.new_this_month || 0}</p>
                        </Card.Body>
                    </Card>
                    {/* Tambahkan slot kosong atau info lain jika perlu */}
                </div>
            </div>
        </div>
    );
}