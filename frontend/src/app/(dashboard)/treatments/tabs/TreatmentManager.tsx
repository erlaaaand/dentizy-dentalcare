'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
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

interface ModalState {
    isEdit: boolean;
    initialData?: any;
}

export default function TreatmentManager() {
    const toast = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
    const [actionType, setActionType] = useState<ActionType>('delete');

    const { data: response, isLoading } = useTreatments();
    const deleteTreatment = useDeleteTreatment();
    const restoreTreatment = useRestoreTreatment();
    const activateTreatment = useActivateTreatment();
    const deactivateTreatment = useDeactivateTreatment();

    const formModal = useModal();
    const confirmModal = useModal();

    const modalStateRef = useRef<ModalState>({
        isEdit: false,
        initialData: undefined
    });

    const treatmentList = useMemo(() => {
        const data = Array.isArray(response)
            ? response
            : (response as any)?.data || [];
        return data;
    }, [response]);

    const paginationMeta = useMemo(() => (response as any)?.meta, [response]);

    const selectedItem = useMemo(() => {
        if (!selectedItemId || !treatmentList.length) return null;
        return treatmentList.find((item: any) => item.id == selectedItemId) || null;
    }, [selectedItemId, treatmentList]);

    //  FIX UTAMA: Jangan parse harga di sini. Biarkan modal yang handle.
    const updateModalState = useCallback((item: any | null) => {
        if (item) {
            modalStateRef.current = {
                isEdit: true,
                initialData: {
                    id: item.id,
                    namaPerawatan: item.namaPerawatan || '',
                    categoryId: item.categoryId,
                    harga: item.harga, // KIRIM MENTAH: "15000.00"
                    durasiEstimasi: item.durasiEstimasi || 30,
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

    const actionHandlersRef = useRef({
        onEdit: (item: any) => {
            setSelectedItemId(item?.id || null);
            updateModalState(item);
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
        },
        onActivate: (item: any) => {
            setSelectedItemId(item?.id || null);
            setActionType('activate');
            confirmModal.open();
        },
        onDeactivate: (item: any) => {
            setSelectedItemId(item?.id || null);
            setActionType('deactivate');
            confirmModal.open();
        }
    });

    const filteredData = useMemo(() => {
        if (!treatmentList.length) return [];

        const query = searchQuery.toLowerCase();
        return treatmentList.filter((item: any) =>
            (item.namaPerawatan || '').toLowerCase().includes(query) ||
            (item.kodePerawatan || '').toLowerCase().includes(query)
        );
    }, [treatmentList, searchQuery]);

    const handleCreate = useCallback(() => {
        setSelectedItemId(null);
        updateModalState(null);
        formModal.open();
    }, [formModal, updateModalState]);

    const handleConfirmAction = useCallback(async () => {
        if (!selectedItemId) return;

        try {
            switch (actionType) {
                case 'delete':
                    await deleteTreatment.mutateAsync({ id: Number(selectedItemId) });
                    toast.showError('Layanan berhasil dihapus');
                    break;
                case 'restore':
                    await restoreTreatment.mutateAsync({ id: Number(selectedItemId) });
                    toast.showInfo('Layanan berhasil dipulihkan');
                    break;
                case 'activate':
                    await activateTreatment.mutateAsync({ id: Number(selectedItemId) });
                    toast.showSuccess('Layanan berhasil diaktifkan');
                    break;
                case 'deactivate':
                    await deactivateTreatment.mutateAsync({ id: Number(selectedItemId) });
                    toast.showWarning('Layanan berhasil dinonaktifkan');
                    break;
            }

            confirmModal.close();
            setSelectedItemId(null);
            queryClient.invalidateQueries({ queryKey: ['/treatments'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
            toast.showError(`Gagal ${getActionLabel(actionType).toLowerCase()}: ${errorMessage}`);
        }
    }, [selectedItemId, actionType, deleteTreatment, restoreTreatment, activateTreatment, deactivateTreatment, toast, confirmModal, queryClient]);

    const handleFormSuccess = useCallback(() => {
        formModal.close();
        setSelectedItemId(null);
        queryClient.invalidateQueries({ queryKey: ['/treatments'] });
    }, [formModal, queryClient]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const getActionLabel = useCallback((action: ActionType) => {
        const labels: Record<ActionType, string> = {
            delete: 'Hapus',
            restore: 'Pulihkan',
            activate: 'Aktifkan',
            deactivate: 'Nonaktifkan'
        };
        return labels[action];
    }, []);

    const columns = useMemo(() =>
        getTreatmentColumns(actionHandlersRef.current),
        []);

    const isActionLoading =
        deleteTreatment.isPending ||
        restoreTreatment.isPending ||
        activateTreatment.isPending ||
        deactivateTreatment.isPending;

    const getModalInitialData = useCallback(() => {
        return modalStateRef.current.initialData;
    }, []);

    const confirmMessage = useMemo(() => {
        const name = selectedItem?.namaPerawatan || '';

        switch (actionType) {
            case 'delete':
                return (
                    <div>
                        <p>Yakin ingin menghapus layanan <strong>"{name}"</strong>?</p>
                        <p className="mt-2 text-sm text-gray-600">
                            Layanan yang dihapus dapat dipulihkan kembali (Soft Delete).
                        </p>
                    </div>
                );
            case 'restore':
                return (
                    <div>
                        <p>Yakin ingin memulihkan layanan <strong>"{name}"</strong>?</p>
                    </div>
                );
            case 'activate':
                return (
                    <div>
                        <p>Yakin ingin mengaktifkan layanan <strong>"{name}"</strong>?</p>
                    </div>
                );
            case 'deactivate':
                return (
                    <div>
                        <p>Yakin ingin menonaktifkan layanan <strong>"{name}"</strong>?</p>
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
                initialData={getModalInitialData()}
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