'use client';

import { useEffect, useState, useMemo } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/forms/text-area';
import { useForm } from '@/core/hooks/forms/useForm';
import { useToast } from '@/core/hooks/ui/useToast';
import { Loader2, Pill, Wallet, Save } from 'lucide-react';
import { z } from 'zod';

// Sesuaikan path import ini
import { useUpdateAppointment } from '@/core/services/api/appointment.api';
import TreatmentSelector from './TreatmentSelector';

interface MedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    onSuccess: () => void;
}

const soapSchema = z.object({
    subjektif: z.string().optional(),
    objektif: z.string().min(1, 'Hasil pemeriksaan fisik wajib diisi'),
    assessment: z.string().min(1, 'Diagnosa wajib diisi'),
    plan: z.string().optional(),
});

export default function MedicalRecordModal({
    isOpen,
    onClose,
    appointment,
    onSuccess
}: MedicalRecordModalProps) {
    const toast = useToast();
    const updateMutation = useUpdateAppointment();

    // State untuk Tindakan & Harga
    const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<number[]>([]);
    const [selectedTreatmentsDetails, setSelectedTreatmentsDetails] = useState<any[]>([]);

    const form = useForm({
        initialValues: {
            subjektif: '',
            objektif: '',
            assessment: '',
            plan: ''
        },
        validationSchema: soapSchema,
        onSubmit: async (values) => {
            if (!appointment) return;
            try {
                // Payload Update
                const payload = {
                    status: 'selesai',
                    medical_record: {
                        subjektif: values.subjektif,
                        objektif: values.objektif,
                        assessment: values.assessment,
                        plan: values.plan, // Catatan tambahan / Resep

                        // Kirim Array ID ke backend untuk disimpan di tabel pivot
                        treatment_ids: selectedTreatmentIds
                    }
                };

                await updateMutation.mutateAsync({
                    id: appointment.id,
                    data: payload as any
                });

                toast.showSuccess('Pemeriksaan selesai & Data tersimpan.');
                onSuccess();
                onClose();
            } catch (error: any) {
                toast.showError(error?.response?.data?.message || 'Gagal menyimpan rekam medis.');
            }
        }
    });

    // Reset Form saat Modal Dibuka
    useEffect(() => {
        if (isOpen && appointment) {
            form.setValues({
                subjektif: appointment.keluhan || '',
                objektif: '',
                assessment: '',
                plan: ''
            });
            setSelectedTreatmentIds([]);
            setSelectedTreatmentsDetails([]);
        }
    }, [isOpen, appointment]);

    // Kalkulasi Harga Real-time
    const totalPrice = useMemo(() => {
        return selectedTreatmentsDetails.reduce((sum, item) => {
            return sum + (Number(item.harga) || 0);
        }, 0);
    }, [selectedTreatmentsDetails]);

    const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Rekam Medis & Tindakan"
            description={`Pasien: ${appointment?.patient?.nama_lengkap} (${appointment?.patient?.nomor_rekam_medis})`}
            size="xl"
        >
            <form onSubmit={form.handleSubmit} className="flex flex-col h-full">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* --- KOLOM KIRI: SOAP --- */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Subjective (Keluhan)</label>
                            <Textarea
                                placeholder="Keluhan pasien..."
                                value={form.values.subjektif}
                                onChange={(e) => form.setFieldValue('subjektif', e.target.value)}
                                rows={2}
                                className="bg-gray-50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Objective (Periksa Fisik) <span className="text-red-500">*</span></label>
                            <Textarea
                                placeholder="Tensi, kondisi gigi, dll..."
                                value={form.values.objektif}
                                onChange={(e) => form.setFieldValue('objektif', e.target.value)}
                                error={form.errors.objektif}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Assessment (Diagnosa) <span className="text-red-500">*</span></label>
                            <Textarea
                                placeholder="Diagnosa dokter..."
                                value={form.values.assessment}
                                onChange={(e) => form.setFieldValue('assessment', e.target.value)}
                                error={form.errors.assessment}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* --- KOLOM KANAN: PLAN (Treatment & Harga) --- */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold border-b border-gray-200 pb-2">
                            <Pill className="w-5 h-5" />
                            <h3>Tindakan (Treatment)</h3>
                        </div>

                        {/* SELECTOR */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Pilih Tindakan</label>
                            <TreatmentSelector
                                selectedIds={selectedTreatmentIds}
                                onChange={(ids, items) => {
                                    setSelectedTreatmentIds(ids);
                                    // Simpan detail item untuk keperluan display harga
                                    // (Note: Logic ini valid jika user memilih dari search result yang aktif)
                                    // Jika user uncheck item yang tidak ada di search result, 
                                    // Anda mungkin perlu logic tambahan untuk keep item detailnya.
                                    setSelectedTreatmentsDetails(prev => {
                                        // Gabungkan prev items (yg masih terpilih) dengan items baru
                                        const keptItems = prev.filter(p => ids.includes(p.id));
                                        const newItems = items.filter(i => !keptItems.find(k => k.id === i.id));
                                        return [...keptItems, ...newItems];
                                    });
                                }}
                            />
                        </div>

                        {/* LIST ITEM TERPILIH */}
                        {selectedTreatmentsDetails.length > 0 && (
                            <div className="bg-white rounded border border-gray-200 p-2 max-h-40 overflow-y-auto space-y-1">
                                {selectedTreatmentsDetails.map((t, idx) => (
                                    <div key={idx} className="flex justify-between text-xs text-gray-600 border-b border-gray-100 last:border-0 pb-1">
                                        <span>{t.namaPerawatan}</span>
                                        <span className="font-mono">{formatRp(Number(t.harga))}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TOTAL HARGA */}
                        <div className="bg-indigo-600 text-white p-3 rounded-lg flex justify-between items-center shadow-sm mt-auto">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                <span className="text-sm font-medium">Total Estimasi</span>
                            </div>
                            <span className="text-lg font-bold">{formatRp(totalPrice)}</span>
                        </div>

                        {/* NOTE TAMBAHAN */}
                        <div className="space-y-1 mt-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Catatan / Resep Obat</label>
                            <Textarea
                                placeholder="Resep obat atau instruksi..."
                                value={form.values.plan}
                                onChange={(e) => form.setFieldValue('plan', e.target.value)}
                                rows={3}
                                className="bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                    <Button type="submit" disabled={updateMutation.isPending} className="bg-green-600 hover:bg-green-700 min-w-[150px]">
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Simpan & Selesai
                    </Button>
                </div>
            </form>
        </Modal>
    );
}