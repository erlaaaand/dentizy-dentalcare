'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { SearchInput } from '@/components';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import CategoryModal from '../components/CategoryModal';
import { getCategoryColumns } from '../config/category-columns';

import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import {
    useTreatmentCategories,
    useDeleteTreatmentCategory,
    useRestoreTreatmentCategory
} from '@/core/services/api/treatment-categories.api';

export default function CategoryManager() {
    const toast = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [actionType, setActionType] = useState<'delete' | 'restore'>('delete');

    const { data: response, isLoading } = useTreatmentCategories();
    const deleteCategory = useDeleteTreatmentCategory();
    const restoreCategory = useRestoreTreatmentCategory();

    const formModal = useModal();
    const confirmModal = useModal();

    // Extract data
    const categoryList = useMemo(() => {
        return Array.isArray(response)
            ? response
            : (response as any)?.data || [];
    }, [response]);

    // Filter data
    const filteredData = useMemo(() => {
        return categoryList.filter((cat: any) =>
            (cat.namaKategori || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cat.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categoryList, searchQuery]);

    // Memoized handlers
    const handleCreate = useCallback(() => {
        setSelectedItem(null);
        formModal.open();
    }, [formModal]);

    const handleEdit = useCallback((item: any) => {
        setSelectedItem(item);
        formModal.open();
    }, [formModal]);

    const handleDeleteClick = useCallback((item: any) => {
        setSelectedItem(item);
        setActionType('delete');
        confirmModal.open();
    }, [confirmModal]);

    const handleRestoreClick = useCallback((item: any) => {
        setSelectedItem(item);
        setActionType('restore');
        confirmModal.open();
    }, [confirmModal]);

    const handleConfirmAction = useCallback(async () => {
        if (!selectedItem) return;

        try {
            if (actionType === 'delete') {
                await deleteCategory.mutateAsync({ id: selectedItem.id });
                toast.showSuccess('Kategori berhasil dihapus');
            } else {
                await restoreCategory.mutateAsync({ id: selectedItem.id });
                toast.showSuccess('Kategori berhasil dipulihkan');
            }

            confirmModal.close();
            queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Terjadi kesalahan';
            toast.showError(errorMessage);
        }
    }, [selectedItem, actionType, deleteCategory, restoreCategory, toast, confirmModal, queryClient]);

    const handleFormSuccess = useCallback(() => {
        formModal.close();
        queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
    }, [formModal, queryClient]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    // Memoized columns
    const columns = useMemo(() => getCategoryColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
        onRestore: handleRestoreClick
    }), [handleEdit, handleDeleteClick, handleRestoreClick]);

    const isActionLoading = deleteCategory.isPending || restoreCategory.isPending;

    const confirmMessage = useMemo(() => {
        const name = selectedItem?.namaKategori || '';
        if (actionType === 'delete') {
            return (
                <div>
                    <p>Yakin ingin menghapus kategori <strong>"{name}"</strong>?</p>
                    <p className="mt-2 text-sm text-gray-600">
                        Kategori yang dihapus dapat dipulihkan kembali (Soft Delete).
                    </p>
                </div>
            );
        }
        return (
            <div>
                <p>Yakin ingin memulihkan kategori <strong>"{name}"</strong>?</p>
                <p className="mt-2 text-sm text-gray-600">
                    Kategori akan aktif kembali dan dapat digunakan untuk layanan.
                </p>
            </div>
        );
    }, [selectedItem, actionType]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Kategori Layanan</CardTitle>
                            <CardDescription>
                                Kelola pengelompokan tindakan medis. Total {filteredData.length} kategori.
                            </CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64">
                                <SearchInput
                                    placeholder="Cari kategori..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
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
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada kategori ditemukan"
                        pagination={{
                            currentPage: 1,
                            totalPages: Math.ceil(filteredData.length / 10),
                            totalItems: filteredData.length,
                            itemsPerPage: 10
                        }}
                    />
                </CardBody>
            </Card>

            <CategoryModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={selectedItem}
                onSuccess={handleFormSuccess}
            />

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={handleConfirmAction}
                title={actionType === 'delete' ? 'Hapus Kategori' : 'Pulihkan Kategori'}
                message={confirmMessage}
                variant={actionType === 'delete' ? 'danger' : 'default'}
                confirmText={actionType === 'delete' ? 'Hapus' : 'Pulihkan'}
                isLoading={isActionLoading}
            />
        </>
    );
}