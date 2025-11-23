'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, User, MapPin, Phone, Calendar, AlertCircle } from 'lucide-react';

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
    Card,
    CardBody,
    CardTitle,
    Button,
    ButtonGroup,
    Input,
    Textarea,
    ErrorAlert,
    LoadingSpinner,
    ErrorMessage,
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
                showSuccess('Data pasien berhasil diperbarui');
                router.push('/patients');
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
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            </PageContainer>
        );
    }

    if (!data) {
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
                title="Edit Data Pasien"
                description={`Perbarui informasi untuk ${data?.nama_lengkap}`}
                actions={
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Kembali
                    </Button>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-start gap-3 text-blue-800 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium mb-1">Perhatian</p>
                        <p className="text-sm">
                            Pastikan data yang Anda ubah sudah benar. Perubahan akan langsung tersimpan setelah Anda klik tombol Simpan.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardBody>
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-primary-600" />
                            <CardTitle>Informasi Pribadi</CardTitle>
                        </div>

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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Jenis Kelamin <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={values.jenis_kelamin}
                                    onChange={(e) => handleChange('jenis_kelamin')(e.target.value)}
                                    onBlur={() => handleBlur('jenis_kelamin')()}
                                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                {touched.jenis_kelamin && errors.jenis_kelamin && (
                                    <ErrorMessage message={errors.jenis_kelamin} />
                                )}
                            </div>

                            <Input
                                type="date"
                                label="Tanggal Lahir"
                                value={values.tanggal_lahir}
                                onChange={(e) => handleChange('tanggal_lahir')(e.target.value)}
                                onBlur={() => handleBlur('tanggal_lahir')()}
                                error={touched.tanggal_lahir ? errors.tanggal_lahir : undefined}
                            />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center gap-2 mb-6">
                            <Phone className="w-5 h-5 text-primary-600" />
                            <CardTitle>Informasi Kontak</CardTitle>
                        </div>

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
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin className="w-5 h-5 text-primary-600" />
                            <CardTitle>Alamat Lengkap</CardTitle>
                        </div>

                        <Textarea
                            label="Alamat"
                            value={values.alamat}
                            onChange={(e) => handleChange('alamat')(e.target.value)}
                            onBlur={() => handleBlur('alamat')()}
                            error={touched.alamat ? errors.alamat : undefined}
                            rows={4}
                        />
                    </CardBody>
                </Card>

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
                            loading={isSubmitting}
                            icon={<Save className="w-4 h-4" />}
                            iconPosition="left"
                        >
                            Simpan Perubahan
                        </Button>
                    </ButtonGroup>
                </div>
            </form>
        </PageContainer>
    );
}