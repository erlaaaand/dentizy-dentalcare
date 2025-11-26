'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, FolderOpen, Trash2, Edit, RotateCcw } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Badge } from '@/components/ui/data-display/badge';
import { SearchInput } from '@/components'; // Fix import path (default export)
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import CategoryModal from '../components/CategoryModal';

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

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Hooks
    // Menggunakan nama 'response' agar lebih jelas bahwa ini raw response
    const { data: response, isLoading } = useTreatmentCategories();
    const deleteCategory = useDeleteTreatmentCategory();
    const restoreCategory = useRestoreTreatmentCategory();

    // Modals
    const formModal = useModal();
    const deleteModal = useModal();
    const restoreModal = useModal();

    // --- DATA EXTRACTION FIX ---
    // Masalah utama ada di sini sebelumnya. 
    // Kita cek apakah data ada di properti .data (pagination pattern) atau langsung array.
    const categoryList = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

    // Filter Data
    const filteredData = categoryList.filter((cat: any) =>
        (cat.namaKategori || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleRestoreClick = (item: any) => {
        setSelectedItem(item);
        restoreModal.open();
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteCategory.mutateAsync({ id: selectedItem.id });
            toast.showSuccess('Kategori berhasil dihapus');
            deleteModal.close();
            // Gunakan key yang sesuai dengan generated query key ('/treatment-categories')
            queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Gagal menghapus kategori';
            toast.showError(errorMessage);
        }
    };

    const handleConfirmRestore = async () => {
        if (!selectedItem) return;
        try {
            await restoreCategory.mutateAsync({ id: selectedItem.id });
            toast.showSuccess('Kategori berhasil dipulihkan');
            restoreModal.close();
            queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Gagal memulihkan kategori';
            toast.showError(errorMessage);
        }
    };

    const handleFormSuccess = () => {
        formModal.close();
        queryClient.invalidateQueries({ queryKey: ['/treatment-categories'] });
    };

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
            cell: (info: any) => (
                <span className="text-gray-500 text-sm truncate max-w-xs block" title={info.getValue()}>
                    {info.getValue() || '-'}
                </span>
            )
        },
        {
            header: 'Status',
            id: 'status',
            accessorKey: 'deletedAt', // Pastikan accessor ini sesuai DTO backend (deletedAt atau isActive)
            cell: (info: any) => {
                // Cek apakah row.original memiliki deletedAt yang tidak null
                const isDeleted = !!info.row.original.deletedAt;

                return (
                    <Badge variant={isDeleted ? 'error' : 'success'}>
                        {isDeleted ? 'Dihapus' : 'Aktif'}
                    </Badge>
                );
            }
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => {
                const row = info.row.original;
                const isDeleted = !!row.deletedAt;

                if (isDeleted) {
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestoreClick(row)}
                                title="Pulihkan"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(row)}
                            title="Edit"
                        >
                            <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(row)}
                            title="Hapus"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                );
            }
        }
    ];

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
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada kategori ditemukan"
                        pagination={{
                            currentPage: 1,
                            totalPages: Math.ceil(filteredData.length / 10), // Hitung berdasarkan itemsPerPage
                            totalItems: filteredData.length,
                            itemsPerPage: 10 // Konstan
                        }}
                    />
                </CardBody>
            </Card>

            {/* Form Modal (Create/Edit) */}
            <CategoryModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={selectedItem}
                onSuccess={handleFormSuccess}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleConfirmDelete}
                title="Hapus Kategori"
                message={
                    <div>
                        <p>Yakin ingin menghapus kategori <strong>"{selectedItem?.namaKategori}"</strong>?</p>
                        <p className="mt-2 text-sm text-gray-600">
                            Kategori yang dihapus dapat dipulihkan kembali (Soft Delete).
                        </p>
                    </div>
                }
                variant="danger"
                confirmText="Hapus"
                isLoading={deleteCategory.isPending}
            />

            {/* Restore Confirmation */}
            <ConfirmDialog
                isOpen={restoreModal.isOpen}
                onClose={restoreModal.close}
                onConfirm={handleConfirmRestore}
                title="Pulihkan Kategori"
                message={
                    <div>
                        <p>Yakin ingin memulihkan kategori <strong>"{selectedItem?.namaKategori}"</strong>?</p>
                        <p className="mt-2 text-sm text-gray-600">
                            Kategori akan aktif kembali dan dapat digunakan untuk layanan.
                        </p>
                    </div>
                }
                variant="default"
                confirmText="Pulihkan"
                isLoading={restoreCategory.isPending}
            />
        </>
    );
}