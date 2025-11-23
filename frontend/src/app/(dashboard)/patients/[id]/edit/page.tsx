'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Save } from 'lucide-react';

// Core
import { PatientService } from '@/core/services/api/patient.api';
import { useToast } from '@/core/hooks/ui/useToast';
import { createPatientSchema } from '@/core/validators/patient.schema'; // Schema create/update biasanya mirip
import { UpdatePatientDto } from '@/core/api/model/updatePatientDto';

// UI
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/layout/page-header/PageHeader';
import { Card, CardBody, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/forms/input/Input';
import { Textarea } from '@/components/ui/forms/text-area/Textarea';
import { SkeletonForm } from '@/components/ui/data-display/skeleton/SkeletonForm';
import { ErrorMessage } from '@/components/ui/feedback/error-message/ErrorMessage';

export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const toast = useToast();
    const [isLoadingData, setIsLoadingData] = useState(true);

    const patientId = params.id as string;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<UpdatePatientDto>({
        resolver: yupResolver(createPatientSchema), // Menggunakan schema yang sama, sesuaikan jika ada perbedaan
    });

    // Fetch Existing Data
    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const data = await PatientService.findOne(patientId);
                // Pre-fill form
                setValue('name', data.name);
                setValue('nik', data.nik);
                setValue('gender', data.gender);
                setValue('birthDate', data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '');
                setValue('phoneNumber', data.phoneNumber);
                setValue('email', data.email);
                setValue('address', data.address);
            } catch (error) {
                toast.error('Gagal mengambil data pasien');
                router.push('/patients');
            } finally {
                setIsLoadingData(false);
            }
        };

        if (patientId) fetchPatient();
    }, [patientId, setValue, router, toast]);

    const onSubmit = async (data: UpdatePatientDto) => {
        try {
            await PatientService.update(patientId, data);
            toast.success('Data pasien berhasil diperbarui');
            router.push('/patients');
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui data');
        }
    };

    if (isLoadingData) {
        return (
            <PageContainer>
                <SkeletonForm />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Edit Data Pasien"
                breadcrumb={[
                    { label: 'Pasien', href: '/patients' },
                    { label: 'Edit', active: true },
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
                        <CardTitle>Perbarui Informasi</CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

                            <div className="space-y-2">
                                <Input
                                    label="Nama Lengkap"
                                    error={errors.name?.message}
                                    {...register('name')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    label="NIK"
                                    error={errors.nik?.message}
                                    {...register('nik')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    {...register('gender')}
                                >
                                    <option value="LAKI_LAKI">Laki-laki</option>
                                    <option value="PEREMPUAN">Perempuan</option>
                                </select>
                                {errors.gender && <ErrorMessage message={errors.gender.message} />}
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    label="Tanggal Lahir"
                                    error={errors.birthDate?.message}
                                    {...register('birthDate')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    label="Nomor Telepon"
                                    error={errors.phoneNumber?.message}
                                    {...register('phoneNumber')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    label="Email"
                                    type="email"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <Textarea
                                    label="Alamat"
                                    error={errors.address?.message}
                                    {...register('address')}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

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
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </PageContainer>
    );
}