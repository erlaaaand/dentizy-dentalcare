'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, FolderOpen, Trash2, Edit } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Badge } from '@/components/ui/data-display/badge';
import { SearchInput } from '@/components';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import CategoryModal from '../components/CategoryModal';

import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import { useTreatmentCategories, useDeleteTreatmentCategory } from '@/core/services/api/treatment-categories.api';

export default function CategoryManager() {
    const toast = useToast();
    const queryClient = useQueryClient();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Hooks
    const { data: categories, isLoading } = useTreatmentCategories();
    const deleteCategory = useDeleteTreatmentCategory();

    // Modals
    const formModal = useModal();
    const deleteModal = useModal();

    // Handlers
    const handleCreate = () => {
        setSelectedItem(null);
        formModal.open();
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        formModal.open();
    };

    const handleDeleteClick = (item: any) => {
        setSelectedItem(item);
        deleteModal.open();
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteCategory.mutateAsync(selectedItem.id);
            toast.showSuccess('Kategori dihapus');
            deleteModal.close();
            queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
        } catch (error) {
            toast.showError('Gagal menghapus kategori');
        }
    };

    const handleFormSuccess = () => {
        formModal.close();
        queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
    };

    const filteredData = (categories?.data || []).filter((cat: any) =>
        (cat.namaKategori || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            header: 'Nama Kategori',
            accessorKey: 'namaKategori',
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-50 rounded text-yellow-600">
                        <FolderOpen className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-900">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: 'Deskripsi',
            accessorKey: 'deskripsi',
            cell: (info: any) => <span className="text-gray-500 text-sm truncate max-w-xs block">{info.getValue() || '-'}</span>
        },
        {
            header: 'Status',
            accessorKey: 'isActive',
            cell: (info: any) => (
                <Badge variant={info.getValue() ? 'success' : 'secondary'}>
                    {info.getValue() ? 'Aktif' : 'Non-Aktif'}
                </Badge>
            )
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(info.row.original)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(info.row.original)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Kategori Layanan</CardTitle>
                            <CardDescription>Kelola pengelompokan tindakan medis</CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64">
                                <SearchInput
                                    placeholder="Cari kategori..."
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                />
                            </div>
                            <Button onClick={handleCreate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Kategori
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable data={filteredData} columns={columns} isLoading={isLoading} />
                </CardBody>
            </Card>

            <CategoryModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={selectedItem}
                onSuccess={handleFormSuccess}
            />

            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleConfirmDelete}
                title="Hapus Kategori"
                message={`Yakin ingin menghapus kategori "${selectedItem?.namaKategori}"?`}
                variant="danger"
                confirmText="Hapus"
                isLoading={deleteCategory.isPending}
            />
        </>
    );
}