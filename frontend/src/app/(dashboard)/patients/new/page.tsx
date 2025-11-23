'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form'; // atau gunakan useForm wrapper dari core jika ada custom logic
import { yupResolver } from '@hookform/resolvers/yup';

// Core
import { PatientService } from '@/core/services/api/patient.api';
import { useToast } from '@/core/hooks/ui/useToast';
import { createPatientSchema } from '@/core';
import { CreatePatientDto } from '@/core/api/model/createPatientDto';

// UI
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/layout/page-header/PageHeader';
import { Card, CardBody, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components';
import { Input } from '@/components/ui/forms/input/Input';
import { Textarea } from '@/components/ui/forms/text-area/Textarea';
import { ErrorMessage } from '@/components/ui/feedback/error-message/ErrorMessage';

export default function NewPatientPage() {
    const router = useRouter();
    const toast = useToast();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<CreatePatientDto>({
        resolver: yupResolver(createPatientSchema),
    });

    const onSubmit = async (data: CreatePatientDto) => {
        try {
            await PatientService.create(data);
            toast.success('Pasien baru berhasil ditambahkan');
            router.push('/patients');
        } catch (error: any) {
            toast.error(error.message || 'Gagal menambahkan pasien');
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Tambah Pasien Baru"
                breadcrumb={[
                    { label: 'Pasien', href: '/patients' },
                    { label: 'Tambah Baru', active: true },
                ]}
                action={
                    <Button
                        variant="outline"
                        startIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => router.back()}
                    >
                        Kembali
                    </Button>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardBody>
                        <CardTitle>Informasi Pribadi</CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

                            {/* Nama Lengkap */}
                            <div className="space-y-2">
                                <Input
                                    label="Nama Lengkap"
                                    placeholder="Masukkan nama lengkap pasien"
                                    error={errors.name?.message}
                                    {...register('name')}
                                    required
                                />
                            </div>

                            {/* NIK */}
                            <div className="space-y-2">
                                <Input
                                    label="NIK (Nomor Induk Kependudukan)"
                                    placeholder="16 digit NIK"
                                    error={errors.nik?.message}
                                    {...register('nik')}
                                />
                            </div>

                            {/* Jenis Kelamin - Menggunakan Controlled Component jika Select support control, 
                  atau register native select. Asumsi Select component support react-hook-form via props atau Controller */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Jenis Kelamin <span className="text-red-500">*</span></label>
                                <select
                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-primary-500 focus:border-primary-500"
                                    {...register('gender')}
                                >
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="LAKI_LAKI">Laki-laki</option>
                                    <option value="PEREMPUAN">Perempuan</option>
                                </select>
                                {errors.gender && <ErrorMessage message={errors.gender.message} />}
                            </div>

                            {/* Tempat & Tanggal Lahir */}
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    label="Tanggal Lahir"
                                    error={errors.birthDate?.message}
                                    {...register('birthDate')}
                                    required
                                />
                            </div>

                            {/* No HP */}
                            <div className="space-y-2">
                                <Input
                                    label="Nomor Telepon / WhatsApp"
                                    placeholder="08xxxxxxxxxx"
                                    error={errors.phoneNumber?.message}
                                    {...register('phoneNumber')}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Input
                                    label="Email (Opsional)"
                                    type="email"
                                    placeholder="nama@email.com"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>

                            {/* Alamat */}
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <Textarea
                                    label="Alamat Lengkap"
                                    placeholder="Jl. Contoh No. 123..."
                                    error={errors.address?.message}
                                    {...register('address')}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        startIcon={<Save className="w-4 h-4" />}
                    >
                        Simpan Data
                    </Button>
                </div>
            </form>
        </PageContainer>
    );
}