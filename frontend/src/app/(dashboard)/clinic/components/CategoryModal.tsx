'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
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

export default function CategoryModal({ isOpen, onClose, initialData, onSuccess }: CategoryModalProps) {
    const toast = useToast();
    const createMutation = useCreateTreatmentCategory();
    const updateMutation = useUpdateTreatmentCategory();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Track populated ID untuk mencegah re-populate
    const populatedIdRef = useRef<string | number | null>(null);

    // ✅ Submit handler dengan async/await
    const handleFormSubmit = useCallback(async (values: any) => {
        try {
            const payload = {
                namaKategori: values.namaKategori.trim(),
                deskripsi: values.deskripsi?.trim() || ''
            };

            if (isEdit && initialData?.id) {
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

    // ✅ Form config yang STABIL - MATIKAN VALIDASI OTOMATIS
    const formConfig = useMemo(() => ({
        initialValues: {
            namaKategori: '',
            deskripsi: '',
        },
        validationSchema: categorySchema,
        validateOnChange: false, // PENTING: Matikan
        validateOnBlur: false,    // PENTING: Matikan
        onSubmit: handleFormSubmit,
    }), [handleFormSubmit]);

    const form = useForm(formConfig);

    // ✅ Populate form saat modal dibuka atau data berubah
    useEffect(() => {
        if (!isOpen) {
            // Reset saat modal ditutup
            populatedIdRef.current = null;
            return;
        }

        // Cek apakah data ini sudah pernah di-populate
        const currentId = initialData?.id || 'new';
        if (populatedIdRef.current === currentId) {
            return; // Skip jika sudah populated
        }

        // Tunggu next tick untuk memastikan modal sudah render
        const timeoutId = setTimeout(() => {
            if (initialData) {
                // Edit mode - populate dengan data
                form.setFieldValue('namaKategori', initialData.namaKategori || '');
                form.setFieldValue('deskripsi', initialData.deskripsi || '');

                // Clear semua touched dan errors untuk edit mode
                form.setFieldTouched('namaKategori', false);
                form.setFieldTouched('deskripsi', false);
                form.clearErrors();
            } else {
                // Create mode - reset form
                form.resetForm();
            }

            // Tandai bahwa data ini sudah di-populate
            populatedIdRef.current = currentId;
        }, 10); // 10ms delay untuk stabilitas

        return () => clearTimeout(timeoutId);
    }, [isOpen, initialData?.id, initialData?.namaKategori, initialData?.deskripsi]);

    const handleClose = useCallback(() => {
        if (!isLoading) {
            form.resetForm();
            populatedIdRef.current = null;
            onClose();
        }
    }, [isLoading, form, onClose]);

    // ✅ Manual validation saat user selesai mengetik
    const validateNamaKategori = useCallback((value: string) => {
        return value && value.trim().length > 0;
    }, []);

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
                        onChange={(e) => {
                            const newValue = e.target.value;
                            form.setFieldValue('namaKategori', newValue);

                            // Clear error saat user mengetik dan sudah valid
                            if (form.touched.namaKategori && validateNamaKategori(newValue)) {
                                form.setFieldTouched('namaKategori', false);
                            }
                        }}
                        onBlur={() => {
                            // Set touched hanya jika field kosong
                            const isEmpty = !form.values.namaKategori || form.values.namaKategori.trim().length === 0;
                            if (isEmpty) {
                                form.setFieldTouched('namaKategori', true);
                            }
                        }}
                        error={form.touched.namaKategori && !validateNamaKategori(form.values.namaKategori) ? 'Nama kategori wajib diisi' : undefined}
                        disabled={isLoading}
                        required
                        autoFocus={isOpen && !isEdit}
                    />

                    <Textarea
                        id="field-deskripsi"
                        label="Deskripsi"
                        placeholder="Keterangan singkat..."
                        name="deskripsi"
                        value={form.values.deskripsi || ''}
                        onChange={(e) => {
                            form.setFieldValue('deskripsi', e.target.value);
                        }}
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
                        disabled={isLoading || !validateNamaKategori(form.values.namaKategori)}
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