'use client';

import { useEffect } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { FormSelect } from '@/components/ui/forms/select';
import { useForm } from '@/core/hooks/forms/useForm';
import { useToast } from '@/core/hooks/ui/useToast';
import { Save, Loader2, UserPlus } from 'lucide-react';
import { z } from 'zod';

// Services
import { useCreatePatient, useUpdatePatient } from '@/core/services/api/patient.api';
import { VALIDATION_RULES } from '@/core/constants/validation.constants';

interface PatientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess: () => void;
}

// [FIX 1] Gunakan z.string().refine untuk validasi enum yang lebih fleksibel terhadap string kosong
const patientSchema = z.object({
    nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter'),
    nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka').optional().or(z.literal('')),

    // Validasi: Harus 'L' atau 'P'. Jika kosong, pesan error muncul.
    jenis_kelamin: z.string().refine((val) => val === 'L' || val === 'P', {
        message: 'Pilih jenis kelamin'
    }),

    alamat: z.string().optional(),
    no_hp: z.string().regex(VALIDATION_RULES.PHONE.PATTERN, 'Format HP tidak valid').optional().or(z.literal('')),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
});

export default function PatientFormModal({ isOpen, onClose, initialData, onSuccess }: PatientFormModalProps) {
    const toast = useToast();
    const createMutation = useCreatePatient();
    const updateMutation = useUpdatePatient();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const form = useForm({
        initialValues: {
            nama_lengkap: '',
            nik: '',
            // [FIX 2] Gunakan 'as any' untuk inisialisasi agar tidak bentrok dengan tipe strict
            jenis_kelamin: '' as any,
            alamat: '',
            no_hp: '',
            email: '',
            tanggal_lahir: '',
        },
        validationSchema: patientSchema,
        validateOnChange: false,
        onSubmit: async (values) => {
            try {
                // [FIX 3] Hapus manual check setFieldError. Biarkan Zod Schema yang validasi.

                const payload = {
                    ...values,
                    // Bersihkan string kosong jadi undefined untuk field opsional
                    nik: values.nik || undefined,
                    email: values.email || undefined,
                    no_hp: values.no_hp || undefined,
                    // Pastikan tipe data sesuai kontrak API
                    jenis_kelamin: values.jenis_kelamin as 'L' | 'P',
                };

                if (isEdit) {
                    await updateMutation.mutateAsync({ id: initialData.id, data: payload as any });
                    toast.showSuccess('Data pasien berhasil diperbarui');
                } else {
                    await createMutation.mutateAsync({ data: payload as any });
                    toast.showSuccess('Pasien baru berhasil ditambahkan');
                }

                onSuccess();
                onClose();
            } catch (error: any) {
                toast.showError(error?.response?.data?.message || 'Gagal menyimpan data');
            }
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.resetForm();
            if (initialData) {
                form.setValues({
                    nama_lengkap: initialData.nama_lengkap,
                    nik: initialData.nik || '',
                    jenis_kelamin: initialData.jenis_kelamin,
                    alamat: initialData.alamat || '',
                    no_hp: initialData.no_hp || '',
                    email: initialData.email || '',
                    tanggal_lahir: initialData.tanggal_lahir ? new Date(initialData.tanggal_lahir).toISOString().split('T')[0] : '',
                });
            } else {
                // Reset manual untuk mode create
                form.setValues({
                    nama_lengkap: '',
                    nik: '',
                    jenis_kelamin: '' as any,
                    alamat: '',
                    no_hp: '',
                    email: '',
                    tanggal_lahir: '',
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Data Pasien" : "Tambah Pasien Baru"}
            description={isEdit ? "Perbarui informasi identitas pasien." : "Daftarkan pasien baru ke dalam sistem klinik."}
            size="xl"
        >
            <form onSubmit={form.handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nama Lengkap */}
                    <div className="md:col-span-2">
                        <Input
                            label="Nama Lengkap"
                            placeholder="Sesuai KTP"
                            value={form.values.nama_lengkap}
                            onChange={(e) => form.setFieldValue('nama_lengkap', e.target.value)}
                            error={form.errors.nama_lengkap}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* NIK */}
                    <Input
                        label="NIK"
                        placeholder="16 Digit NIK"
                        value={form.values.nik}
                        onChange={(e) => form.setFieldValue('nik', e.target.value)}
                        error={form.errors.nik}
                        disabled={isLoading}
                    />

                    {/* Gender */}
                    <FormSelect
                        label="Jenis Kelamin"
                        placeholder="-- Pilih --"
                        value={form.values.jenis_kelamin}
                        onChange={(val) => form.setFieldValue('jenis_kelamin', val)}
                        error={form.errors.jenis_kelamin}
                        options={[
                            { value: 'L', label: 'Laki-laki' },
                            { value: 'P', label: 'Perempuan' }
                        ]}
                        disabled={isLoading}
                        required
                    />

                    {/* Tanggal Lahir */}
                    <Input
                        type="date"
                        label="Tanggal Lahir"
                        value={form.values.tanggal_lahir}
                        onChange={(e) => form.setFieldValue('tanggal_lahir', e.target.value)}
                        error={form.errors.tanggal_lahir}
                        disabled={isLoading}
                        required
                    />

                    {/* No HP */}
                    <Input
                        label="No. HP / WhatsApp"
                        placeholder="08..."
                        value={form.values.no_hp}
                        onChange={(e) => form.setFieldValue('no_hp', e.target.value)}
                        error={form.errors.no_hp}
                        disabled={isLoading}
                    />

                    {/* Email */}
                    <Input
                        type="email"
                        label="Email"
                        placeholder="email@contoh.com"
                        value={form.values.email}
                        onChange={(e) => form.setFieldValue('email', e.target.value)}
                        error={form.errors.email}
                        disabled={isLoading}
                    />

                    {/* Alamat */}
                    <div className="md:col-span-2">
                        <Textarea
                            label="Alamat Lengkap"
                            rows={3}
                            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                            value={form.values.alamat}
                            onChange={(e) => form.setFieldValue('alamat', e.target.value)}
                            error={form.errors.alamat}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (isEdit ? <Save className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />)}
                        {isEdit ? 'Simpan Perubahan' : 'Simpan Pasien'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}