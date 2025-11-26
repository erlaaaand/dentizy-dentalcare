'use client';

import { useEffect } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { FormSelect } from '@/components/ui/forms/select';
import { useForm } from '@/core/hooks/forms/useForm';
import { useCreateTreatment, useUpdateTreatment } from '@/core/services/api/treatments.api';
import { useTreatmentCategories } from '@/core/services/api/treatment-categories.api';
import { useToast } from '@/core/hooks/ui/useToast';

interface TreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess: () => void;
}

export default function TreatmentModal({ isOpen, onClose, initialData, onSuccess }: TreatmentModalProps) {
    const toast = useToast();
    const { data: categories } = useGetTreatmentCategories();

    const createMutation = useCreateTreatment();
    const updateMutation = useUpdateTreatment();

    const isEdit = !!initialData;

    const form = useForm({
        initialValues: {
            kodePerawatan: '',
            namaPerawatan: '',
            categoryId: '',
            harga: 0,
            durasiEstimasi: 30,
            deskripsi: '',
        },
        onSubmit: async (values) => {
            try {
                const payload = {
                    kodePerawatan: values.kodePerawatan,
                    namaPerawatan: values.namaPerawatan,
                    categoryId: Number(values.categoryId),
                    harga: Number(values.harga),
                    durasiEstimasi: Number(values.durasiEstimasi),
                    deskripsi: values.deskripsi,
                };

                if (isEdit) {
                    await updateMutation.mutateAsync({
                        id: initialData.id,
                        data: payload
                    });
                    toast.showSuccess('Layanan diperbarui');
                } else {
                    await createMutation.mutateAsync({ data: payload });
                    toast.showSuccess('Layanan ditambahkan');
                }
                onSuccess();
                form.resetForm();
            } catch (error) {
                toast.showError(isEdit ? 'Gagal update layanan' : 'Gagal tambah layanan');
            }
        }
    });

    // Populate form when editing
    useEffect(() => {
        if (isOpen && initialData) {
            form.setFieldValue('kodePerawatan', initialData.kodePerawatan);
            form.setFieldValue('namaPerawatan', initialData.namaPerawatan);
            form.setFieldValue('categoryId', initialData.categoryId);
            form.setFieldValue('harga', initialData.harga);
            form.setFieldValue('durasiEstimasi', initialData.durasiEstimasi);
            form.setFieldValue('deskripsi', initialData.deskripsi || '');
        } else if (isOpen && !initialData) {
            form.resetForm();
        }
    }, [isOpen, initialData]);

    const categoryOptions = (categories?.data || []).map((c: any) => ({
        label: c.namaKategori,
        value: c.id
    }));

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Layanan" : "Tambah Layanan Baru"}
            description={isEdit ? "Perbarui detail layanan dan harga" : "Masukkan informasi tindakan medis baru"}
            size="lg"
        >
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Kode Layanan"
                        placeholder="Contoh: SC-001"
                        name="kodePerawatan"
                        value={form.values.kodePerawatan}
                        onChange={(e) => form.setFieldValue('kodePerawatan', e.target.value)}
                        required
                    />
                    <FormSelect
                        label="Kategori"
                        placeholder="Pilih Kategori"
                        options={categoryOptions}
                        value={form.values.categoryId}
                        onChange={(val) => form.setFieldValue('categoryId', val)}
                        required
                    />
                </div>

                <Input
                    label="Nama Layanan"
                    placeholder="Contoh: Scaling Gigi (Full Mouth)"
                    name="namaPerawatan"
                    value={form.values.namaPerawatan}
                    onChange={(e) => form.setFieldValue('namaPerawatan', e.target.value)}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Harga (Rp)"
                        type="number"
                        placeholder="0"
                        name="harga"
                        value={form.values.harga}
                        onChange={(e) => form.setFieldValue('harga', e.target.value)}
                        required
                    />
                    <Input
                        label="Estimasi Durasi (Menit)"
                        type="number"
                        placeholder="30"
                        name="durasiEstimasi"
                        value={form.values.durasiEstimasi}
                        onChange={(e) => form.setFieldValue('durasiEstimasi', e.target.value)}
                    />
                </div>

                <Textarea
                    label="Deskripsi / Catatan"
                    placeholder="Detail prosedur atau catatan tambahan..."
                    name="deskripsi"
                    value={form.values.deskripsi}
                    onChange={(e) => form.setFieldValue('deskripsi', e.target.value)}
                    rows={3}
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Batal
                </Button>
                <Button onClick={form.handleSubmit} isLoading={isLoading}>
                    {isEdit ? 'Update' : 'Simpan'}
                </Button>
            </div>
        </Modal>
    );
}