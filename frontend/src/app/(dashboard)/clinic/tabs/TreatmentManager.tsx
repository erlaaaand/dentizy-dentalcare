'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Stethoscope, RotateCcw, Power, PowerOff } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Badge } from '@/components/ui/data-display/badge';
import SearchInput from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import TreatmentModal from '../components/TreatmentModal';

import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import {
    useTreatments,
    useDeleteTreatment,
    useRestoreTreatment,
    useActivateTreatment,
    useDeactivateTreatment
} from '@/core/services/api/treatments.api';
import { formatCurrency } from '@/core/utils/date/format.utils'; // Pastikan path util formatCurrency benar

export default function TreatmentManager() {
    const toast = useToast();
    const queryClient = useQueryClient();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [actionType, setActionType] = useState<'delete' | 'restore' | 'activate' | 'deactivate'>('delete');

    // API Hooks
    const { data: response, isLoading } = useTreatments();
    const deleteTreatment = useDeleteTreatment();
    const restoreTreatment = useRestoreTreatment();
    const activateTreatment = useActivateTreatment();
    const deactivateTreatment = useDeactivateTreatment();

    // Modals
    const formModal = useModal();
    const confirmModal = useModal();

    // --- DATA EXTRACTION & FILTERING ---
    // Mengambil array data dengan aman dari struktur response paginasi atau array langsung
    const treatmentList = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

    // Mengambil metadata pagination jika ada
    const paginationMeta = (response as any)?.meta;

    const filteredData = treatmentList.filter((item: any) =>
        (item.namaPerawatan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.kodePerawatan || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- HANDLERS ---
    const handleCreate = () => {
        setSelectedItem(null);
        formModal.open();
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        formModal.open();
    };

    const handleAction = (item: any, action: typeof actionType) => {
        setSelectedItem(item);
        setActionType(action);
        confirmModal.open();
    };

    const handleConfirmAction = async () => {
        if (!selectedItem) return;

        try {
            switch (actionType) {
                case 'delete':
                    await deleteTreatment.mutateAsync(selectedItem.id); // Gunakan id, bukan object
                    toast.showSuccess('Layanan berhasil dihapus');
                    break;
                case 'restore':
                    await restoreTreatment.mutateAsync(selectedItem.id);
                    toast.showSuccess('Layanan berhasil dipulihkan');
                    break;
                case 'activate':
                    await activateTreatment.mutateAsync(selectedItem.id);
                    toast.showSuccess('Layanan berhasil diaktifkan');
                    break;
                case 'deactivate':
                    await deactivateTreatment.mutateAsync(selectedItem.id);
                    toast.showSuccess('Layanan berhasil dinonaktifkan');
                    break;
            }
            confirmModal.close();
            queryClient.invalidateQueries({ queryKey: ['/treatments'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
            toast.showError(`Gagal ${getActionLabel(actionType).toLowerCase()} layanan: ${errorMessage}`);
        }
    };

    const handleFormSuccess = () => {
        formModal.close();
        queryClient.invalidateQueries({ queryKey: ['/treatments'] });
    };

    // --- HELPERS ---
    const getActionLabel = (action: typeof actionType) => {
        switch (action) {
            case 'delete': return 'Hapus';
            case 'restore': return 'Pulihkan';
            case 'activate': return 'Aktifkan';
            case 'deactivate': return 'Nonaktifkan';
        }
    };

    const getConfirmMessage = () => {
        const name = selectedItem?.namaPerawatan || '';
        switch (actionType) {
            case 'delete':
                return (
                    <div>
                        <p>Yakin ingin menghapus layanan <strong>"{name}"</strong>?</p>
                        <p className="mt-2 text-sm text-gray-600">Layanan yang dihapus masih dapat dipulihkan kembali.</p>
                    </div>
                );
            case 'restore':
                return <p>Yakin ingin memulihkan layanan <strong>"{name}"</strong>?</p>;
            case 'activate':
                return <p>Yakin ingin mengaktifkan layanan <strong>"{name}"</strong>?</p>;
            case 'deactivate':
                return (
                    <div>
                        <p>Yakin ingin menonaktifkan layanan <strong>"{name}"</strong>?</p>
                        <p className="mt-2 text-sm text-gray-600">Layanan yang dinonaktifkan tidak akan muncul saat pendaftaran pasien.</p>
                    </div>
                );
        }
    };

    const isActionLoading =
        deleteTreatment.isPending ||
        restoreTreatment.isPending ||
        activateTreatment.isPending ||
        deactivateTreatment.isPending;

    // --- TABLE COLUMNS ---
    const columns = [
        {
            header: 'Kode',
            accessorKey: 'kodePerawatan',
            cell: (info: any) => (
                <span className="font-mono text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                    {info.getValue()}
                </span>
            )
        },
        {
            header: 'Nama Layanan',
            accessorKey: 'namaPerawatan',
            cell: (info: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{info.getValue()}</span>
                        {info.row.original.category && (
                            <span className="text-xs text-gray-500 md:hidden">
                                {info.row.original.category.namaKategori}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Kategori',
            accessorKey: 'category',
            cell: (info: any) => {
                const category = info.getValue();
                return (
                    <Badge variant="outline" className="text-xs">
                        {category?.namaKategori || 'Umum'}
                    </Badge>
                );
            }
        },
        {
            header: 'Harga',
            accessorKey: 'harga',
            cell: (info: any) => (
                <span className="font-semibold text-green-700 whitespace-nowrap">
                    {formatCurrency(Number(info.getValue()))}
                </span>
            )
        },
        {
            header: 'Durasi',
            accessorKey: 'durasiEstimasi',
            cell: (info: any) => (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                    {info.getValue() || '-'} menit
                </span>
            )
        },
        {
            header: 'Status',
            id: 'status',
            accessorKey: 'isActive',
            cell: (info: any) => {
                const row = info.row.original;
                const isDeleted = !!row.deletedAt; // Cek deletedAt dari response
                const isActive = row.isActive;

                if (isDeleted) {
                    return <Badge variant="error">Dihapus</Badge>;
                }

                return (
                    <Badge variant={isActive ? 'success' : 'secondary'}>
                        {isActive ? 'Aktif' : 'Non-Aktif'}
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
                const isActive = row.isActive;

                if (isDeleted) {
                    return (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(row, 'restore')}
                            title="Pulihkan"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        {isActive ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAction(row, 'deactivate')}
                                title="Nonaktifkan"
                            >
                                <PowerOff className="w-4 h-4 text-orange-500" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAction(row, 'activate')}
                                title="Aktifkan"
                            >
                                <Power className="w-4 h-4 text-green-500" />
                            </Button>
                        )}
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
                            onClick={() => handleAction(row, 'delete')}
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Daftar Harga & Layanan</CardTitle>
                            <CardDescription>
                                Kelola daftar tindakan medis. Total {paginationMeta?.total || filteredData.length} layanan.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="w-full sm:w-64">
                                <SearchInput
                                    placeholder="Cari layanan atau kode..."
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                />
                            </div>
                            <Button onClick={handleCreate} className="whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Layanan
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada layanan ditemukan"
                        pagination={{
                            currentPage: 1,
                            totalPages: Math.ceil(filteredData.length / 10), // Hitung berdasarkan itemsPerPage
                            totalItems: filteredData.length,
                            itemsPerPage: 10 // Konstan
                        }}
                    />
                </CardBody>
            </Card>

            {/* Modal Form (Create/Edit) */}
            <TreatmentModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={selectedItem}
                onSuccess={handleFormSuccess}
            />

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={handleConfirmAction}
                title={`${getActionLabel(actionType)} Layanan`}
                message={getConfirmMessage()}
                variant={actionType === 'delete' ? 'danger' : 'default'}
                confirmText={getActionLabel(actionType)}
                isLoading={isActionLoading}
            />
        </>
    );
}