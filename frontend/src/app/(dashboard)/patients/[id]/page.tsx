'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Calendar, Phone, MapPin, Mail, CreditCard, Activity, Clock, ArrowLeft } from 'lucide-react';

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
    StatusBadge,
    ErrorAlert,
    LoadingSpinner,
    StatsCard,
    Badge,
} from '@/components';

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = Number(params.id);

    const { data: patient, isLoading, isError } = useGetPatient(patientId);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (isError || !patient) {
        return (
            <PageContainer>
                <ErrorAlert
                    title="Data Tidak Ditemukan"
                    message="Pasien yang Anda cari tidak ditemukan atau telah dihapus."
                // onRetry={() => router.push('/patients')}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title={patient.nama_lengkap}
                description={`No. RM: ${patient.nomor_rekam_medis}`}
                actions={
                    <ButtonGroup>
                        <Button
                            variant="outline"
                            // startIcon={<ArrowLeft className="w-4 h-4" />}
                            onClick={() => router.back()}
                        >
                            Kembali
                        </Button>
                        <Button
                            // startIcon={<Edit className="w-4 h-4" />}
                            onClick={() => router.push(`/patients/${patient.id}/edit`)}
                        >
                            Edit Data
                        </Button>
                    </ButtonGroup>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardBody className="flex flex-col items-center text-center p-6">
                            <Avatar
                                name={patient.nama_lengkap}
                                size="xl"
                                className="mb-4"
                            />
                            <h2 className="text-xl font-bold text-gray-900">{patient.nama_lengkap}</h2>
                            <p className="text-sm text-gray-500 mb-2 font-mono">{patient.nomor_rekam_medis}</p>

                            <Badge
                                variant={patient.jenis_kelamin === 'L' ? 'info' : 'default'}
                                dot
                                className="mb-6"
                            >
                                {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </Badge>

                            <div className="w-full space-y-4 text-left border-t pt-4">
                                <DetailItem
                                    icon={<Calendar className="w-4 h-4 text-gray-400" />}
                                    label="Tanggal Lahir"
                                    value={formatDate(patient.tanggal_lahir)}
                                />

                                <DetailItem
                                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                                    label="Nomor Telepon"
                                    value={patient.no_hp || '-'}
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
                                    value={patient.alamat || '-'}
                                    multiline
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardBody className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                // startIcon={<Calendar className="w-4 h-4" />}
                                onClick={() => router.push('/appointments/new')}
                            >
                                Buat Janji Temu
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                // startIcon={<Activity className="w-4 h-4" />}
                                onClick={() => router.push('/medical-records/new')}
                            >
                                Tambah Rekam Medis
                            </Button>
                        </CardBody>
                    </Card>
                </div>

                {/* Kolom Kanan */}
                <div className="lg:col-span-2 space-y-6">
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