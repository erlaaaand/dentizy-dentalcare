'use client';

import { useEffect, useCallback, useMemo } from 'react';
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
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // 1. Memoize validation function
    const validateForm = useCallback((values: any) => {
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
    }, []);

    // 2. Memoize submit handler
    const handleFormSubmit = useCallback(async (values: any) => {
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
            onClose();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
            toast.showError(
                isEdit
                    ? `Gagal memperbarui kategori: ${errorMessage}`
                    : `Gagal membuat kategori: ${errorMessage}`
            );
        }
    }, [isEdit, initialData, createMutation, updateMutation, toast, onSuccess, onClose]);

    // 3. PERBAIKAN UTAMA: Memoize konfigurasi form
    // Ini mencegah 'initialValues' dibuat ulang sebagai object baru setiap kali render
    // yang menyebabkan form mereset diri sendiri dan hilang fokus.
    const formConfig = useMemo(() => ({
        initialValues: {
            namaKategori: '',
            deskripsi: '',
        },
        customValidate: validateForm,
        onSubmit: handleFormSubmit
    }), [validateForm, handleFormSubmit]);

    const form = useForm(formConfig);

    // Populate form data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.setFieldValue('namaKategori', initialData.namaKategori || '');
                form.setFieldValue('deskripsi', initialData.deskripsi || '');
            } else {
                form.resetForm();
            }
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData?.id]);

    // Memoize field handlers
    const handleNamaKategoriChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldValue('namaKategori', e.target.value);
    }, [form]);

    const handleDeskripsiChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        form.setFieldValue('deskripsi', e.target.value);
    }, [form]);

    const handleFormSubmitWrapper = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        form.handleSubmit();
    }, [form]);

    const handleCloseModal = useCallback(() => {
        form.resetForm();
        onClose();
    }, [form, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title={isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            description={isEdit ? "Perbarui informasi kategori layanan" : "Buat kategori baru untuk mengelompokkan layanan"}
        >
            <form onSubmit={handleFormSubmitWrapper}>
                <div className="space-y-4 py-4">
                    <Input
                        // PERBAIKAN: Tambahkan ID statis
                        id="field-nama-kategori"
                        label="Nama Kategori"
                        placeholder="Contoh: Konservasi Gigi"
                        name="namaKategori"
                        value={form.values.namaKategori}
                        onChange={handleNamaKategoriChange}
                        error={form.errors.namaKategori}
                        disabled={isLoading}
                        required
                    // PERBAIKAN: Hapus autoFocus agar tidak merebut fokus dari field lain
                    />
                    <Textarea
                        // PERBAIKAN: Tambahkan ID statis
                        id="field-deskripsi"
                        label="Deskripsi"
                        placeholder="Keterangan singkat tentang kategori ini..."
                        name="deskripsi"
                        value={form.values.deskripsi}
                        onChange={handleDeskripsiChange}
                        error={form.errors.deskripsi}
                        disabled={isLoading}
                        rows={3}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseModal}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || Object.keys(form.errors).length > 0}
                    >
                        {isEdit ? 'Update' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}