'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, MapPin, Phone, ArrowLeft, UserPlus } from 'lucide-react';
import { z } from 'zod';

// Core
import { useCreatePatient } from '@/core/services/api';
import { useToast } from '@/core/hooks/ui/useToast';
import { useForm } from '@/core/hooks/forms/useForm';
import { VALIDATION_RULES } from '@/core/constants/validation.constants';
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
    Textarea,
    Select,
    InfoAlert,
    ToastContainer,
} from '@/components';

const createPatientSchema = z.object({
    nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter'),
    nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka').optional().or(z.literal('')),
    jenis_kelamin: z.enum(['L', 'P'], {
        message: 'Pilih jenis kelamin',
    }),
    alamat: z.string().optional(),
    no_hp: z.string().regex(VALIDATION_RULES.PHONE.PATTERN, 'Format HP tidak valid').optional().or(z.literal('')),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
});

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
        setFieldValue
    } = useForm<CreatePatientDto>({
        initialValues: {
            nama_lengkap: '',
            nik: '',
            jenis_kelamin: undefined,
            alamat: '',
            no_hp: '',
            email: '',
            tanggal_lahir: '',
        },
        validationSchema: createPatientSchema,
        onSubmit: async (data) => {
            try {
                const payload = {
                    ...data,
                    nik: data.nik || undefined,
                    email: data.email || undefined,
                    no_hp: data.no_hp || undefined,
                };

                await createMutation.mutateAsync({ data: payload as CreatePatientDto });
                showSuccess('Pasien baru berhasil ditambahkan!');

                setTimeout(() => {
                    router.push('/patients');
                }, 1500);
            } catch (error: any) {
                showError(error?.message || 'Gagal menambahkan pasien');
            }
        },
    });

    return (
        <PageContainer>
            <PageHeader
                title="Tambah Pasien Baru"
                description="Lengkapi formulir untuk mendaftarkan pasien baru ke dalam sistem"
                actions={
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        icon={<ArrowLeft className="w-4 h-4" />}
                        iconPosition='left'
                    >
                        Kembali
                    </Button>
                }
            />

            <div className="mb-6">
                <InfoAlert
                    title="Panduan Pengisian"
                    message="Pastikan semua data yang dimasukkan sudah benar. Field bertanda (*) wajib diisi."
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Pribadi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                                <p className="text-sm text-gray-600">Data identitas pasien</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Input
                                    label="Nama Lengkap"
                                    placeholder="Masukkan nama lengkap pasien"
                                    value={values.nama_lengkap}
                                    onChange={(e) => handleChange('nama_lengkap')(e.target.value)}
                                    onBlur={handleBlur('nama_lengkap')}
                                    error={touched.nama_lengkap ? errors.nama_lengkap : undefined}
                                    required
                                />
                            </div>

                            <Input
                                label="NIK (Nomor Induk Kependudukan)"
                                placeholder="16 digit NIK"
                                value={values.nik}
                                onChange={(e) => handleChange('nik')(e.target.value)}
                                onBlur={handleBlur('nik')}
                                error={touched.nik ? errors.nik : undefined}
                            />

                            <Select
                                label="Jenis Kelamin"
                                required
                                placeholder="Pilih Jenis Kelamin"
                                value={values.jenis_kelamin || ''}
                                onChange={(val) => setFieldValue('jenis_kelamin', val)}
                                options={[
                                    { value: 'L', label: 'Laki-laki' },
                                    { value: 'P', label: 'Perempuan' }
                                ]}
                                error={touched.jenis_kelamin ? errors.jenis_kelamin : undefined}
                            />

                            <Input
                                type="date"
                                label="Tanggal Lahir"
                                value={values.tanggal_lahir}
                                onChange={(e) => handleChange('tanggal_lahir')(e.target.value)}
                                onBlur={handleBlur('tanggal_lahir')}
                                error={touched.tanggal_lahir ? errors.tanggal_lahir : undefined}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Informasi Kontak */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Informasi Kontak</h3>
                                <p className="text-sm text-gray-600">Data untuk menghubungi pasien</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nomor Telepon / WhatsApp"
                                placeholder="08xxxxxxxxxx"
                                value={values.no_hp}
                                onChange={(e) => handleChange('no_hp')(e.target.value)}
                                onBlur={handleBlur('no_hp')}
                                error={touched.no_hp ? errors.no_hp : undefined}
                            />

                            <Input
                                label="Email (Opsional)"
                                type="email"
                                placeholder="nama@email.com"
                                value={values.email}
                                onChange={(e) => handleChange('email')(e.target.value)}
                                onBlur={handleBlur('email')}
                                error={touched.email ? errors.email : undefined}
                            />
                        </div>
                    </div>
                </div>

                {/* Alamat Lengkap */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Alamat Lengkap</h3>
                                <p className="text-sm text-gray-600">Tempat tinggal pasien</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <Textarea
                            label="Alamat"
                            placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota"
                            value={values.alamat}
                            onChange={(e) => handleChange('alamat')(e.target.value)}
                            onBlur={handleBlur('alamat')}
                            error={touched.alamat ? errors.alamat : undefined}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                            loading={isSubmitting}
                            icon={<UserPlus className="w-4 h-4" />}
                            iconPosition="left"
                        >
                            Simpan Data Pasien
                        </Button>
                    </ButtonGroup>
                </div>
            </form>

            <ToastContainer />
        </PageContainer>
    );
}