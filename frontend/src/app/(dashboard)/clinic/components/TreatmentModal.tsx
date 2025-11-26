'use client';

import { useEffect, useCallback, useMemo } from 'react';
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

    const { data: categoriesResponse, isLoading: loadingCategories } = useTreatmentCategories();
    const createMutation = useCreateTreatment();
    const updateMutation = useUpdateTreatment();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Memoize kategori options
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

    // Memoize validation function
    const validateForm = useCallback((values: any) => {
        const errors: Record<string, string> = {};

        if (!values.namaPerawatan?.trim()) {
            errors.namaPerawatan = 'Nama layanan wajib diisi';
        } else if (values.namaPerawatan.length < 3) {
            errors.namaPerawatan = 'Nama layanan minimal 3 karakter';
        }

        if (!values.categoryId) {
            errors.categoryId = 'Kategori wajib dipilih';
        }

        const cleanHarga = values.harga ? String(values.harga).replace(/[^\d]/g, '') : '';
        const hargaNum = Number(cleanHarga);

        if (!cleanHarga) {
            errors.harga = 'Harga wajib diisi';
        } else if (isNaN(hargaNum) || hargaNum < 0) {
            errors.harga = 'Harga tidak valid';
        }

        const durasi = Number(values.durasiEstimasi);
        if (!values.durasiEstimasi) {
            errors.durasiEstimasi = 'Durasi wajib diisi';
        } else if (isNaN(durasi) || durasi <= 0) {
            errors.durasiEstimasi = 'Durasi harus lebih dari 0 menit';
        }

        return errors;
    }, []);

    // Memoize submit handler
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

            if (isEdit) {
                await updateMutation.mutateAsync({
                    id: initialData.id,
                    data: payload
                });
                toast.showSuccess('Layanan berhasil diperbarui');
            } else {
                await createMutation.mutateAsync({ data: payload });
                toast.showSuccess('Layanan berhasil ditambahkan');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
            toast.showError(isEdit ? `Gagal update: ${errorMessage}` : `Gagal simpan: ${errorMessage}`);
        }
    }, [isEdit, initialData, createMutation, updateMutation, toast, onSuccess, onClose]);

    // Initialize form
    const form = useForm({
        initialValues: {
            namaPerawatan: '',
            categoryId: '',
            harga: '',
            durasiEstimasi: '30',
            deskripsi: '',
        },
        customValidate: validateForm,
        onSubmit: handleFormSubmit
    });

    // Populate form only when needed
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.setFieldValue('namaPerawatan', initialData.namaPerawatan || '');
                form.setFieldValue('categoryId', initialData.categoryId?.toString() || '');
                form.setFieldValue('harga', initialData.harga?.toString() || '');
                form.setFieldValue('durasiEstimasi', initialData.durasiEstimasi?.toString() || '30');
                form.setFieldValue('deskripsi', initialData.deskripsi || '');
            } else {
                form.resetForm();
            }
            form.clearErrors();
        }
    }, [isOpen, initialData?.id]);

    // Memoize format display harga
    const getDisplayHarga = useCallback((value: string | number) => {
        if (!value) return '';
        const stringVal = String(value).replace(/[^\d]/g, '');
        if (!stringVal) return '';
        return new Intl.NumberFormat('id-ID').format(Number(stringVal));
    }, []);

    // Memoize all change handlers
    const handleNamaPerawatanChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldValue('namaPerawatan', e.target.value);
    }, [form]);

    const handleCategoryChange = useCallback((val: string) => {
        form.setFieldValue('categoryId', val);
    }, [form]);

    const handleHargaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        form.setFieldValue('harga', rawValue);
    }, [form]);

    const handleDurasiChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        form.setFieldValue('durasiEstimasi', e.target.value);
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

    const handleNamaPerawatanBlur = useCallback(() => {
        form.handleBlur('namaPerawatan')();
    }, [form]);

    const handleHargaBlur = useCallback(() => {
        form.handleBlur('harga')();
    }, [form]);

    const handleDurasiBlur = useCallback(() => {
        form.handleBlur('durasiEstimasi')();
    }, [form]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title={isEdit ? "Edit Layanan" : "Tambah Layanan Baru"}
            description={isEdit ? "Perbarui detail layanan dan harga." : "Masukkan informasi tindakan medis baru."}
            size="lg"
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <form onSubmit={handleFormSubmitWrapper} noValidate>
                <div className="space-y-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Layanan"
                            placeholder="Contoh: Scaling Gigi"
                            name="namaPerawatan"
                            value={form.values.namaPerawatan}
                            onChange={handleNamaPerawatanChange}
                            onBlur={handleNamaPerawatanBlur}
                            error={form.errors.namaPerawatan}
                            disabled={isLoading}
                            required
                            autoFocus={!isEdit}
                        />

                        <FormSelect
                            label="Kategori"
                            placeholder={loadingCategories ? "Memuat..." : "Pilih Kategori"}
                            options={categoryOptions}
                            value={form.values.categoryId}
                            onChange={handleCategoryChange}
                            error={form.errors.categoryId}
                            disabled={isLoading || loadingCategories}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Harga"
                                placeholder="0"
                                name="harga"
                                value={getDisplayHarga(form.values.harga)}
                                onChange={handleHargaChange}
                                onBlur={handleHargaBlur}
                                error={form.errors.harga}
                                disabled={isLoading}
                                required
                                leftIcon={<span className="text-gray-500 text-sm font-medium">Rp</span>}
                            />
                        </div>

                        <div>
                            <Input
                                label="Estimasi Durasi"
                                type="number"
                                placeholder="30"
                                name="durasiEstimasi"
                                value={form.values.durasiEstimasi}
                                onChange={handleDurasiChange}
                                onBlur={handleDurasiBlur}
                                error={form.errors.durasiEstimasi}
                                disabled={isLoading}
                                min="1"
                                rightIcon={<span className="text-gray-500 text-sm">Menit</span>}
                            />
                        </div>
                    </div>

                    <Textarea
                        label="Deskripsi / Catatan (Opsional)"
                        placeholder="Detail prosedur atau catatan tambahan..."
                        name="deskripsi"
                        value={form.values.deskripsi}
                        onChange={handleDeskripsiChange}
                        disabled={isLoading}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
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
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Buat Layanan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}