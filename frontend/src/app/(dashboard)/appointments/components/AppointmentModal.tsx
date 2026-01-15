'use client';

import { useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { FormSelect } from '@/components/ui/forms/select';
import { useForm } from '@/core/hooks/forms/useForm';
import { useToast } from '@/core/hooks/ui/useToast';
import { Loader2, Clock, UserCheck, User } from 'lucide-react';
import { z } from 'zod';

// Import API hooks
import {
    useCreateAppointment,
    useUpdateAppointment
} from '@/core/services/api/appointment.api';
import { useUsersControllerFindAll } from '@/core/api/generated/users/users';
import { UsersControllerFindAllRole } from '@/core/api/model';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // Mode EDIT
    defaultPatient?: any; // Mode CREATE (Walk-in)
    onSuccess: () => void;
    currentUser?: any;
    isDoctor?: boolean;
}

const appointmentSchema = z.object({
    patient_id: z.number().min(1, 'Pasien wajib ada'),
    doctor_id: z.string().min(1, 'Dokter wajib dipilih'),
    tanggal_janji: z.string().min(1, 'Tanggal wajib diisi'),
    jam_janji: z.string().min(1, 'Jam wajib diisi'),
    keluhan: z.string().optional(),
    status: z.enum(['dijadwalkan', 'selesai', 'dibatalkan', 'menunggu_konfirmasi']).optional(),
});

export default function AppointmentModal({
    isOpen,
    onClose,
    initialData,
    defaultPatient,
    onSuccess,
    currentUser,
    isDoctor
}: AppointmentModalProps) {
    const toast = useToast();
    const createMutation = useCreateAppointment();
    const updateMutation = useUpdateAppointment();

    // Fetch Dokter
    const { data: doctorsDataRes } = useUsersControllerFindAll({
        role: UsersControllerFindAllRole.dokter,
        limit: 100,
        isActive: true
    });

    const { data: headsDataRes } = useUsersControllerFindAll({
        role: UsersControllerFindAllRole.kepala_klinik,
        limit: 100,
        isActive: true
    });

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Ambil Data Pasien Aktif (Untuk Display)
    const activePatient = initialData?.patient || defaultPatient;

    const doctorOptions = useMemo(() => {
        const docs = (doctorsDataRes as any)?.data || [];
        const heads = (headsDataRes as any)?.data || [];
        // Gabungkan list dokter dan kepala klinik
        const uniqueUsers = Array.from(new Map([...docs, ...heads].map((item: any) => [item['id'], item])).values());

        return uniqueUsers.map((doc: any) => ({
            label: doc.nama_lengkap,
            value: doc.id.toString()
        }));
    }, [doctorsDataRes, headsDataRes]);

    const statusOptions = [
        { label: 'Dijadwalkan', value: 'dijadwalkan' },
        { label: 'Selesai', value: 'selesai' },
        { label: 'Dibatalkan', value: 'dibatalkan' },
        { label: 'Menunggu Konfirmasi', value: 'menunggu_konfirmasi' },
    ];

    const form = useForm({
        initialValues: {
            patient_id: 0,
            doctor_id: '',
            tanggal_janji: '',
            jam_janji: '',
            keluhan: '',
            status: 'dijadwalkan'
        },
        validationSchema: appointmentSchema,
        validateOnChange: false,
        onSubmit: async (values) => {
            try {
                const payload: any = {
                    patient_id: values.patient_id,
                    doctor_id: Number(values.doctor_id),
                    tanggal_janji: values.tanggal_janji,
                    jam_janji: values.jam_janji.length === 5 ? `${values.jam_janji}:00` : values.jam_janji,
                    keluhan: values.keluhan,
                };

                if (isEdit) {
                    const updatePayload = {
                        status: values.status,
                        tanggal_janji: values.tanggal_janji,
                        jam_janji: payload.jam_janji,
                        keluhan: values.keluhan,
                        doctor_id: payload.doctor_id, // Pastikan doctor_id terkirim
                    };

                    await updateMutation.mutateAsync({ id: initialData.id, data: updatePayload });
                    toast.showSuccess('Jadwal berhasil diperbarui');
                } else {
                    await createMutation.mutateAsync({ data: payload });
                    toast.showSuccess('Jadwal berhasil dibuat');
                }

                onSuccess();
                onClose();
            } catch (error: any) {
                if (error?.response?.status === 409) {
                    toast.showError('⚠️ Jadwal bentrok. Silakan pilih waktu lain.');
                } else {
                    toast.showError(error?.response?.data?.message || 'Terjadi kesalahan');
                }
            }
        }
    });

    useEffect(() => {
        if (isOpen) {
            form.resetForm();
            form.setFieldValue('tanggal_janji', new Date().toISOString().split('T')[0]);

            if (initialData) {
                // --- MODE EDIT ---
                // [FIX] Cek nested object 'doctor.id' jika 'doctor_id' flat tidak tersedia
                const currentDoctorId = initialData.doctor?.id?.toString() || initialData.doctor_id?.toString() || '';

                form.setValues({
                    patient_id: initialData.patient_id || initialData.patient?.id || 0,
                    doctor_id: currentDoctorId,
                    tanggal_janji: initialData.tanggal_janji ? new Date(initialData.tanggal_janji).toISOString().split('T')[0] : '',
                    jam_janji: initialData.jam_janji || '',
                    keluhan: initialData.keluhan || '',
                    status: initialData.status || 'dijadwalkan',
                });
            } else if (defaultPatient) {
                // --- MODE WALK-IN ---
                form.setFieldValue('patient_id', defaultPatient.id);
            }

            // --- LOGIC AUTO-LOCK DOKTER (Hanya saat CREATE) ---
            if (isDoctor && currentUser?.id && !initialData) {
                form.setFieldValue('doctor_id', currentUser.id.toString());
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData, defaultPatient, isDoctor, currentUser]);

    // Tentukan apakah input dokter harus didisable
    // Disabled jika: Loading ATAU (User Dokter DAN Sedang Buat Baru)
    // Saat EDIT, kita biarkan ENABLED agar bisa ganti dokter jika perlu
    const isDoctorInputDisabled = isLoading || (isDoctor && !isEdit && !initialData);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Ubah Jadwal Kunjungan" : "Buat Jadwal Baru"}
            description={defaultPatient
                ? "Lengkapi detail kunjungan untuk pasien ini."
                : "Perbarui informasi jadwal kunjungan."}
            size="xl"
        >
            <form onSubmit={form.handleSubmit} className="flex flex-col h-full space-y-5 py-4">

                {/* 1. Info Pasien (Read Only) */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Pasien</p>
                        <h4 className="font-bold text-gray-900 text-lg">{activePatient?.nama_lengkap || '-'}</h4>
                        <div className="flex gap-3 text-sm text-gray-600 mt-1">
                            <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-xs font-mono">
                                RM: {activePatient?.nomor_rekam_medis || '-'}
                            </span>
                            <span>NIK: {activePatient?.nik || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Pilih Dokter & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                        id="doctor_id"
                        label="Dokter Pemeriksa"
                        placeholder="-- Pilih Dokter --"
                        options={doctorOptions}
                        value={form.values.doctor_id}
                        onChange={(val) => form.setFieldValue('doctor_id', val)}
                        error={form.errors.doctor_id}
                        disabled={isDoctorInputDisabled}
                        required
                    />

                    {isEdit && (
                        <FormSelect
                            id="status"
                            label="Status Kunjungan"
                            options={statusOptions}
                            value={form.values.status}
                            onChange={(val) => form.setFieldValue('status', val)}
                            disabled={isLoading}
                        />
                    )}
                </div>

                {/* Info Text jika auto-locked ke dokter sendiri (Hanya saat Create) */}
                {isDoctorInputDisabled && (
                    <div className="bg-green-50 p-3 rounded-lg flex items-center gap-2 text-sm text-green-700 border border-green-100">
                        <UserCheck className="w-4 h-4" />
                        <span>Pasien akan dijadwalkan untuk Anda: <strong>{currentUser?.nama_lengkap}</strong></span>
                    </div>
                )}

                {/* 3. Waktu Kunjungan */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Clock className="w-4 h-4" /> Waktu Kunjungan
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="date"
                            id="tanggal_janji"
                            label="Tanggal"
                            value={form.values.tanggal_janji}
                            onChange={(e) => form.setFieldValue('tanggal_janji', e.target.value)}
                            error={form.errors.tanggal_janji}
                            disabled={isLoading}
                            min={!isEdit ? new Date().toISOString().split('T')[0] : undefined}
                            required
                        />
                        <div>
                            <Input
                                type="time"
                                id="jam_janji"
                                label="Jam"
                                value={form.values.jam_janji}
                                onChange={(e) => form.setFieldValue('jam_janji', e.target.value)}
                                error={form.errors.jam_janji}
                                disabled={isLoading}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: HH:MM</p>
                        </div>
                    </div>
                </div>

                {/* 4. Keluhan */}
                <Textarea
                    id="keluhan"
                    label="Keluhan Utama / Catatan"
                    placeholder="Contoh: Nyeri gigi geraham..."
                    value={form.values.keluhan}
                    onChange={(e) => form.setFieldValue('keluhan', e.target.value)}
                    rows={3}
                    disabled={isLoading}
                />

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isEdit ? 'Simpan Perubahan' : 'Buat Jadwal'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}