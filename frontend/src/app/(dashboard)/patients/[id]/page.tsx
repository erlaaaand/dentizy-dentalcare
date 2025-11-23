'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Calendar, Phone, MapPin, Mail, CreditCard, User, Activity, Clock, ArrowLeft } from 'lucide-react';

// Core
import { useGetPatient } from '@/core/services/api';
import { formatDate } from '@/core/utils/date/format.utils';

// UI
import {
    PageContainer,
    PageHeader,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Button,
    ButtonGroup,
    Avatar,
    StatusBadge,
    SkeletonProfile,
    SkeletonCard,
    ErrorAlert,
    LoadingSpinner,
    StatsCard,
} from '@/components';

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;

    const { data: patient, isLoading, isError } = useGetPatient({ id: patientId });

    // Loading State
    if (isLoading) {
        return (
            <PageContainer>
                <SkeletonProfile />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </PageContainer>
        );
    }

    // Error State
    if (isError || !patient) {
        return (
            <PageContainer>
                <ErrorAlert
                    title="Data Tidak Ditemukan"
                    message="Pasien yang Anda cari tidak ditemukan atau telah dihapus."
                    onRetry={() => router.push('/patients')}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Detail Pasien"
                breadcrumbs={[
                    { children: 'Dashboard', href: '/dashboard' },
                    { children: 'Pasien', href: '/patients' },
                    { children: patient.name, isCurrent: true },
                ]}
                actions={
                    <ButtonGroup>
                        <Button
                            variant="outline"
                            startIcon={<ArrowLeft className="w-4 h-4" />}
                            onClick={() => router.back()}
                        >
                            Kembali
                        </Button>
                        <Button
                            startIcon={<Edit className="w-4 h-4" />}
                            onClick={() => router.push(`/patients/${patient.id}/edit`)}
                        >
                            Edit Data
                        </Button>
                    </ButtonGroup>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Profil Utama */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardBody className="flex flex-col items-center text-center p-6">
                            <Avatar
                                name={patient.name}
                                size="xl"
                                className="mb-4"
                            />
                            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                            <p className="text-sm text-gray-500 mb-2 font-mono">{patient.medicalRecordNumber}</p>

                            <StatusBadge
                                variant={patient.gender === 'LAKI_LAKI' ? 'info' : 'default'}
                                label={patient.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                                className="mb-6"
                            />

                            <div className="w-full space-y-4 text-left border-t pt-4">
                                <DetailItem
                                    icon={<Calendar className="w-4 h-4 text-gray-400" />}
                                    label="Tanggal Lahir"
                                    value={formatDate(patient.birthDate)}
                                />

                                <DetailItem
                                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                                    label="Nomor Telepon"
                                    value={patient.phoneNumber || '-'}
                                />

                                <DetailItem
                                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                                    label="Email"
                                    value={patient.email || '-'}
                                />

                                <DetailItem
                                    icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                                    label="NIK"
                                    value={patient.nik || '-'}
                                />

                                <DetailItem
                                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                                    label="Alamat"
                                    value={patient.address || '-'}
                                    multiline
                                />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardBody className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                startIcon={<Calendar className="w-4 h-4" />}
                                onClick={() => router.push('/appointments/new')}
                            >
                                Buat Janji Temu
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                startIcon={<Activity className="w-4 h-4" />}
                                onClick={() => router.push('/medical-records/new')}
                            >
                                Tambah Rekam Medis
                            </Button>
                        </CardBody>
                    </Card>
                </div>

                {/* Kolom Kanan: Statistik & Riwayat */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Statistik */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Total Kunjungan"
                            value="0"
                            icon={<Activity className="w-5 h-5" />}
                            trend={{ value: 0, isPositive: true }}
                        />
                        <StatsCard
                            title="Rekam Medis"
                            value="0"
                            icon={<Activity className="w-5 h-5" />}
                        />
                        <StatsCard
                            title="Janji Temu"
                            value="0"
                            icon={<Calendar className="w-5 h-5" />}
                        />
                    </div>

                    {/* Riwayat Janji Temu */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Riwayat Janji Temu</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/appointments')}
                                >
                                    Lihat Semua
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p className="text-sm">Belum ada riwayat janji temu</p>
                                <Button
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => router.push('/appointments/new')}
                                >
                                    Buat Janji Temu Baru
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Riwayat Rekam Medis */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Riwayat Rekam Medis</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/medical-records')}
                                >
                                    Lihat Semua
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p className="text-sm">Belum ada rekam medis</p>
                                <Button
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => router.push('/medical-records/new')}
                                >
                                    Tambah Rekam Medis
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}

// Helper Component
interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    multiline?: boolean;
}

function DetailItem({ icon, label, value, multiline = false }: DetailItemProps) {
    return (
        <div className={`flex ${multiline ? 'items-start' : 'items-center'} gap-3 text-sm`}>
            <span className="flex-shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                <p className={`font-medium text-gray-900 ${multiline ? '' : 'truncate'}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}