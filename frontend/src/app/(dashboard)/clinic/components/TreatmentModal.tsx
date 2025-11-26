'use client';

import { useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { FormSelect } from '@/components/ui/forms/select';
import { useForm } from '@/core/hooks/forms/useForm';
import { useCreateTreatment, useUpdateTreatment } from '@/core/services/api/treatments.api';
import { useTreatmentCategories } from '@/core/services/api/treatment-categories.api';
import { useToast } from '@/core/hooks/ui/useToast';
import { formatCurrency } from '@/core/utils/date/format.utils';

interface TreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess: () => void;
}

export default function TreatmentModal({ isOpen, onClose, initialData, onSuccess }: TreatmentModalProps) {
    const toast = useToast();
    
    // 1. API Hooks
    const { data: categoriesResponse, isLoading: loadingCategories } = useTreatmentCategories();
    const createMutation = useCreateTreatment();
    const updateMutation = useUpdateTreatment();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // 2. Form Setup
    const form = useForm({
        initialValues: {
            namaPerawatan: '',
            categoryId: '',
            harga: '',
            durasiEstimasi: '30',
            deskripsi: '',
        },
        customValidate: (values) => {
            const errors: Record<string, string> = {};

            // Validasi Nama
            if (!values.namaPerawatan?.trim()) {
                errors.namaPerawatan = 'Nama layanan wajib diisi';
            } else if (values.namaPerawatan.length < 3) {
                errors.namaPerawatan = 'Nama layanan minimal 3 karakter';
            }

            // Validasi Kategori
            if (!values.categoryId) {
                errors.categoryId = 'Kategori wajib dipilih';
            }

            // Validasi Harga (Hapus format rupiah sebelum cek)
            const cleanHarga = values.harga ? String(values.harga).replace(/[^\d]/g, '') : '';
            const hargaNum = Number(cleanHarga);

            if (!cleanHarga) {
                errors.harga = 'Harga wajib diisi';
            } else if (isNaN(hargaNum) || hargaNum < 0) {
                errors.harga = 'Harga tidak valid';
            }

            // Validasi Durasi
            const durasi = Number(values.durasiEstimasi);
            if (!values.durasiEstimasi) {
                errors.durasiEstimasi = 'Durasi wajib diisi';
            } else if (isNaN(durasi) || durasi <= 0) {
                errors.durasiEstimasi = 'Durasi harus lebih dari 0 menit';
            }

            return errors;
        },
        onSubmit: async (values) => {
            try {
                // Bersihkan format rupiah menjadi angka murni
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
                handleClose();
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
                toast.showError(isEdit ? `Gagal update: ${errorMessage}` : `Gagal simpan: ${errorMessage}`);
            }
        }
    });

    // 3. Effect: Populate Form Data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Mode Edit: Isi form dengan data yang ada
                form.setFieldValue('namaPerawatan', initialData.namaPerawatan || '');
                form.setFieldValue('categoryId', initialData.categoryId?.toString() || '');
                form.setFieldValue('harga', initialData.harga?.toString() || '');
                form.setFieldValue('durasiEstimasi', initialData.durasiEstimasi?.toString() || '30');
                form.setFieldValue('deskripsi', initialData.deskripsi || '');
            } else {
                // Mode Create: Reset form ke nilai awal
                form.resetForm();
            }
            // Bersihkan error sisa sebelumnya
            form.clearErrors;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]); // Dependency minimal untuk mencegah re-render loop

    // 4. Data Processing: Kategori Options
    const categoryOptions = useMemo(() => {
        // Handle struktur response yang mungkin berbeda (Array vs Object.data)
        const list = Array.isArray(categoriesResponse) 
            ? categoriesResponse 
            : (categoriesResponse as any)?.data || [];

        return list
            .filter((c: any) => !c.deletedAt && c.isActive !== false) // Hanya tampilkan kategori aktif
            .map((c: any) => ({
                label: c.namaKategori,
                value: c.id.toString()
            }));
    }, [categoriesResponse]);

    // 5. Helper: Close Handler
    const handleClose = () => {
        form.resetForm();
        onClose();
    };

    // 6. Helper: Format Tampilan Harga (Rp)
    // Menggunakan utilitas formatCurrency dari core jika ada, atau fallback manual
    const getDisplayHarga = (value: string | number) => {
        if (!value) return '';
        const stringVal = String(value).replace(/[^\d]/g, '');
        if (!stringVal) return '';
        // Format manual ke IDR tanpa desimal 'Rp 10.000'
        return new Intl.NumberFormat('id-ID').format(Number(stringVal));
    };

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
            <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} noValidate>
                <div className="space-y-5 py-4">
                    {/* Baris 1: Nama & Kategori */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Layanan"
                            placeholder="Contoh: Scaling Gigi"
                            name="namaPerawatan"
                            value={form.values.namaPerawatan}
                            onChange={(e) => form.setFieldValue('namaPerawatan', e.target.value)}
                            onBlur={form.handleBlur('namaPerawatan')}
                            error={form.errors.namaPerawatan}
                            disabled={isLoading}
                            required
                            autoFocus={!isEdit} // Fokus otomatis hanya saat tambah baru
                        />
                        
                        <FormSelect
                            label="Kategori"
                            placeholder={loadingCategories ? "Memuat..." : "Pilih Kategori"}
                            options={categoryOptions}
                            value={form.values.categoryId}
                            onChange={(val) => form.setFieldValue('categoryId', val)}
                            error={form.errors.categoryId}
                            disabled={isLoading || loadingCategories}
                            required
                        />
                    </div>

                    {/* Baris 2: Harga & Durasi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Harga"
                                placeholder="0"
                                name="harga"
                                // Tampilkan format rupiah di UI, tapi state tetap simpan angka/string mentah
                                value={getDisplayHarga(form.values.harga)}
                                onChange={(e) => {
                                    // Hanya ambil angka untuk disimpan ke state
                                    const rawValue = e.target.value.replace(/[^\d]/g, '');
                                    form.setFieldValue('harga', rawValue);
                                }}
                                onBlur={form.handleBlur('harga')}
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
                                onChange={(e) => form.setFieldValue('durasiEstimasi', e.target.value)}
                                onBlur={form.handleBlur('durasiEstimasi')}
                                error={form.errors.durasiEstimasi}
                                disabled={isLoading}
                                min="1"
                                rightIcon={<span className="text-gray-500 text-sm">Menit</span>}
                            />
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <Textarea
                        label="Deskripsi / Catatan (Opsional)"
                        placeholder="Detail prosedur atau catatan tambahan..."
                        name="deskripsi"
                        value={form.values.deskripsi}
                        onChange={(e) => form.setFieldValue('deskripsi', e.target.value)}
                        disabled={isLoading}
                        rows={3}
                    />
                </div>

                {/* Footer Actions */}
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
                        disabled={isLoading || !form.isValid}
                        // isLoading={isLoading}
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Buat Layanan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}