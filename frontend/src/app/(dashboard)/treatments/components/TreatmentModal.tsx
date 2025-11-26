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
import { Loader2, CheckCircle2 } from 'lucide-react';
import { SkeletonForm } from '@/components/ui/data-display/skeleton';
import { z } from 'zod';

// ----------------------------------------------------------------------
// 1. Definisikan Tipe Data
// ----------------------------------------------------------------------

interface TreatmentData {
    id?: number | string;
    namaPerawatan: string;
    categoryId: number | string;
    harga: string | number;
    durasiEstimasi: string | number;
    deskripsi?: string;
    [key: string]: any;
}

// Interface State Form (Deskripsi optional agar sesuai Zod)
interface TreatmentFormValues {
    namaPerawatan: string;
    categoryId: string;
    harga: string;
    durasiEstimasi: string;
    deskripsi?: string;
}

interface TreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: TreatmentData | null;
    onSuccess: () => void;
}

// Skema Zod
const treatmentSchema = z.object({
    namaPerawatan: z.string().min(3, 'Nama layanan minimal 3 karakter'),
    categoryId: z.string().min(1, 'Kategori wajib dipilih'),
    harga: z.string().min(1, 'Harga wajib diisi'),
    durasiEstimasi: z.string().min(1, 'Durasi wajib diisi'),
    deskripsi: z.string().optional(),
});

// Helper: Parsing aman "15000.00" -> "15000"
const parseBackendPrice = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined || val === '') return '';
    const num = parseFloat(String(val));
    if (isNaN(num)) return '';
    return String(Math.floor(num));
};

const formatToRupiah = (value: string | number) => {
    if (!value) return "";
    const clean = String(value).replace(/[^\d]/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID").format(Number(clean));
};

// ----------------------------------------------------------------------
// 2. Component Utama
// ----------------------------------------------------------------------

export default function TreatmentModal({ isOpen, onClose, initialData, onSuccess }: TreatmentModalProps) {
    const toast = useToast();

    const { data: categoriesResponse, isLoading: loadingCategories } = useTreatmentCategories();
    const createMutation = useCreateTreatment();
    const updateMutation = useUpdateTreatment();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const categoryOptions = useMemo(() => {
        const list = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse as any)?.data || [];
        return list
            .filter((c: any) => !c.deletedAt && c.isActive !== false)
            .map((c: any) => ({ label: c.namaKategori, value: c.id.toString() }));
    }, [categoriesResponse]);

    // ------------------------------------------------------------------
    // 3. Konfigurasi Form
    // ------------------------------------------------------------------

    const form = useForm<TreatmentFormValues>({
        initialValues: {
            namaPerawatan: '',
            categoryId: '',
            harga: '',
            durasiEstimasi: '30',
            deskripsi: '',
        },
        validationSchema: treatmentSchema,
        validateOnChange: false,
        // Logika Submit pindah ke sini agar sesuai Type FormConfig
        onSubmit: async (values) => {
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
                        id: Number(initialData.id),
                        data: payload
                    });
                    toast.showSuccess('✅ Layanan diperbarui');
                } else {
                    await createMutation.mutateAsync({ data: payload });
                    toast.showSuccess('✅ Layanan ditambahkan');
                }
                onSuccess();
                onClose();
            } catch (error: any) {
                const msg = error?.response?.data?.message || error?.message || 'Gagal menyimpan';
                toast.showError(`❌ Error: ${msg}`);
            }
        },
    });

    // ------------------------------------------------------------------
    // 4. Logic Reset & Populate
    // ------------------------------------------------------------------

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Mode Edit: Isi form dengan parsing harga yang benar
                form.setValues({
                    namaPerawatan: initialData.namaPerawatan || '',
                    categoryId: initialData.categoryId?.toString() || '',
                    harga: parseBackendPrice(initialData.harga), // "15000.00" -> "15000"
                    durasiEstimasi: initialData.durasiEstimasi?.toString() || '30',
                    deskripsi: initialData.deskripsi || '',
                });
            } else {
                // Mode Create: Bersihkan form
                form.resetForm();
            }
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    // ------------------------------------------------------------------
    // 5. Render UI
    // ------------------------------------------------------------------

    if (loadingCategories && isOpen && categoryOptions.length === 0) {
        return <Modal isOpen={isOpen} onClose={onClose} title="Memuat..." size="lg"><SkeletonForm fields={4} /></Modal>;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Layanan" : "Tambah Layanan Baru"}
            description={isEdit ? "Perbarui informasi layanan klinik." : "Masukkan data layanan baru."}
            size="lg"
        >
            <form onSubmit={form.handleSubmit} className="flex flex-col h-full">
                <div className="space-y-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="namaPerawatan"
                            label="Nama Layanan"
                            placeholder="Contoh: Scaling Gigi"
                            value={form.values.namaPerawatan}
                            onChange={(e) => form.setFieldValue('namaPerawatan', e.target.value)}
                            error={form.errors.namaPerawatan}
                            disabled={isLoading}
                            required
                        />

                        <FormSelect
                            id="categoryId"
                            label="Kategori"
                            placeholder="Pilih Kategori"
                            options={categoryOptions}
                            value={form.values.categoryId}
                            onChange={(val) => form.setFieldValue('categoryId', val)}
                            error={form.errors.categoryId}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="harga"
                            label="Harga"
                            placeholder="0"
                            value={formatToRupiah(form.values.harga)}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, "");
                                form.setFieldValue("harga", raw);
                            }}
                            error={form.errors.harga}
                            leftIcon={<span className="text-gray-500 text-sm font-medium">Rp</span>}
                            disabled={isLoading}
                            required
                        />

                        <Input
                            id="durasiEstimasi"
                            label="Estimasi Durasi"
                            placeholder="30"
                            value={form.values.durasiEstimasi}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, '');
                                form.setFieldValue('durasiEstimasi', raw);
                            }}
                            error={form.errors.durasiEstimasi}
                            rightIcon={<span className="text-gray-500 text-sm">Menit</span>}
                            disabled={isLoading}
                        />
                    </div>

                    <Textarea
                        id="deskripsi"
                        label="Deskripsi (Opsional)"
                        // Handle potential undefined dengan fallback string kosong
                        value={form.values.deskripsi || ''}
                        onChange={(e) => form.setFieldValue('deskripsi', e.target.value)}
                        error={form.errors.deskripsi}
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        {isEdit ? 'Simpan Perubahan' : 'Buat Layanan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}