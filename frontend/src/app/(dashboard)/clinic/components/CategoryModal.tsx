'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { useForm } from '@/core/hooks/forms/useForm';
import { useCreateTreatmentCategory, useUpdateTreatmentCategory } from '@/core/services/api/treatment-categories.api';
import { useToast } from '@/core/hooks/ui/useToast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess: () => void;
}

const categorySchema = z.object({
    namaKategori: z.string().min(1, 'Nama kategori wajib diisi'),
    deskripsi: z.string().optional(),
});

// STATIC form config - tidak pernah berubah
const FORM_CONFIG = {
    initialValues: {
        namaKategori: '',
        deskripsi: '',
    },
    validationSchema: categorySchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async () => { }, // akan di-override di component
};

export default function CategoryModal({ isOpen, onClose, initialData, onSuccess }: CategoryModalProps) {
    const toast = useToast();
    const createMutation = useCreateTreatmentCategory();
    const updateMutation = useUpdateTreatmentCategory();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Gunakan ref untuk track initialization
    const isInitializedRef = useRef(false);

    // Submit handler yang stabil
    const handleFormSubmit = useCallback(async (values: any) => {
        try {
            const payload = {
                namaKategori: values.namaKategori.trim(),
                deskripsi: values.deskripsi?.trim() || ''
            };

            if (isEdit) {
                await updateMutation.mutateAsync({ id: initialData.id, data: payload });
                toast.showSuccess('✅ Kategori berhasil diperbarui');
            } else {
                await createMutation.mutateAsync({ data: payload });
                toast.showSuccess('✅ Kategori berhasil dibuat');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
            toast.showError(`❌ Gagal ${isEdit ? 'memperbarui' : 'membuat'} kategori: ${errorMessage}`);
        }
    }, [isEdit, initialData?.id, createMutation, updateMutation, toast, onSuccess, onClose]);

    // Override onSubmit di config
    const formConfigWithSubmit = { ...FORM_CONFIG, onSubmit: handleFormSubmit };
    const form = useForm(formConfigWithSubmit);

    // Populate form HANYA saat modal pertama kali dibuka atau initialData.id berubah
    useEffect(() => {
        if (isOpen && !isInitializedRef.current) {
            isInitializedRef.current = true;

            if (initialData) {
                // Set values secara batch menggunakan setValues manual
                const newValues = {
                    namaKategori: initialData.namaKategori || '',
                    deskripsi: initialData.deskripsi || '',
                };
                // Gunakan object spread untuk update values sekaligus
                Object.entries(newValues).forEach(([key, value]) => {
                    form.setFieldValue(key as any, value);
                });
            }
        }

        // Reset flag saat modal ditutup
        if (!isOpen) {
            isInitializedRef.current = false;
        }
    }, [isOpen, initialData?.id]);

    const handleClose = () => {
        if (!isLoading) {
            form.resetForm();
            isInitializedRef.current = false;
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            description={isEdit ? "Perbarui informasi kategori layanan" : "Buat kategori baru"}
            size="md"
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <form onSubmit={form.handleSubmit} className="flex flex-col h-full">
                <div className="space-y-4 py-4">
                    <Input
                        id="field-nama-kategori"
                        label="Nama Kategori"
                        placeholder="Contoh: Konservasi Gigi"
                        name="namaKategori"
                        value={form.values.namaKategori || ''}
                        onChange={(e) => form.setFieldValue('namaKategori', e.target.value)}
                        onBlur={() => form.setFieldTouched('namaKategori', true)}
                        error={form.touched.namaKategori ? form.errors.namaKategori : undefined}
                        disabled={isLoading}
                        required
                        autoFocus={isOpen}
                    />

                    <Textarea
                        id="field-deskripsi"
                        label="Deskripsi"
                        placeholder="Keterangan singkat..."
                        name="deskripsi"
                        value={form.values.deskripsi || ''}
                        onChange={(e) => form.setFieldValue('deskripsi', e.target.value)}
                        onBlur={() => form.setFieldTouched('deskripsi', true)}
                        error={form.touched.deskripsi ? form.errors.deskripsi : undefined}
                        disabled={isLoading}
                        rows={3}
                        maxLength={500}
                        showCharCount
                        resize="vertical"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
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
                        disabled={isLoading || !form.isValid}
                        className="min-w-[100px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isEdit ? 'Menyimpan...' : 'Membuat...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {isEdit ? 'Update' : 'Simpan'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}