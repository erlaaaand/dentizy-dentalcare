'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, User, MapPin, Phone, AlertCircle, ArrowLeft } from 'lucide-react';

// Core
import { useGetPatient, useUpdatePatient } from '@/core/services/api';
import { useToast } from '@/core/hooks/ui/useToast';
import { useForm } from '@/core/hooks/forms/useForm';
import { validatePatientForm, sanitizePatientFormData } from '@/core/validators/patient.schema';
import { UpdatePatientDto } from '@/core/api/model/updatePatientDto';

// UI
import {
    PageContainer,
    PageHeader,
    Button,
    ButtonGroup,
    Input,
    Textarea,
    ErrorAlert,
    LoadingSpinner,
    ErrorMessage,
    WarningAlert,
    ToastContainer,
    Select,
} from '@/components';

export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const { showSuccess, showError } = useToast();
    const patientId = parseInt(params.id as string);

    const { data, isLoading } = patientId
        ? useGetPatient(patientId)
        : { data: null, isLoading: false };

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
    } = useForm<any>({
        initialValues: {
            nama_lengkap: '',
            nik: '',
            jenis_kelamin: '',
            tanggal_lahir: '',
            no_hp: '',
            email: '',
            alamat: '',
        },
        customValidate: (data) => {
            const validation = validatePatientForm(data);
            return validation.errors;
        },
        onSubmit: async (data) => {
            try {
                const sanitized = sanitizePatientFormData(data);
                await updateMutation.mutateAsync({ id: patientId, data: sanitized as UpdatePatientDto });
                showSuccess('Data pasien berhasil diperbarui!');

                setTimeout(() => {
                    router.push('/patients');
                }, 1500);
            } catch (error: any) {
                showError(error?.message || 'Gagal memperbarui data');
            }
        },
    });

    const [hasInitialized, setHasInitialized] = React.useState(false);

    useEffect(() => {
        if (data && !hasInitialized) {
            setFieldValue('nama_lengkap', data.nama_lengkap);
            setFieldValue('nik', data.nik || '');
            setFieldValue('jenis_kelamin', data.jenis_kelamin);
            setFieldValue('tanggal_lahir', data.tanggal_lahir
                ? new Date(data.tanggal_lahir).toISOString().split('T')[0]
                : '');
            setFieldValue('no_hp', data.no_hp || '');
            setFieldValue('email', data.email || '');
            setFieldValue('alamat', data.alamat || '');
            setHasInitialized(true);
        }
    }, [data, hasInitialized, setFieldValue]);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (!data) {
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
                title="Edit Data Pasien"
                description={`Perbarui informasi untuk ${data?.nama_lengkap}`}
                actions={
                    <Button
                        variant="outline"
                        icon={<ArrowLeft className="w-4 h-4" />}
                        iconPosition="left"
                        onClick={() => router.back()}
                    >
                        Kembali
                    </Button>
                }
            />

            <div className="mb-6">
                <WarningAlert
                    title="Perhatian"
                    message="Pastikan data yang Anda ubah sudah benar. Perubahan akan langsung tersimpan setelah Anda klik tombol Simpan Perubahan."
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
                                    value={values.nama_lengkap}
                                    onChange={(e) => handleChange('nama_lengkap')(e.target.value)}
                                    onBlur={() => handleBlur('nama_lengkap')()}
                                    error={touched.nama_lengkap ? errors.nama_lengkap : undefined}
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

                            <Select
                                label="Jenis Kelamin"
                                required
                                value={values.jenis_kelamin}
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
                                onBlur={() => handleBlur('tanggal_lahir')()}
                                error={touched.tanggal_lahir ? errors.tanggal_lahir : undefined}
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
                                value={values.no_hp}
                                onChange={(e) => handleChange('no_hp')(e.target.value)}
                                onBlur={() => handleBlur('no_hp')()}
                                error={touched.no_hp ? errors.no_hp : undefined}
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
                            value={values.alamat}
                            onChange={(e) => handleChange('alamat')(e.target.value)}
                            onBlur={() => handleBlur('alamat')()}
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
                            icon={<Save className="w-4 h-4" />}
                            iconPosition="left"
                        >
                            Simpan Perubahan
                        </Button>
                    </ButtonGroup>
                </div>
            </form>

            <ToastContainer />
        </PageContainer>
    );
}