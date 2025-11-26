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
    initialData?: any;
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
        customValidate: (values) => {
            const errors: Record<string, string> = {};

            if (!values.namaKategori || values.namaKategori.trim() === '') {
                errors.namaKategori = 'Nama kategori wajib diisi';
            } else if (values.namaKategori.length < 3) {
                errors.namaKategori = 'Nama kategori minimal 3 karakter';
            } else if (values.namaKategori.length > 100) {
                errors.namaKategori = 'Nama kategori maksimal 100 karakter';
            }

            if (values.deskripsi && values.deskripsi.length > 500) {
                errors.deskripsi = 'Deskripsi maksimal 500 karakter';
            }

            return errors;
        },
        onSubmit: async (values) => {
            try {
                const payload = {
                    namaKategori: values.namaKategori.trim(),
                    deskripsi: values.deskripsi?.trim() || undefined
                };

                if (isEdit) {
                    await updateMutation.mutateAsync({
                        id: initialData.id,
                        data: payload
                    });
                    toast.showSuccess('Kategori berhasil diperbarui');
                } else {
                    await createMutation.mutateAsync({
                        data: payload
                    });
                    toast.showSuccess('Kategori berhasil dibuat');
                }
                onSuccess();
                handleClose();
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
                toast.showError(
                    isEdit
                        ? `Gagal memperbarui kategori: ${errorMessage}`
                        : `Gagal membuat kategori: ${errorMessage}`
                );
            }
        }
    });

    // Populate form saat mode Edit
    useEffect(() => {
        if (isOpen && initialData) {
            form.setFieldValue('namaKategori', initialData.namaKategori || '');
            form.setFieldValue('deskripsi', initialData.deskripsi || '');
            form.clearErrors();
        } else if (isOpen && !initialData) {
            form.resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    const handleClose = () => {
        form.resetForm();
        onClose();
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            description={isEdit ? "Perbarui informasi kategori layanan" : "Buat kategori baru untuk mengelompokkan layanan"}
        >
            <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
                <div className="space-y-4 py-4">
                    <Input
                        label="Nama Kategori"
                        placeholder="Contoh: Konservasi Gigi"
                        name="namaKategori"
                        value={form.values.namaKategori}
                        onChange={(e) => form.setFieldValue('namaKategori', e.target.value)}
                        error={form.errors.namaKategori}
                        disabled={isLoading}
                        required
                        autoFocus
                    />
                    <Textarea
                        label="Deskripsi"
                        placeholder="Keterangan singkat tentang kategori ini..."
                        name="deskripsi"
                        value={form.values.deskripsi}
                        onChange={(e) => form.setFieldValue('deskripsi', e.target.value)}
                        error={form.errors.deskripsi}
                        disabled={isLoading}
                        rows={3}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        // isLoading={isLoading}
                        disabled={isLoading || Object.keys(form.errors).length > 0}
                    >
                        {isEdit ? 'Update' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}