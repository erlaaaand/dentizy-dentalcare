'use client';

import { useState, useMemo } from 'react';
import { Edit, Trash2, Eye, RefreshCw, UserPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import SearchInput from '@/components/ui/forms/search-input';
import { ConfirmDialog } from '@/components/ui/feedback/confirm-dialog';
import { Badge } from '@/components/ui/data-display/badge';

// Modals
import PatientFormModal from '../components/PatientFormModal';
import PatientDetailModal from '../components/PatientDetailModal';

// Hooks & Services
import { useModal, useToast, useAuth } from '@/core';
import { useGetPatients, useDeletePatient } from '@/core/services/api/patient.api'; // Sesuaikan path ini jika pakai generated hook lain (misal usePatientsControllerFindAll)

interface PatientListProps {
    scope: 'all' | 'me'; // 'all' = Staf/Head, 'me' = Dokter
    canManage: boolean;  // True = bisa create/edit/delete
}

export default function PatientList({ scope, canManage }: PatientListProps) {
    const { user } = useAuth();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Modals
    const formModal = useModal();
    const detailModal = useModal();
    const confirmModal = useModal();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [queryParams, setQueryParams] = useState({ page: 1, limit: 10 });

    // --- LOGIC FETCHING ---
    const filterParams = useMemo(() => {
        const params: any = {
            page: queryParams.page,
            limit: queryParams.limit,
            search: searchQuery
        };

        // [LOGIC FILTER] 
        // Backend harus support filter by 'doctor_id' di endpoint findAll
        // Jika scope = 'me', kita kirim ID dokter yang sedang login
        if (scope === 'me' && user?.id) {
            params.doctor_id = user.id;
        }
        return params;
    }, [queryParams, searchQuery, scope, user]);

    // Gunakan generated hook (sesuaikan namanya jika beda, misal usePatientsControllerFindAll)
    const { data: response, isLoading, refetch } = useGetPatients(filterParams);
    const deleteMutation = useDeletePatient();

    const patientList = useMemo(() => {
        return Array.isArray(response) ? response : (response as any)?.data || [];
    }, [response]);

    // --- HANDLERS ---
    const handleCreate = () => {
        setSelectedPatient(null);
        formModal.open();
    };

    const handleEdit = (patient: any) => {
        setSelectedPatient(patient);
        formModal.open();
    };

    const handleDetail = (patient: any) => {
        setSelectedPatient(patient);
        detailModal.open();
    };

    const handleDelete = (patient: any) => {
        setSelectedPatient(patient);
        confirmModal.open();
    };

    const confirmDelete = async () => {
        if (!selectedPatient) return;
        try {
            await deleteMutation.mutateAsync({ id: selectedPatient.id });
            toast.showSuccess('Data pasien dihapus');
            confirmModal.close();
            refetch();
        } catch (error: any) {
            toast.showError('Gagal menghapus pasien');
        }
    };

    // --- COLUMNS ---
    const columns = useMemo(() => [
        {
            header: 'No. RM',
            accessorKey: 'nomor_rekam_medis',
            cell: (info: any) => (
                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">
                    {info.getValue()}
                </span>
            )
        },
        {
            header: 'Nama Pasien',
            accessorKey: 'nama_lengkap',
            cell: (info: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{info.getValue()}</span>
                    <span className="text-xs text-gray-500">NIK: {info.row.original.nik || '-'}</span>
                </div>
            )
        },
        {
            header: 'Gender',
            accessorKey: 'jenis_kelamin',
            cell: (info: any) => (
                <Badge variant={info.getValue() === 'L' ? 'info' : 'success'} className="text-[10px]">
                    {info.getValue() === 'L' ? 'Laki-laki' : 'Perempuan'}
                </Badge>
            )
        },
        {
            header: 'Kontak',
            accessorKey: 'no_hp',
            cell: (info: any) => <span className="text-sm text-gray-600">{info.getValue() || '-'}</span>
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => (
                <div className="flex gap-1 justify-end">
                    {/* Semua Role bisa lihat Detail */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDetail(info.row.original)}
                        className="text-gray-500 hover:text-blue-600"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>

                    {/* Tombol Edit/Hapus hanya jika canManage = true (Staf/Head) */}
                    {canManage && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(info.row.original)}
                                className="text-gray-500 hover:text-orange-600"
                                title="Edit Data"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(info.row.original)}
                                className="text-gray-500 hover:text-red-600"
                                title="Hapus Data"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ], [canManage]);

    const title = scope === 'me' ? 'Pasien Saya' : 'Semua Data Pasien';
    const desc = scope === 'me'
        ? 'Daftar pasien yang memiliki riwayat medis dengan Anda.'
        : 'Manajemen basis data seluruh pasien klinik.';

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{desc}</CardDescription>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="w-full md:w-64">
                                <SearchInput
                                    placeholder="Cari Nama, NIK, atau No. RM..."
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                />
                            </div>

                            {/* Tombol Tambah hanya untuk Staff/Head */}
                            {canManage && (
                                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                                    <UserPlus className="w-4 h-4 mr-2" /> Pasien Baru
                                </Button>
                            )}

                            <Button variant="outline" onClick={() => refetch()} title="Refresh">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <DataTable
                        data={patientList}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada data pasien ditemukan."
                        pagination={{
                            currentPage: queryParams.page,
                            totalPages: (response as any)?.totalPages || 1,
                            totalItems: (response as any)?.total || 0,
                            itemsPerPage: queryParams.limit,
                            // [FIX] Explicit type number untuk parameter p
                            onPageChange: (p: number) => setQueryParams(prev => ({ ...prev, page: p }))
                        } as any}
                    />
                </CardBody>
            </Card>

            {/* Modals */}
            {canManage && (
                <PatientFormModal
                    isOpen={formModal.isOpen}
                    onClose={formModal.close}
                    initialData={selectedPatient}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['/patients'] });
                    }}
                />
            )}

            <PatientDetailModal
                isOpen={detailModal.isOpen}
                onClose={detailModal.close}
                data={selectedPatient}
            />

            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.close}
                onConfirm={confirmDelete}
                title="Hapus Pasien?"
                message={`Anda akan menghapus data pasien: ${selectedPatient?.nama_lengkap}. Data yang dihapus tidak dapat dikembalikan.`}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </>
    );
}