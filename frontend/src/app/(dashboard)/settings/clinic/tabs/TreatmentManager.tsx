'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, Stethoscope } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Badge } from '@/components/ui/data-display/badge';
import { SearchInput } from '@/components';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import TreatmentModal from '../components/TreatmentModal';

import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import { useTreatments, useDeleteTreatment } from '@/core/services/api/treatments.api';
import { formatCurrency } from '@/core/utils/date/format.utils';

export default function TreatmentManager() {
    const toast = useToast();
    const queryClient = useQueryClient();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Hooks
    const { data: treatments, isLoading } = useTreatments();
    const deleteTreatment = useDeleteTreatment();

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
            await deleteTreatment.mutateAsync(selectedItem.id);
            toast.showSuccess('Layanan berhasil dihapus');
            deleteModal.close();
            queryClient.invalidateQueries({ queryKey: ['treatments'] });
        } catch (error) {
            toast.showError('Gagal menghapus layanan');
        }
    };

    const handleFormSuccess = () => {
        formModal.close();
        queryClient.invalidateQueries({ queryKey: ['treatments'] });
    };

    // Filter Data
    const filteredData = (treatments?.data || []).filter((item: any) =>
        item.namaPerawatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kodePerawatan.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            header: 'Kode',
            accessorKey: 'kodePerawatan',
            cell: (info: any) => <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>
        },
        {
            header: 'Nama Layanan',
            accessorKey: 'namaPerawatan',
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                        <Stethoscope className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-900">{info.getValue()}</span>
                </div>
            )
        },
        {
            header: 'Kategori',
            accessorKey: 'category.namaKategori',
            cell: (info: any) => <Badge variant="outline">{info.getValue() || 'Umum'}</Badge>
        },
        {
            header: 'Harga',
            accessorKey: 'harga',
            cell: (info: any) => (
                <span className="font-semibold text-green-700">
                    {formatCurrency(info.getValue())}
                </span>
            )
        },
        {
            header: 'Durasi',
            accessorKey: 'durasiEstimasi',
            cell: (info: any) => <span className="text-sm text-gray-500">{info.getValue()} menit</span>
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
                            <CardTitle>Daftar Harga & Layanan</CardTitle>
                            <CardDescription>Total {filteredData.length} layanan tersedia</CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64">
                                <SearchInput
                                    placeholder="Cari layanan..."
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                />
                            </div>
                            <Button onClick={handleCreate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Layanan
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable data={filteredData} columns={columns} isLoading={isLoading} />
                </CardBody>
            </Card>

            {/* Modal Form (Create/Edit) */}
            <TreatmentModal
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
                title="Hapus Layanan"
                message={`Yakin ingin menghapus layanan "${selectedItem?.namaPerawatan}"?`}
                variant="danger"
                confirmText="Hapus"
                isLoading={deleteTreatment.isPending}
            />
        </>
    );
}