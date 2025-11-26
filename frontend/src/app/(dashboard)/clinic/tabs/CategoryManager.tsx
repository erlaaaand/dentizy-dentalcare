'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
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

    // GUNAKAN useRef UNTUK STABLE ACTION HANDLERS - MENCEGAH RE-RENDER COLUMNS
    const actionHandlersRef = useRef({
        onEdit: (item: any) => {
            console.log('Editing item:', item);
            setSelectedItem(item);
            formModal.open();
        },
        onDelete: (item: any) => {
            setSelectedItem(item);
            setActionType('delete');
            confirmModal.open();
        },
        onRestore: (item: any) => {
            setSelectedItem(item);
            setActionType('restore');
            confirmModal.open();
        }
    });

    // Extract data dengan dependencies yang lebih spesifik
    const categoryList = useMemo(() => {
        const data = Array.isArray(response)
            ? response
            : (response as any)?.data || [];

        console.log('Category list data:', data);
        return data;
    }, [response]); // Tetap depend on response, tapi lebih aware structure

    // Filter data dengan optimization
    const filteredData = useMemo(() => {
        if (!categoryList.length) return [];

        const query = searchQuery.toLowerCase();
        return categoryList.filter((cat: any) =>
            (cat.namaKategori || '').toLowerCase().includes(query) ||
            (cat.deskripsi || '').toLowerCase().includes(query)
        );
    }, [categoryList, searchQuery]);

    // Handler yang stabil
    const handleCreate = useCallback(() => {
        console.log('Creating new category');
        setSelectedItem(null);
        formModal.open();
    }, [formModal]);

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
            // Reset selected item setelah action selesai
            setSelectedItem(null);
            queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Terjadi kesalahan';
            toast.showError(errorMessage);
        }
    }, [selectedItem, actionType, deleteCategory, restoreCategory, toast, confirmModal, queryClient]);

    const handleFormSuccess = useCallback(() => {
        console.log('Form success, closing modal');
        formModal.close();
        // Reset selected item setelah form success
        setSelectedItem(null);
        queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
    }, [formModal, queryClient]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    // COLUMNS - GUNAKAN REF UNTUK MENGHINDARI RE-RENDER
    const columns = useMemo(() =>
        getCategoryColumns(actionHandlersRef.current),
        []); // EMPTY DEPENDENCY - TIDAK PERNAH RE-RENDER

    const isActionLoading = deleteCategory.isPending || restoreCategory.isPending;

    // Optimize confirm message
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

    // Prepare initial data untuk modal - lebih konsisten
    const modalInitialData = useMemo(() => {
        if (!selectedItem) return undefined;

        return {
            id: selectedItem.id,
            namaKategori: selectedItem.namaKategori || '',
            deskripsi: selectedItem.deskripsi || ''
        };
    }, [selectedItem]);

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

            {/* MODAL DENGAN PROP YANG OPTIMAL */}
            <CategoryModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={modalInitialData}
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