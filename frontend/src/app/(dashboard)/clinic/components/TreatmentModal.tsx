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

    // Category options - memoized
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

    // Format harga
    const formatHarga = useCallback((value: string) => {
        if (!value) return '';
        const numValue = value.replace(/[^\d]/g, '');
        return numValue ? new Intl.NumberFormat('id-ID').format(Number(numValue)) : '';
    }, []);

    // Submit handler
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

    // Form config yang STABIL
    const formConfig = useMemo(() => ({
        initialValues: {
            namaPerawatan: '',
            categoryId: '',
            harga: '',
            durasiEstimasi: '30',
            deskripsi: '',
        },
        validationSchema: treatmentSchema,
        validateOnChange: false, // MATIKAN
        validateOnBlur: false,    // MATIKAN
        onSubmit: handleFormSubmit,
    }), [handleFormSubmit]);

    const form = useForm(formConfig);

    // Populate form saat modal dibuka
    useEffect(() => {
        if (!isOpen) {
            populatedIdRef.current = null;
            return;
        }

        const currentId = initialData?.id || 'new';
        if (populatedIdRef.current === currentId) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (initialData) {
                // Edit mode - populate data
                form.setFieldValue('namaPerawatan', initialData.namaPerawatan || '');
                form.setFieldValue('categoryId', initialData.categoryId?.toString() || '');
                form.setFieldValue('harga', initialData.harga?.toString() || '');
                form.setFieldValue('durasiEstimasi', initialData.durasiEstimasi?.toString() || '30');
                form.setFieldValue('deskripsi', initialData.deskripsi || '');

                // Clear touched state untuk edit mode
                form.setFieldTouched('namaPerawatan', false);
                form.setFieldTouched('categoryId', false);
                form.setFieldTouched('harga', false);
                form.setFieldTouched('durasiEstimasi', false);
                form.setFieldTouched('deskripsi', false);
                form.clearErrors();
            } else {
                // Create mode - reset
                form.resetForm();
            }

            populatedIdRef.current = currentId;
        }, 10);

        return () => clearTimeout(timeoutId);
    }, [isOpen, initialData?.id]);

    const handleClose = useCallback(() => {
        if (!isLoading) {
            form.resetForm();
            populatedIdRef.current = null;
            onClose();
        }
    }, [isLoading, form, onClose]);

    // Validation helpers
    const validateNamaPerawatan = useCallback((value: string) => {
        return value && value.trim().length >= 3;
    }, []);

    const validateCategoryId = useCallback((value: string) => {
        return value && value.length > 0;
    }, []);

    const validateHarga = useCallback((value: string) => {
        return value && value.length > 0;
    }, []);

    const validateDurasi = useCallback((value: string) => {
        return value && value.length > 0;
    }, []);

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
                            onChange={(e) => {
                                const newValue = e.target.value;
                                form.setFieldValue('namaPerawatan', newValue);

                                // Clear error saat sudah valid
                                if (form.touched.namaPerawatan && validateNamaPerawatan(newValue)) {
                                    form.setFieldTouched('namaPerawatan', false);
                                }
                            }}
                            onBlur={() => {
                                if (!validateNamaPerawatan(form.values.namaPerawatan)) {
                                    form.setFieldTouched('namaPerawatan', true);
                                }
                            }}
                            error={form.touched.namaPerawatan && !validateNamaPerawatan(form.values.namaPerawatan) ? 'Nama layanan minimal 3 karakter' : undefined}
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
                            onChange={(val) => {
                                form.setFieldValue('categoryId', val);

                                // Clear error saat sudah dipilih
                                if (form.touched.categoryId && val) {
                                    form.setFieldTouched('categoryId', false);
                                }
                            }}
                            error={form.touched.categoryId && !validateCategoryId(form.values.categoryId) ? 'Kategori wajib dipilih' : undefined}
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
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/[^\d]/g, '');
                                form.setFieldValue('harga', rawValue);

                                // Clear error saat sudah diisi
                                if (form.touched.harga && rawValue) {
                                    form.setFieldTouched('harga', false);
                                }
                            }}
                            onBlur={() => {
                                if (!validateHarga(form.values.harga)) {
                                    form.setFieldTouched('harga', true);
                                }
                            }}
                            error={form.touched.harga && !validateHarga(form.values.harga) ? 'Harga wajib diisi' : undefined}
                            disabled={isLoading}
                            required
                            leftIcon={<span className="text-gray-500 text-sm font-medium">Rp</span>}
                        />

                        <Input
                            id="field-durasi"
                            label="Estimasi Durasi"
                            type="number"
                            placeholder="30"
                            name="durasiEstimasi"
                            value={form.values.durasiEstimasi || ''}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                form.setFieldValue('durasiEstimasi', newValue);

                                // Clear error saat sudah diisi
                                if (form.touched.durasiEstimasi && newValue) {
                                    form.setFieldTouched('durasiEstimasi', false);
                                }
                            }}
                            onBlur={() => {
                                if (!validateDurasi(form.values.durasiEstimasi)) {
                                    form.setFieldTouched('durasiEstimasi', true);
                                }
                            }}
                            error={form.touched.durasiEstimasi && !validateDurasi(form.values.durasiEstimasi) ? 'Durasi wajib diisi' : undefined}
                            disabled={isLoading}
                            min="1"
                            rightIcon={<span className="text-gray-500 text-sm">Menit</span>}
                        />
                    </div>

                    <Textarea
                        id="field-deskripsi"
                        label="Deskripsi / Catatan (Opsional)"
                        placeholder="Detail prosedur atau catatan tambahan..."
                        name="deskripsi"
                        value={form.values.deskripsi || ''}
                        onChange={(e) => {
                            form.setFieldValue('deskripsi', e.target.value);
                        }}
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
                        disabled={
                            isLoading ||
                            !validateNamaPerawatan(form.values.namaPerawatan) ||
                            !validateCategoryId(form.values.categoryId)
                        }
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