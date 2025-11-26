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

interface ModalState {
    isEdit: boolean;
    initialData?: any;
}

export default function CategoryManager() {
    const toast = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'restore'>('delete');

    const { data: response, isLoading } = useTreatmentCategories();
    const deleteCategory = useDeleteTreatmentCategory();
    const restoreCategory = useRestoreTreatmentCategory();

    const formModal = useModal();
    const confirmModal = useModal();

    // ✅ FIX: Gunakan ref untuk modal state (TIDAK PERNAH BERUBAH)
    const modalStateRef = useRef<ModalState>({
        isEdit: false,
        initialData: undefined
    });

    // Extract data
    const categoryList = useMemo(() => {
        const data = Array.isArray(response)
            ? response
            : (response as any)?.data || [];
        return data;
    }, [response]);

    // ✅ FIX: Cari item berdasarkan ID
    const selectedItem = useMemo(() => {
        if (!selectedItemId || !categoryList.length) return null;
        return categoryList.find((cat: any) => cat.id == selectedItemId) || null;
    }, [selectedItemId, categoryList]);

    // ✅ FIX: Update modal state ref (TANPA RE-RENDER)
    const updateModalState = useCallback((item: any | null) => {
        if (item) {
            modalStateRef.current = {
                isEdit: true,
                initialData: {
                    id: item.id,
                    namaKategori: item.namaKategori || '',
                    deskripsi: item.deskripsi || ''
                }
            };
        } else {
            modalStateRef.current = {
                isEdit: false,
                initialData: undefined
            };
        }
    }, []);

    // ✅ FIX: Stable action handlers dengan ref
    const actionHandlersRef = useRef({
        onEdit: (item: any) => {
            console.log('Editing item ID:', item?.id);
            setSelectedItemId(item?.id || null);
            updateModalState(item); // ✅ Update ref, TIDAK setState
            formModal.open();
        },
        onDelete: (item: any) => {
            setSelectedItemId(item?.id || null);
            setActionType('delete');
            confirmModal.open();
        },
        onRestore: (item: any) => {
            setSelectedItemId(item?.id || null);
            setActionType('restore');
            confirmModal.open();
        }
    });

    // Filter data
    const filteredData = useMemo(() => {
        if (!categoryList.length) return [];

        const query = searchQuery.toLowerCase();
        return categoryList.filter((cat: any) =>
            (cat.namaKategori || '').toLowerCase().includes(query) ||
            (cat.deskripsi || '').toLowerCase().includes(query)
        );
    }, [categoryList, searchQuery]);

    // ✅ FIX: Handler create - update ref saja
    const handleCreate = useCallback(() => {
        console.log('Creating new category');
        setSelectedItemId(null);
        updateModalState(null); // ✅ Update ref, TIDAK setState
        formModal.open();
    }, [formModal, updateModalState]);

    // ✅ FIX: Type-safe confirm action
    const handleConfirmAction = useCallback(async () => {
        if (!selectedItemId) return;

        try {
            const id = Number(selectedItemId);

            if (actionType === 'delete') {
                await deleteCategory.mutateAsync({ id });
                toast.showSuccess('Kategori berhasil dihapus');
            } else {
                await restoreCategory.mutateAsync({ id });
                toast.showSuccess('Kategori berhasil dipulihkan');
            }

            confirmModal.close();
            setSelectedItemId(null);
            queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Terjadi kesalahan';
            toast.showError(errorMessage);
        }
    }, [selectedItemId, actionType, deleteCategory, restoreCategory, toast, confirmModal, queryClient]);

    // ✅ FIX: Handler success
    const handleFormSuccess = useCallback(() => {
        console.log('Form success, closing modal');
        formModal.close();
        setSelectedItemId(null);
        queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
    }, [formModal, queryClient]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    // ✅ STABLE: Columns dengan ref
    const columns = useMemo(() =>
        getCategoryColumns(actionHandlersRef.current),
        []);

    const isActionLoading = deleteCategory.isPending || restoreCategory.isPending;

    // ✅ FIX: Modal initial data - GUNAKAN REF (TIDAK PERNAH BERUBAH)
    const getModalInitialData = useCallback(() => {
        return modalStateRef.current.initialData;
    }, []);

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

            {/* ✅ MODAL dengan PROP YANG STABIL - TIDAK PERNAH BERUBAH */}
            <CategoryModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={getModalInitialData()} // ✅ Function yang selalu return sama
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