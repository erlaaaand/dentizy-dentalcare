'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import TreatmentModal from '../components/TreatmentModal';
import { getTreatmentColumns } from '../table/treatment-columns';

import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import {
    useTreatments,
    useDeleteTreatment,
    useRestoreTreatment,
    useActivateTreatment,
    useDeactivateTreatment
} from '@/core/services/api/treatments.api';

type ActionType = 'delete' | 'restore' | 'activate' | 'deactivate';

export default function TreatmentManager() {
    const toast = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [actionType, setActionType] = useState<ActionType>('delete');

    const { data: response, isLoading } = useTreatments();
    const deleteTreatment = useDeleteTreatment();
    const restoreTreatment = useRestoreTreatment();
    const activateTreatment = useActivateTreatment();
    const deactivateTreatment = useDeactivateTreatment();

    const formModal = useModal();
    const confirmModal = useModal();

    // Extract and filter data
    const treatmentList = useMemo(() => {
        return Array.isArray(response)
            ? response
            : (response as any)?.data || [];
    }, [response]);

    const paginationMeta = useMemo(() => (response as any)?.meta, [response]);

    const filteredData = useMemo(() => {
        return treatmentList.filter((item: any) =>
            (item.namaPerawatan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.kodePerawatan || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [treatmentList, searchQuery]);

    // Memoized handlers
    const handleCreate = useCallback(() => {
        setSelectedItem(null);
        formModal.open();
    }, [formModal]);

    const handleEdit = useCallback((item: any) => {
        setSelectedItem(item);
        formModal.open();
    }, [formModal]);

    const handleAction = useCallback((item: any, action: ActionType) => {
        setSelectedItem(item);
        setActionType(action);
        confirmModal.open();
    }, [confirmModal]);

    const handleConfirmAction = useCallback(async () => {
        if (!selectedItem) return;

        try {
            switch (actionType) {
                case 'delete':
                    await deleteTreatment.mutateAsync(selectedItem.id);
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
    }, [selectedItem, actionType, deleteTreatment, restoreTreatment, activateTreatment, deactivateTreatment, toast, confirmModal, queryClient]);

    const handleFormSuccess = useCallback(() => {
        formModal.close();
        queryClient.invalidateQueries({ queryKey: ['/treatments'] });
    }, [formModal, queryClient]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    // Memoized columns
    const columns = useMemo(() => getTreatmentColumns({
        onEdit: handleEdit,
        onDelete: (item) => handleAction(item, 'delete'),
        onRestore: (item) => handleAction(item, 'restore'),
        onActivate: (item) => handleAction(item, 'activate'),
        onDeactivate: (item) => handleAction(item, 'deactivate')
    }), [handleEdit, handleAction]);

    const isActionLoading =
        deleteTreatment.isPending ||
        restoreTreatment.isPending ||
        activateTreatment.isPending ||
        deactivateTreatment.isPending;

    // Helper functions
    const getActionLabel = useCallback((action: ActionType) => {
        const labels: Record<ActionType, string> = {
            delete: 'Hapus',
            restore: 'Pulihkan',
            activate: 'Aktifkan',
            deactivate: 'Nonaktifkan'
        };
        return labels[action];
    }, []);

    const confirmMessage = useMemo(() => {
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
    }, [selectedItem, actionType]);

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
                                    onChange={handleSearchChange}
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
                            totalPages: Math.ceil(filteredData.length / 10),
                            totalItems: filteredData.length,
                            itemsPerPage: 10
                        }}
                    />
                </CardBody>
            </Card>

            <TreatmentModal
                isOpen={formModal.isOpen}
                onClose={formModal.close}
                initialData={selectedItem}
                onSuccess={handleFormSuccess}
            />

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={handleConfirmAction}
                title={`${getActionLabel(actionType)} Layanan`}
                message={confirmMessage}
                variant={actionType === 'delete' ? 'danger' : 'default'}
                confirmText={getActionLabel(actionType)}
                isLoading={isActionLoading}
            />
        </>
    );
}