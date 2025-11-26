'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { FormSelect } from '@/components/ui/forms/select';
import { useForm } from '@/core/hooks/forms/useForm';
import { useCreateTreatment, useUpdateTreatment } from '@/core/services/api/treatments.api';
import { useTreatmentCategories } from '@/core/services/api/treatment-categories.api';
import { useToast } from '@/core/hooks/ui/useToast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { SkeletonForm } from '@/components/ui/data-display/skeleton';
import { z } from 'zod';

interface TreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess: () => void;
}

const treatmentSchema = z.object({
    namaPerawatan: z.string().min(3, 'Nama layanan minimal 3 karakter'),
    categoryId: z.string().min(1, 'Kategori wajib dipilih'),
    harga: z.string().min(1, 'Harga wajib diisi'),
    durasiEstimasi: z.string().min(1, 'Durasi wajib diisi'),
    deskripsi: z.string().optional(),
});

export default function TreatmentModal({ isOpen, onClose, initialData, onSuccess }: TreatmentModalProps) {
    const toast = useToast();

    const { data: categoriesResponse, isLoading: loadingCategories } = useTreatmentCategories();
    const createMutation = useCreateTreatment();
    const updateMutation = useUpdateTreatment();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;
    const populatedIdRef = useRef<string | number | null>(null);
    const isPopulatingRef = useRef(false);

    // ✅ STABIL - Category options
    const categoryOptions = useMemo(() => {
        const list = Array.isArray(categoriesResponse)
            ? categoriesResponse
            : (categoriesResponse as any)?.data || [];

        return list
            .filter((c: any) => !c.deletedAt && c.isActive !== false)
            .map((c: any) => ({
                label: c.namaKategori,
                value: c.id.toString()
            }));
    }, [categoriesResponse]);

    // ✅ STABIL - Format harga (pure function)
    const formatHarga = useCallback((value: string) => {
        if (!value) return '';
        const numValue = value.replace(/[^\d]/g, '');
        return numValue ? new Intl.NumberFormat('id-ID').format(Number(numValue)) : '';
    }, []);

    // ✅ STABIL - Submit handler
    const handleFormSubmit = useCallback(async (values: any) => {
        try {
            const cleanHarga = values.harga.toString().replace(/[^\d]/g, '');

            const payload = {
                namaPerawatan: values.namaPerawatan.trim(),
                categoryId: Number(values.categoryId),
                harga: Number(cleanHarga),
                durasiEstimasi: Number(values.durasiEstimasi),
                deskripsi: values.deskripsi?.trim() || undefined,
            };

            if (isEdit && initialData?.id) {
                await updateMutation.mutateAsync({
                    id: initialData.id,
                    data: payload
                });
                toast.showSuccess('✅ Layanan berhasil diperbarui');
            } else {
                await createMutation.mutateAsync({ data: payload });
                toast.showSuccess('✅ Layanan berhasil ditambahkan');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
            toast.showError(isEdit ? `❌ Gagal update: ${errorMessage}` : `❌ Gagal simpan: ${errorMessage}`);
        }
    }, [isEdit, initialData?.id, createMutation, updateMutation, toast, onSuccess, onClose]);

    // ✅ STABIL - Form config
    const formConfig = useMemo(() => ({
        initialValues: {
            namaPerawatan: '',
            categoryId: '',
            harga: '',
            durasiEstimasi: '30',
            deskripsi: '',
        },
        validationSchema: treatmentSchema,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: handleFormSubmit,
    }), [handleFormSubmit]);

    const form = useForm(formConfig);

    // ✅ FIXED - Populate form HANYA sekali
    useEffect(() => {
        if (!isOpen) {
            populatedIdRef.current = null;
            isPopulatingRef.current = false;
            return;
        }

        const currentId = initialData?.id || 'new';
        if (populatedIdRef.current === currentId || isPopulatingRef.current) {
            return;
        }

        isPopulatingRef.current = true;

        const timeoutId = setTimeout(() => {
            if (initialData) {
                // Edit mode
                form.setFieldValue('namaPerawatan', initialData.namaPerawatan || '');
                form.setFieldValue('categoryId', initialData.categoryId?.toString() || '');
                form.setFieldValue('harga', initialData.harga?.toString() || '');
                form.setFieldValue('durasiEstimasi', initialData.durasiEstimasi?.toString() || '30');
                form.setFieldValue('deskripsi', initialData.deskripsi || '');
            } else {
                // Create mode
                form.resetForm();
            }

            populatedIdRef.current = currentId;
            isPopulatingRef.current = false;
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            isPopulatingRef.current = false;
        };
    }, [isOpen, initialData]); // ✅ HANYA depend on isOpen dan initialData object

    // ✅ STABIL - Handle close
    const handleClose = useCallback(() => {
        if (!isLoading) {
            form.resetForm();
            populatedIdRef.current = null;
            onClose();
        }
    }, [isLoading, form.resetForm, onClose]);

    // ✅ STABIL - Validation states (computed once)
    const isFormValid = useMemo(() => {
        return (
            form.values.namaPerawatan?.trim().length >= 3 &&
            form.values.categoryId?.length > 0 &&
            form.values.harga?.length > 0 &&
            form.values.durasiEstimasi?.length > 0
        );
    }, [
        form.values.namaPerawatan,
        form.values.categoryId,
        form.values.harga,
        form.values.durasiEstimasi
    ]);

    // ✅ STABIL - Change handlers
    const handleNamaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldValue('namaPerawatan', e.target.value);
    }, [form.setFieldValue]);

    const handleCategoryChange = useCallback((val: string) => {
        form.setFieldValue('categoryId', val);
    }, [form.setFieldValue]);

    const handleHargaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        form.setFieldValue('harga', rawValue);
    }, [form.setFieldValue]);

    const handleDurasiChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Hanya izinkan angka
        const value = e.target.value.replace(/[^\d]/g, '');
        form.setFieldValue('durasiEstimasi', value);
    }, [form.setFieldValue]);

    const handleDeskripsiChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        form.setFieldValue('deskripsi', e.target.value);
    }, [form.setFieldValue]);

    // Loading skeleton
    if (loadingCategories && isOpen) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title={isEdit ? "Edit Layanan" : "Tambah Layanan Baru"}
                size="lg"
            >
                <SkeletonForm fields={5} />
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? "Edit Layanan" : "Tambah Layanan Baru"}
            description={isEdit ? "Perbarui detail layanan dan harga." : "Masukkan informasi tindakan medis baru."}
            size="lg"
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <form onSubmit={form.handleSubmit} noValidate>
                <div className="space-y-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="field-nama-perawatan"
                            label="Nama Layanan"
                            placeholder="Contoh: Scaling Gigi"
                            name="namaPerawatan"
                            value={form.values.namaPerawatan || ''}
                            onChange={handleNamaChange}
                            disabled={isLoading}
                            required
                            autoFocus={!isEdit}
                        />

                        <FormSelect
                            id="field-category"
                            label="Kategori"
                            placeholder={loadingCategories ? "Memuat..." : "Pilih Kategori"}
                            options={categoryOptions}
                            value={form.values.categoryId || ''}
                            onChange={handleCategoryChange}
                            disabled={isLoading || loadingCategories}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="field-harga"
                            label="Harga"
                            placeholder="0"
                            name="harga"
                            value={formatHarga(form.values.harga)}
                            onChange={handleHargaChange}
                            disabled={isLoading}
                            required
                            leftIcon={<span className="text-gray-500 text-sm font-medium">Rp</span>}
                        />

                        <Input
                            id="field-durasi"
                            label="Estimasi Durasi"
                            type="text"
                            inputMode="numeric"
                            placeholder="30"
                            name="durasiEstimasi"
                            value={form.values.durasiEstimasi || ''}
                            onChange={handleDurasiChange}
                            disabled={isLoading}
                            rightIcon={<span className="text-gray-500 text-sm">Menit</span>}
                        />
                    </div>

                    <Textarea
                        id="field-deskripsi"
                        label="Deskripsi / Catatan (Opsional)"
                        placeholder="Detail prosedur atau catatan tambahan..."
                        name="deskripsi"
                        value={form.values.deskripsi || ''}
                        onChange={handleDeskripsiChange}
                        disabled={isLoading}
                        rows={3}
                        maxLength={1000}
                        showCharCount
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
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
                        disabled={isLoading || !isFormValid}
                        className="min-w-[140px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isEdit ? 'Menyimpan...' : 'Membuat...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {isEdit ? 'Simpan Perubahan' : 'Buat Layanan'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}