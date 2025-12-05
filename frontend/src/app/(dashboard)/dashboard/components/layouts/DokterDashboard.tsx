// frontend/src/app/(dashboard)/dashboard/components/layouts/DokterDashboard.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ClipboardList, Clock, CheckCircle2, Search } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import { Card, Badge, EmptyState, Button, StatsCard } from '@/components/ui';
import { DashboardHeader } from '../shared/DashboardHeader';
import { AppointmentList } from '../widgets/AppointmentList';
import type { DashboardLayoutProps } from '../../types/dashboard.types';

export function DokterDashboard({
    user,
    patientStats,
    todayAppointments,
    loading
}: DashboardLayoutProps) {
    const router = useRouter();

    // Data Processing
    const appointments = useMemo(() =>
        todayAppointments?.data?.map((apt: any) => ({
            id: apt.id,
            time: apt.jam_janji,
            patientName: apt.patient?.nama_lengkap || 'Pasien',
            complaint: apt.keluhan,
            status: apt.status
        })) || []
    , [todayAppointments]);

    const activeAppointments = appointments.filter((a: any) => a.status === 'confirmed' || a.status === 'pending');
    const completedCount = appointments.filter((a: any) => a.status === 'completed').length;

    // Custom Stats untuk Dokter
    const stats = [
        { title: 'Pasien Menunggu', value: activeAppointments.length, icon: <Clock className="w-5 h-5" />, color: 'orange' as const },
        { title: 'Selesai Hari Ini', value: completedCount, icon: <CheckCircle2 className="w-5 h-5" />, color: 'green' as const },
        { title: 'Total Pasien Saya', value: patientStats?.total ?? 0, icon: <Calendar className="w-5 h-5" />, color: 'blue' as const },
    ];

    if (loading?.appointments) return <div>Loading...</div>; // Ganti dengan Skeleton yang sesuai

    return (
        <div className="w-full pb-24 animate-in fade-in duration-500">
            {/* Header: Judul + Tombol Cari Pasien Cepat */}
            <DashboardHeader 
                title={`Halo, Dr. ${user?.nama_lengkap || ''}`}
                subtitle="Berikut adalah jadwal praktik Anda hari ini."
                action={
                    <Button 
                        variant="outline" 
                        onClick={() => router.push(ROUTES.MEDICAL_RECORDS)}
                        className="bg-white hover:bg-gray-50"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Cari Rekam Medis
                    </Button>
                }
            />

            <div className="flex flex-col gap-6">
                {/* 1. Stats Bar (Lebih kecil/compact) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat, idx) => (
                        <StatsCard 
                            key={idx}
                            {...stat}
                            className="bg-white border shadow-sm"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2. Main Column: Jadwal Hari Ini (Lebih Dominan) */}
                    <div className="lg:col-span-2">
                        <AppointmentList 
                            appointments={appointments}
                            title="Antrian Praktik Hari Ini"
                            emptyMessage="Tidak ada jadwal pasien hari ini. Silakan istirahat!"
                        />
                    </div>

                    {/* 3. Side Column: Quick Access Medical Records / Tools */}
                    <div className="space-y-6">
                        <Card className="border-teal-100 bg-teal-50/30">
                            <Card.Header>
                                <Card.Title className="text-teal-800">Aksi Klinis</Card.Title>
                            </Card.Header>
                            <Card.Body padding="md" className="space-y-3">
                                <button 
                                    onClick={() => router.push(ROUTES.MEDICAL_RECORDS)}
                                    className="w-full flex items-center p-4 bg-white rounded-xl border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all text-left"
                                >
                                    <div className="p-2 bg-teal-100 rounded-lg mr-3 text-teal-600">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Rekam Medis</h4>
                                        <p className="text-xs text-gray-500">Input atau lihat riwayat</p>
                                    </div>
                                </button>
                                
                                <button 
                                    onClick={() => router.push(ROUTES.APPOINTMENTS)}
                                    className="w-full flex items-center p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all text-left"
                                >
                                    <div className="p-2 bg-blue-100 rounded-lg mr-3 text-blue-600">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Kalender Penuh</h4>
                                        <p className="text-xs text-gray-500">Cek jadwal mendatang</p>
                                    </div>
                                </button>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}