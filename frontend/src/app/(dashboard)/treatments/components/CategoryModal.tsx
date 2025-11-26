'use client';

import { useEffect, useCallback, useMemo } from 'react'; // Hapus useState, useRef yang tidak perlu
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

    // ✅ FIX 1: Tentukan Initial Values yang STABIL
    // Hanya berubah jika initialData berubah, TIDAK saat user mengetik
    const initialFormValues = useMemo(() => ({
        namaKategori: initialData?.namaKategori || '',
        deskripsi: initialData?.deskripsi || '',
    }), [initialData]);

    // ✅ FIX 2: Submit Handler yang stabil
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

    // ✅ FIX 3: Config Form Stabil
    // Hapus 'localValues' dari dependency array. 
    // Config ini tidak akan dibuat ulang saat user mengetik, jadi fokus AMAN.
    const formConfig = useMemo(() => ({
        initialValues: initialFormValues,
        validationSchema: categorySchema,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: handleFormSubmit,
    }), [initialFormValues, handleFormSubmit]);

    const form = useForm(formConfig);

    // ✅ FIX 4: Reset form hanya saat Modal dibuka/ditutup atau data berubah
    useEffect(() => {
        if (isOpen) {
            // Reset form ke initialValues yang baru
            form.setValues(initialFormValues);
        } else {
            form.resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialFormValues]); // Dependency minimal agar tidak loop

    // Helper validation (opsional, bisa ambil dari form.errors jika ada)
    const isNamaValid = form.values.namaKategori && form.values.namaKategori.trim().length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
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
                        // ✅ FIX 5: Gunakan values dan handler langsung dari form
                        value={form.values.namaKategori}
                        onChange={(e) => form.setFieldValue('namaKategori', e.target.value)}
                        disabled={isLoading}
                        required
                        autoFocus={isOpen && !isEdit}
                    />

                    <Textarea
                        id="field-deskripsi"
                        label="Deskripsi"
                        placeholder="Keterangan singkat..."
                        name="deskripsi"
                        // ✅ FIX 5: Gunakan values dan handler langsung dari form
                        value={form.values.deskripsi}
                        onChange={(e) => form.setFieldValue('deskripsi', e.target.value)}
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
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !isNamaValid}
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