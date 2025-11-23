'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, MapPin, Phone, Calendar } from 'lucide-react';

// Core
import { useCreatePatient } from '@/core/services/api';
import { useToast } from '@/core/hooks/ui/useToast';
import { useForm } from '@/core/hooks/forms/useForm';
import { createPatientSchema } from '@/core';
import { CreatePatientDto } from '@/core/api/model/createPatientDto';

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
    ErrorMessage,
    SuccessAlert,
} from '@/components';

export default function NewPatientPage() {
    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const createMutation = useCreatePatient();

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm<CreatePatientDto>({
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
                await createMutation.mutateAsync({ data });
                showSuccess('Pasien baru berhasil ditambahkan');
                router.push('/patients');
            } catch (error: any) {
                showError(error?.message || 'Gagal menambahkan pasien');
            }
        },
    });

    return (
        <PageContainer>
            <PageHeader
                title="Tambah Pasien Baru"
                description="Lengkapi formulir di bawah untuk mendaftarkan pasien baru"
                breadcrumbs={[
                    { children: 'Dashboard', href: '/dashboard' },
                    { children: 'Pasien', href: '/patients' },
                    { children: 'Tambah Baru', isCurrent: true },
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
                                    placeholder="Masukkan nama lengkap pasien"
                                    value={values.name}
                                    onChange={(e) => handleChange('name')(e.target.value)}
                                    onBlur={() => handleBlur('name')()}
                                    error={touched.name ? errors.name : undefined}
                                    required
                                />
                            </div>

                            <Input
                                label="NIK (Nomor Induk Kependudukan)"
                                placeholder="16 digit NIK"
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
                                    <option value="">Pilih Jenis Kelamin</option>
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
                                placeholder="08xxxxxxxxxx"
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
                                placeholder="nama@email.com"
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
                            placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota"
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
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                <span className="text-red-500">*</span> Wajib diisi
                            </p>

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
                                    Simpan Data
                                </Button>
                            </ButtonGroup>
                        </div>
                    </CardBody>
                </Card>
            </form>
        </PageContainer>
    );
}