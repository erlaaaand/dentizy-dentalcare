// ============================================================================
// FILE 3: frontend/src/app/(dashboard)/settings/categories/page.tsx
// Treatment Categories Management
// ============================================================================

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderOpen, Search } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Badge } from '@/components/ui/data-display/badge';
import { Modal } from '@/components/ui/feedback/modal';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/text-area';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import SearchInput from '@/components/ui/forms/search-input';

import { useAuth } from '@/core/hooks/auth/useAuth';
import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import { useForm } from '@/core/hooks/forms/useForm';
import {
    useTreatmentCategories,
    useCreateTreatmentCategory,
    useUpdateTreatmentCategory,
    useDeleteTreatmentCategory,
} from '@/core/services/api/treatment-categories.api';
import { ROLES } from '@/core/constants/role.constants';

export default function CategoriesSettingsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    // API Hooks
    const { data: categories, isLoading } = useTreatmentCategories();
    const createCategory = useCreateTreatmentCategory();
    const updateCategory = useUpdateTreatmentCategory();
    const deleteCategory = useDeleteTreatmentCategory();

    // Modals
    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    // Check if user has access
    const userRoles = user?.roles?.map((role: any) => role.name) || [];
    const hasAccess = userRoles.includes(ROLES.KEPALA_KLINIK);

    // Form for Create
    const createForm = useForm({
        initialValues: {
            name: '',
            description: '',
        },
        onSubmit: async (values) => {
            try {
                await createCategory.mutateAsync(values);
                toast.success('Kategori berhasil dibuat');
                createModal.close();
                createForm.reset();
                queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
            } catch (error) {
                toast.error('Gagal membuat kategori');
            }
        }
    });

    // Form for Edit
    const editForm = useForm({
        initialValues: {
            name: '',
            description: '',
        },
        onSubmit: async (values) => {
            if (!selectedCategory) return;

            try {
                await updateCategory.mutateAsync({
                    id: selectedCategory.id,
                    data: values
                });
                toast.success('Kategori berhasil diperbarui');
                editModal.close();
                setSelectedCategory(null);
                queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
            } catch (error) {
                toast.error('Gagal memperbarui kategori');
            }
        }
    });

    const handleEdit = (category: any) => {
        setSelectedCategory(category);
        editForm.setValues({
            name: category.name,
            description: category.description || '',
        });
        editModal.open();
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;

        try {
            await deleteCategory.mutateAsync(selectedCategory.id);
            toast.success('Kategori berhasil dihapus');
            deleteModal.close();
            setSelectedCategory(null);
            queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
        } catch (error) {
            toast.error('Gagal menghapus kategori');
        }
    };

    const openDeleteModal = (category: any) => {
        setSelectedCategory(category);
        deleteModal.open();
    };

    // Filter categories by search
    const filteredCategories = (categories?.data || []).filter((cat: any) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            header: 'Nama Kategori',
            accessorKey: 'name',
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: 'Deskripsi',
            accessorKey: 'description',
            cell: (info: any) => (
                <span className="text-gray-500 text-sm">
                    {info.getValue() || '-'}
                </span>
            )
        },
        {
            header: 'Jumlah Tindakan',
            accessorKey: 'treatments',
            cell: (info: any) => {
                const treatments = info.getValue() || [];
                return (
                    <Badge variant="outline">
                        {treatments.length} Tindakan
                    </Badge>
                );
            }
        },
        {
            header: 'Status',
            accessorKey: 'deleted_at',
            cell: (info: any) => {
                const isDeleted = info.getValue();
                return (
                    <Badge variant={isDeleted ? 'danger' : 'success'}>
                        {isDeleted ? 'Nonaktif' : 'Aktif'}
                    </Badge>
                );
            }
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => {
                const category = info.row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            disabled={!hasAccess}
                        >
                            <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(category)}
                            disabled={!hasAccess}
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    if (!hasAccess) {
        return (
            <PageContainer title="Akses Ditolak">
                <Card>
                    <CardBody className="p-12 text-center">
                        <p className="text-red-500">Anda tidak memiliki akses ke halaman ini.</p>
                    </CardBody>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Kategori Layanan"
            subtitle="Kelola kategori dan klasifikasi tindakan medis"
            actions={
                <Button onClick={createModal.open}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kategori
                </Button>
            }
        >
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Daftar Kategori</CardTitle>
                            <CardDescription>
                                Total {filteredCategories.length} kategori
                            </CardDescription>
                        </div>
                        <div className="w-64">
                            <SearchInput
                                placeholder="Cari kategori..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable
                        data={filteredCategories}
                        columns={columns}
                        isLoading={isLoading}
                    />
                </CardBody>
            </Card>

            {/* Create Modal */}
            <Modal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                title="Tambah Kategori Baru"
                description="Buat kategori baru untuk mengelompokkan tindakan medis"
            >
                <div className="space-y-4 py-4">
                    <Input
                        label="Nama Kategori"
                        placeholder="Contoh: Ortodonti, Bedah Mulut"
                        {...createForm.register('name')}
                        required
                    />
                    <Textarea
                        label="Deskripsi"
                        placeholder="Keterangan singkat tentang kategori ini..."
                        {...createForm.register('description')}
                        rows={3}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={createModal.close}>
                        Batal
                    </Button>
                    <Button
                        onClick={createForm.handleSubmit}
                        isLoading={createCategory.isPending}
                    >
                        Simpan
                    </Button>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                title="Edit Kategori"
                description="Perbarui informasi kategori"
            >
                <div className="space-y-4 py-4">
                    <Input
                        label="Nama Kategori"
                        placeholder="Nama kategori"
                        {...editForm.register('name')}
                        required
                    />
                    <Textarea
                        label="Deskripsi"
                        placeholder="Keterangan singkat..."
                        {...editForm.register('description')}
                        rows={3}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={editModal.close}>
                        Batal
                    </Button>
                    <Button
                        onClick={editForm.handleSubmit}
                        isLoading={updateCategory.isPending}
                    >
                        Update
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus kategori "${selectedCategory?.name}"?`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                isLoading={deleteCategory.isPending}
            />
        </PageContainer>
    );
}