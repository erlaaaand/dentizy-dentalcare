'use client';

import { useEffect } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { useForm } from '@/core/hooks/forms/useForm';
import { useCreateTreatmentCategory, useUpdateTreatmentCategory } from '@/core/services/api/treatment-categories.api';
import { useToast } from '@/core/hooks/ui/useToast';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // Jika ada, berarti mode EDIT
    onSuccess: () => void;
}

export default function CategoryModal({ isOpen, onClose, initialData, onSuccess }: CategoryModalProps) {
    const toast = useToast();
    const createMutation = useCreateTreatmentCategory();
    const updateMutation = useUpdateTreatmentCategory();

    const isEdit = !!initialData;

    const form = useForm({
        initialValues: {
            namaKategori: '',
            deskripsi: '',
        },
        onSubmit: async (values) => {
            try {
                if (isEdit) {
                    await updateMutation.mutateAsync({
                        id: initialData.id,
                        data: { namaKategori: values.namaKategori, deskripsi: values.deskripsi }
                    });
                    toast.showSuccess('Kategori diperbarui');
                } else {
                    await createMutation.mutateAsync({
                        namaKategori: values.namaKategori,
                        deskripsi: values.deskripsi
                    });
                    toast.showSuccess('Kategori dibuat');
                }
                onSuccess();
                form.resetForm();
            } catch (error) {
                toast.showError(isEdit ? 'Gagal memperbarui kategori' : 'Gagal membuat kategori');
            }
        }
    });

    // Populate form saat mode Edit
    useEffect(() => {
        if (isOpen && initialData) {
            form.setFieldValue('namaKategori', initialData.namaKategori);
            form.setFieldValue('deskripsi', initialData.deskripsi || '');
        } else if (isOpen && !initialData) {
            form.resetForm();
        }
    }, [isOpen, initialData]);

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            description={isEdit ? "Perbarui informasi kategori" : "Buat kategori baru untuk layanan"}
        >
            <div className="space-y-4 py-4">
                <Input
                    label="Nama Kategori"
                    placeholder="Contoh: Konservasi Gigi"
                    name="namaKategori"
                    value={form.values.namaKategori}
                    onChange={(e) => form.setFieldValue('namaKategori', e.target.value)}
                    required
                />
                <Textarea
                    label="Deskripsi"
                    placeholder="Keterangan singkat..."
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