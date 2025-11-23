'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Calendar, Phone, MapPin, Mail, CreditCard, User } from 'lucide-react';

// Core
import { PatientService } from '@/core/services/api/patient.api';
import { PatientResponseDto } from '@/core/api/model/patientResponseDto';
import { formatDate } from '@/core/utils/date/format.utils';

// UI
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/layout/page-header/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button/Button';
import { Avatar } from '@/components/ui/data-display/avatar/Avatar';
import { StatusBadge } from '@/components/ui/data-display/badge/StatusBadge';
import { SkeletonProfile } from '@/components/ui/data-display/skeleton/SkeletonProfile';
import { SkeletonCard } from '@/components/ui/data-display/skeleton/SkeletonCard';

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [patient, setPatient] = useState<PatientResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                if (typeof params.id === 'string') {
                    const data = await PatientService.findOne(params.id);
                    setPatient(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [params.id]);

    if (loading) {
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

    if (!patient) return <div>Data tidak ditemukan</div>;

    return (
        <PageContainer>
            <PageHeader
                title="Detail Pasien"
                breadcrumb={[
                    { label: 'Pasien', href: '/patients' },
                    { label: patient.name, active: true },
                ]}
                action={
                    <Button
                        variant="outline"
                        startIcon={<Edit className="w-4 h-4" />}
                        onClick={() => router.push(`/patients/${patient.id}/edit`)}
                    >
                        Edit Data
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Profil Utama */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardBody className="flex flex-col items-center text-center p-6">
                            <Avatar
                                initials={patient.name.substring(0, 2).toUpperCase()}
                                size="xl"
                                className="mb-4 text-2xl"
                            />
                            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">{patient.medicalRecordNumber}</p>

                            <StatusBadge
                                variant={patient.gender === 'LAKI_LAKI' ? 'blue' : 'pink'}
                                label={patient.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                                className="mb-6"
                            />

                            <div className="w-full space-y-4 text-left border-t pt-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500 text-xs">Tanggal Lahir</p>
                                        <p className="font-medium">{formatDate(patient.birthDate)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500 text-xs">Nomor Telepon</p>
                                        <p className="font-medium">{patient.phoneNumber || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500 text-xs">Email</p>
                                        <p className="font-medium">{patient.email || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500 text-xs">NIK</p>
                                        <p className="font-medium">{patient.nik || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-gray-500 text-xs">Alamat</p>
                                        <p className="font-medium">{patient.address || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Kolom Kanan: Detail Lainnya (Bisa dikembangkan untuk Rekam Medis/Appointment) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Kunjungan</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                                    <p className="text-sm text-primary-600 mb-1">Total Kunjungan</p>
                                    <p className="text-2xl font-bold text-primary-700">0</p>
                                    {/* Note: Logic fetch count bisa ditambahkan dari service medical record */}
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-sm text-green-600 mb-1">Terakhir Berkunjung</p>
                                    <p className="text-lg font-bold text-green-700">-</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Janji Temu</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="text-center py-8 text-gray-500 text-sm">
                                Fitur riwayat janji temu akan segera hadir di sini.
                            </div>
                            {/* Disini Anda bisa memanggil komponen Table Appointment dengan filter patientId */}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}