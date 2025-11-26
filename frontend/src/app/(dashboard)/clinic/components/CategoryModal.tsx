'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
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

// Validation schema
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

    // STATE UNTUK TRACK INITIALIZATION
    const [isInitialized, setIsInitialized] = useState(false);

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
    }, [isEdit, initialData, createMutation, updateMutation, toast, onSuccess, onClose]);

    // FORM CONFIG - INITIAL VALUES KOSONG SAJA
    const formConfig = useMemo(() => ({
        initialValues: {
            namaKategori: '',
            deskripsi: '',
        },
        validationSchema: categorySchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: handleFormSubmit,
    }), [handleFormSubmit]); // HANYA depend pada handleFormSubmit

    const form = useForm(formConfig);

    // EFFECT UNTUK RESET & INITIALIZE FORM - FIXED LOGIC
    useEffect(() => {
        if (isOpen) {
            console.log('Modal opened, initialData:', initialData);

            // RESET FORM KE STATE AWAL
            form.resetForm();

            // SET VALUES SETELAH RESET (gunakan setTimeout untuk pastikan reset selesai)
            const timer = setTimeout(() => {
                if (initialData) {
                    // EDIT MODE - set values dari initialData
                    form.setFieldValue('namaKategori', initialData.namaKategori || '');
                    form.setFieldValue('deskripsi', initialData.deskripsi || '');
                }
                // CREATE MODE - biarkan values tetap kosong

                setIsInitialized(true);
            }, 0);

            return () => clearTimeout(timer);
        } else {
            // MODAL DITUTUP - reset state
            setIsInitialized(false);
        }
    }, [isOpen, initialData?.id]); // HANYA depend pada isOpen dan initialData.id

    const handleCloseModal = useCallback(() => {
        if (!isLoading) {
            form.resetForm();
            setIsInitialized(false);
            onClose();
        }
    }, [form, onClose, isLoading]);

    // SIMPLE HANDLERS - TANPA USE_CALLBACK UNNECESSARY
    const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldValue('namaKategori', e.target.value);
    };

    const handleDeskripsiChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        form.setFieldValue('deskripsi', e.target.value);
    };

    const handleNamaBlur = () => {
        form.setFieldTouched('namaKategori', true);
    };

    const handleDeskripsiBlur = () => {
        form.setFieldTouched('deskripsi', true);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
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
                        onChange={handleNamaChange}
                        onBlur={handleNamaBlur}
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
                        onChange={handleDeskripsiChange}
                        onBlur={handleDeskripsiBlur}
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
                        onClick={handleCloseModal}
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