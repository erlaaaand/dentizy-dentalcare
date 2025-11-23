'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Calendar, Phone, MapPin, Mail, CreditCard, Activity, Clock, ArrowLeft, FileText } from 'lucide-react';

// Core
import { useGetPatient } from '@/core/services/api';
import { formatDate } from '@/core';

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
    ErrorAlert,
    LoadingSpinner,
    StatsCard,
    Badge,
    InfoAlert,
} from '@/components';

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = Number(params.id);

    const { data: patient, isLoading, isError } = useGetPatient(patientId);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (isError || !patient) {
        return (
            <PageContainer>
                <div className="max-w-2xl mx-auto mt-12">
                    <ErrorAlert
                        title="Data Tidak Ditemukan"
                        message="Pasien yang Anda cari tidak ditemukan atau telah dihapus."
                    />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title={patient.nama_lengkap}
                description={`No. Rekam Medis: ${patient.nomor_rekam_medis}`}
                actions={
                    <ButtonGroup>
                        <Button
                            variant="outline"
                            icon={<ArrowLeft className="w-4 h-4" />}
                            iconPosition="left"
                            onClick={() => router.back()}
                        >
                            Kembali
                        </Button>
                        <Button
                            icon={<Edit className="w-4 h-4" />}
                            iconPosition="left"
                            onClick={() => router.push(`/patients/${patient.id}/edit`)}
                        >
                            Edit Data
                        </Button>
                    </ButtonGroup>
                }
            />

            {/* Info Alert */}
            <div className="mb-6">
                <InfoAlert
                    title="Informasi"
                    message="Data pasien ini dapat diperbarui kapan saja melalui tombol Edit Data di atas."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri - Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-24"></div>
                        <div className="px-6 pb-6">
                            <div className="flex flex-col items-center -mt-12">
                                <Avatar
                                    name={patient.nama_lengkap}
                                    size="xl"
                                    className="ring-4 ring-white shadow-lg"
                                />
                                <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">
                                    {patient.nama_lengkap}
                                </h2>
                                <p className="text-sm text-gray-500 font-mono mt-1">
                                    {patient.nomor_rekam_medis}
                                </p>

                                <Badge
                                    variant={patient.jenis_kelamin === 'L' ? 'info' : 'default'}
                                    dot
                                    className="mt-3"
                                >
                                    {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                </Badge>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                                <DetailItem
                                    icon={<Calendar className="w-5 h-5 text-blue-500" />}
                                    label="Tanggal Lahir"
                                    value={formatDate(patient.tanggal_lahir)}
                                />

                                <DetailItem
                                    icon={<Phone className="w-5 h-5 text-green-500" />}
                                    label="Nomor Telepon"
                                    value={patient.no_hp || '-'}
                                />

                                <DetailItem
                                    icon={<Mail className="w-5 h-5 text-purple-500" />}
                                    label="Email"
                                    value={patient.email || '-'}
                                />

                                <DetailItem
                                    icon={<CreditCard className="w-5 h-5 text-amber-500" />}
                                    label="NIK"
                                    value={patient.nik || '-'}
                                />

                                <DetailItem
                                    icon={<MapPin className="w-5 h-5 text-red-500" />}
                                    label="Alamat"
                                    value={patient.alamat || '-'}
                                    multiline
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Total Kunjungan"
                            value="0"
                            icon={<Activity className="w-5 h-5" />}
                        />
                        <StatsCard
                            title="Rekam Medis"
                            value="0"
                            icon={<FileText className="w-5 h-5" />}
                        />
                        <StatsCard
                            title="Janji Temu"
                            value="0"
                            icon={<Calendar className="w-5 h-5" />}
                        />
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    icon={<Calendar className="w-5 h-5" />}
                                    iconPosition="left"
                                    onClick={() => router.push('/appointments/new')}
                                >
                                    Buat Janji Temu
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                    icon={<Activity className="w-5 h-5" />}
                                    iconPosition="left"
                                    onClick={() => router.push('/medical-records/new')}
                                >
                                    Tambah Rekam Medis
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Appointment History */}
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
                            <div className="text-center py-12 text-gray-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <Clock className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium mb-2">Belum ada riwayat janji temu</p>
                                <p className="text-xs text-gray-400 mb-4">
                                    Buat janji temu pertama untuk pasien ini
                                </p>
                                <Button
                                    size="sm"
                                    icon={<Calendar className="w-4 h-4" />}
                                    iconPosition="left"
                                    onClick={() => router.push('/appointments/new')}
                                >
                                    Buat Janji Temu Baru
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Medical Records */}
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
                            <div className="text-center py-12 text-gray-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <Activity className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium mb-2">Belum ada rekam medis</p>
                                <p className="text-xs text-gray-400 mb-4">
                                    Tambahkan rekam medis pertama untuk pasien ini
                                </p>
                                <Button
                                    size="sm"
                                    icon={<FileText className="w-4 h-4" />}
                                    iconPosition="left"
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

interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    multiline?: boolean;
}

function DetailItem({ icon, label, value, multiline = false }: DetailItemProps) {
    return (
        <div className={`flex ${multiline ? 'items-start' : 'items-center'} gap-3`}>
            <span className="flex-shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {label}
                </p>
                <p className={`text-sm font-medium text-gray-900 ${multiline ? '' : 'truncate'}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}