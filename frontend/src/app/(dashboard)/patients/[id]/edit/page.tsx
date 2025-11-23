'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, User, MapPin, Phone, Calendar, AlertCircle } from 'lucide-react';

// Core
import { useGetPatient, useUpdatePatient } from '@/core/services/api';
import { useToast } from '@/core/hooks/ui/useToast';
import { useForm } from '@/core/hooks/forms/useForm';
import { createPatientSchema } from '@/core/validators/patient.schema';
import { UpdatePatientDto } from '@/core/api/model/updatePatientDto';

// UI
import {
    PageContainer,
    PageHeader,
    Card,
    CardBody,
    CardTitle,
    Button,
    ButtonGroup,
    Input,
    Select,
    Textarea,
    SkeletonForm,
    ErrorAlert,
    LoadingSpinner,
    ErrorMessage,
} from '@/components';

export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const { showSuccess, showError } = useToast();
    const patientId = params.id as string;

    // Fetch patient data
    const { data: patient, isLoading, isError } = useGetPatient({ id: patientId });
    const updateMutation = useUpdatePatient();

    const {
        values,
        errors,
        touched,
        isSubmitting,
        setFieldValue,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm<UpdatePatientDto>({
        initialValues: {
            name: '',
            nik: '',
            gender: '',
            birthDate: '',
            phoneNumber: '',
            email: '',
            address: '',
        },
        validationSchema: createPatientSchema,
        onSubmit: async (data) => {
            try {
                await updateMutation.mutateAsync({ id: patientId, data });
                showSuccess('Data pasien berhasil diperbarui');
                router.push('/patients');
            } catch (error: any) {
                showError(error?.message || 'Gagal memperbarui data');
            }
        },
    });

    // Pre-fill form when data loads
    useEffect(() => {
        if (patient) {
            setFieldValue('name', patient.name);
            setFieldValue('nik', patient.nik || '');
            setFieldValue('gender', patient.gender);
            setFieldValue('birthDate', patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '');
            setFieldValue('phoneNumber', patient.phoneNumber || '');
            setFieldValue('email', patient.email || '');
            setFieldValue('address', patient.address || '');
        }
    }, [patient, setFieldValue]);

    // Loading State
    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
                <SkeletonForm />
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
                title="Edit Data Pasien"
                description={`Perbarui informasi untuk ${patient.name}`}
                breadcrumbs={[
                    { children: 'Dashboard', href: '/dashboard' },
                    { children: 'Pasien', href: '/patients' },
                    { children: patient.name, href: `/patients/${patient.id}` },
                    { children: 'Edit', isCurrent: true },
                ]}
                actions={
                    <Button
                        variant="outline"
                        startIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => router.back()}
                    >
                        Kembali
                    </Button>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info Alert */}
                <Card>
                    <CardBody>
                        <div className="flex items-start gap-3 text-blue-800 bg-blue-50 p-4 rounded-lg">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium mb-1">Perhatian</p>
                                <p className="text-sm">
                                    Pastikan data yang Anda ubah sudah benar. Perubahan akan langsung tersimpan setelah Anda klik tombol Simpan.
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Informasi Pribadi */}
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary-600" />
                            <CardTitle>Informasi Pribadi</CardTitle>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Input
                                    label="Nama Lengkap"
                                    value={values.name}
                                    onChange={(e) => handleChange('name')(e.target.value)}
                                    onBlur={() => handleBlur('name')()}
                                    error={touched.name ? errors.name : undefined}
                                    required
                                />
                            </div>

                            <Input
                                label="NIK (Nomor Induk Kependudukan)"
                                value={values.nik}
                                onChange={(e) => handleChange('nik')(e.target.value)}
                                onBlur={() => handleBlur('nik')()}
                                error={touched.nik ? errors.nik : undefined}
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Jenis Kelamin <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={values.gender}
                                    onChange={(e) => handleChange('gender')(e.target.value)}
                                    onBlur={() => handleBlur('gender')()}
                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="LAKI_LAKI">Laki-laki</option>
                                    <option value="PEREMPUAN">Perempuan</option>
                                </select>
                                {touched.gender && errors.gender && (
                                    <ErrorMessage message={errors.gender} />
                                )}
                            </div>

                            <Input
                                type="date"
                                label="Tanggal Lahir"
                                value={values.birthDate}
                                onChange={(e) => handleChange('birthDate')(e.target.value)}
                                onBlur={() => handleBlur('birthDate')()}
                                error={touched.birthDate ? errors.birthDate : undefined}
                                required
                                startIcon={<Calendar className="w-4 h-4" />}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Informasi Kontak */}
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-2 mb-4">
                            <Phone className="w-5 h-5 text-primary-600" />
                            <CardTitle>Informasi Kontak</CardTitle>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nomor Telepon / WhatsApp"
                                value={values.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber')(e.target.value)}
                                onBlur={() => handleBlur('phoneNumber')()}
                                error={touched.phoneNumber ? errors.phoneNumber : undefined}
                                required
                                startIcon={<Phone className="w-4 h-4" />}
                            />

                            <Input
                                label="Email (Opsional)"
                                type="email"
                                value={values.email}
                                onChange={(e) => handleChange('email')(e.target.value)}
                                onBlur={() => handleBlur('email')()}
                                error={touched.email ? errors.email : undefined}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Alamat */}
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <CardTitle>Alamat Lengkap</CardTitle>
                        </div>

                        <Textarea
                            label="Alamat"
                            value={values.address}
                            onChange={(e) => handleChange('address')(e.target.value)}
                            onBlur={() => handleBlur('address')()}
                            error={touched.address ? errors.address : undefined}
                            rows={4}
                        />
                    </CardBody>
                </Card>

                {/* Actions */}
                <Card>
                    <CardBody>
                        <div className="flex justify-end">
                            <ButtonGroup>
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
                            </ButtonGroup>
                        </div>
                    </CardBody>
                </Card>
            </form>
        </PageContainer>
    );
}