'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Trash2, Edit } from 'lucide-react';

// UI Components
import { PageContainer } from '@/components/layout/PageContainer';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from '@/components/ui/navigation/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Badge } from '@/components/ui/data-display/badge';
import { Modal } from '@/components/ui/feedback/modal';
import { Input } from '@/components/ui/forms/input';
import { FormSelect } from '@/components/ui/forms/select';
import { default as SearchInput } from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';

// Core Hooks & Services
import { useAuth } from '@/core/hooks/auth/useAuth';
import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import { useForm } from '@/core/hooks/forms/useForm';
import {
    getTreatments,
    useCreateTreatment,
    useDeleteTreatment,
    useUpdateTreatment
} from '@/core/services/api/treatments.api';
import {
    getTreatmentCategories,
    useCreateTreatmentCategory,
    useDeleteTreatmentCategory
} from '@/core/services/api/treatment-categories.api';
import { formatCurrency } from '@/core';
import { ROLES } from '@/core/constants/role.constants';

// ----------------------------------------------------------------------
// COMPONENT UTAMA
// ----------------------------------------------------------------------

export default function ClinicSettingsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();

    // State for Tabs
    const [activeTab, setActiveTab] = useState('treatments');

    // --- Treatments Logic ---
    const { data: treatments, isLoading: isLoadingTreatments } = getTreatments();
    const createTreatment = useCreateTreatment();
    const deleteTreatment = useDeleteTreatment();
    const updateTreatment = useUpdateTreatment();

    // --- Categories Logic ---
    const { data: categories, isLoading: isLoadingCategories } = getTreatmentCategories();
    const createCategory = useCreateTreatmentCategory();
    const deleteCategory = useDeleteTreatmentCategory();

    // --- Modals State ---
    const treatmentModal = useModal();
    const categoryModal = useModal();
    const confirmDelete = useModal();

    // --- Forms ---
    const treatmentForm = useForm({
        initialValues: {
            name: '',
            description: '',
            price: 0,
            categoryId: '',
        },
        onSubmit: async (values) => {
            try {
                await createTreatment.mutateAsync({
                    name: values.name,
                    description: values.description,
                    price: Number(values.price),
                    categoryId: values.categoryId
                });
                toast.success('Tindakan berhasil ditambahkan');
                treatmentModal.close();
                treatmentForm.reset();
                queryClient.invalidateQueries({ queryKey: ['treatments'] });
            } catch (error) {
                toast.error('Gagal menambahkan tindakan');
            }
        }
    });

    const categoryForm = useForm({
        initialValues: { name: '', description: '' },
        onSubmit: async (values) => {
            try {
                await createCategory.mutateAsync(values);
                toast.success('Kategori berhasil dibuat');
                categoryModal.close();
                categoryForm.reset();
                queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
            } catch (error) {
                toast.error('Gagal membuat kategori');
            }
        }
    });

    // --- Delete Handlers ---
    const handleDeleteTreatment = async (id: string) => {
        try {
            await deleteTreatment.mutateAsync(id);
            toast.success('Tindakan dihapus');
            queryClient.invalidateQueries({ queryKey: ['treatments'] });
        } catch (e) { toast.error('Gagal menghapus'); }
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            await deleteCategory.mutateAsync(id);
            toast.success('Kategori dihapus');
            queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
        } catch (e) { toast.error('Gagal menghapus'); }
    };

    // --- Table Columns ---
    const treatmentColumns = [
        { header: 'Nama Tindakan', accessorKey: 'name', cell: (info: any) => <span className="font-medium">{info.getValue()}</span> },
        { header: 'Kategori', accessorKey: 'category.name', cell: (info: any) => <Badge variant="outline">{info.getValue() || '-'}</Badge> },
        { header: 'Harga', accessorKey: 'price', cell: (info: any) => formatCurrency(info.getValue()) },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTreatment(info.row.original.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            )
        }
    ];

    const categoryColumns = [
        { header: 'Nama Kategori', accessorKey: 'name', cell: (info: any) => <span className="font-medium">{info.getValue()}</span> },
        { header: 'Deskripsi', accessorKey: 'description', cell: (info: any) => <span className="text-gray-500 text-sm truncate max-w-xs">{info.getValue()}</span> },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => (
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(info.row.original.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            )
        }
    ];

    if (user?.role !== ROLES.KEPALA_KLINIK) {
        return <PageContainer title="Akses Ditolak"><div className="p-4 text-red-500">Anda tidak memiliki akses ke halaman ini.</div></PageContainer>;
    }

    return (
        <PageContainer
            title="Manajemen Layanan Klinik"
            subtitle="Atur daftar tindakan medis, harga, dan kategori layanan."
            actions={
                <Button onClick={() => activeTab === 'treatments' ? treatmentModal.open() : categoryModal.open()}>
                    <Plus className="w-4 h-4 mr-2" />
                    {activeTab === 'treatments' ? 'Tambah Tindakan' : 'Tambah Kategori'}
                </Button>
            }
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="treatments">Daftar Tindakan & Harga</TabsTrigger>
                    <TabsTrigger value="categories">Kategori Layanan</TabsTrigger>
                </TabsList>

                {/* --- TAB TREATMENTS --- */}
                <TabsContent value="treatments">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Daftar Harga & Tindakan</CardTitle>
                                    <CardDescription>Kelola harga layanan klinik Anda di sini</CardDescription>
                                </div>
                                {/* Search Placeholder - Implementasi filter bisa ditambahkan di sini */}
                                <div className="w-64">
                                    <SearchInput placeholder="Cari tindakan..." />
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <DataTable
                                data={treatments?.data || []}
                                columns={treatmentColumns}
                                isLoading={isLoadingTreatments}
                                pagination={{ pageSize: 10, pageIndex: 0, totalItems: treatments?.meta?.total || 0, pageCount: treatments?.meta?.lastPage || 1 }}
                            />
                        </CardBody>
                    </Card>
                </TabsContent>

                {/* --- TAB CATEGORIES --- */}
                <TabsContent value="categories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kategori Layanan</CardTitle>
                            <CardDescription>Kelompokkan tindakan medis untuk pelaporan yang lebih baik</CardDescription>
                        </CardHeader>
                        <CardBody>
                            <DataTable
                                data={categories?.data || []}
                                columns={categoryColumns}
                                isLoading={isLoadingCategories}
                            />
                        </CardBody>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* --- MODAL TAMBAH TINDAKAN --- */}
            <Modal
                isOpen={treatmentModal.isOpen}
                onClose={treatmentModal.close}
                title="Tambah Tindakan Baru"
                description="Masukkan detail tindakan medis dan harganya."
            >
                <div className="space-y-4 py-4">
                    <Input
                        label="Nama Tindakan"
                        placeholder="Contoh: Scaling Gigi (Ringan)"
                        {...treatmentForm.register('name')}
                    />
                    <Input
                        label="Harga (IDR)"
                        type="number"
                        placeholder="0"
                        {...treatmentForm.register('price')}
                    />
                    <FormSelect
                        label="Kategori"
                        placeholder="Pilih Kategori"
                        options={(categories?.data || []).map((c: any) => ({ label: c.name, value: c.id }))}
                        value={treatmentForm.values.categoryId}
                        onChange={(val) => treatmentForm.setValue('categoryId', val)}
                    />
                    <Input
                        label="Deskripsi (Opsional)"
                        placeholder="Keterangan tambahan..."
                        {...treatmentForm.register('description')}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={treatmentModal.close}>Batal</Button>
                    <Button onClick={treatmentForm.handleSubmit} isLoading={createTreatment.isPending}>Simpan</Button>
                </div>
            </Modal>

            {/* --- MODAL TAMBAH KATEGORI --- */}
            <Modal
                isOpen={categoryModal.isOpen}
                onClose={categoryModal.close}
                title="Tambah Kategori Baru"
            >
                <div className="space-y-4 py-4">
                    <Input
                        label="Nama Kategori"
                        placeholder="Contoh: Ortodonti"
                        {...categoryForm.register('name')}
                    />
                    <Input
                        label="Deskripsi"
                        placeholder="Keterangan singkat..."
                        {...categoryForm.register('description')}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={categoryModal.close}>Batal</Button>
                    <Button onClick={categoryForm.handleSubmit} isLoading={createCategory.isPending}>Simpan</Button>
                </div>
            </Modal>

        </PageContainer>
    );
}