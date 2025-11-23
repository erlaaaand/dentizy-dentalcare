'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, Download, RefreshCw } from 'lucide-react';

// Core & Services
import { useGetPatients, useDeletePatient } from '@/core/services/api';
import { useConfirm } from '@/core/hooks/ui/useConfirm';
import { useToast } from '@/core/hooks/ui/useToast';
import { formatDate } from '@/core';
import { useDebounce } from '@/core/hooks/ui/useDebounce'; // Menggunakan debounce untuk search

// UI Components
import {
    PageContainer,
    PageHeader,
    DataTable,
    Button,
    IconButton,
    StatusBadge,
    Input,
    EmptyPatientsState,
    SkeletonTable,
    Select,
    ButtonGroup,
    Badge
} from '@/components';

export default function PatientsPage() {
    const router = useRouter();
    const { confirm } = useConfirm(); // Destructure confirm dari hook
    const { showSuccess, showError } = useToast();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('');

    // Debounce search agar tidak hit API setiap ketik
    const debouncedSearch = useDebounce(search, 500);

    const { data: patientsResponse, isLoading, refetch } = useGetPatients({
        page,
        limit,
        search: debouncedSearch || undefined, // Kirim undefined jika string kosong
        jenis_kelamin: (genderFilter as any) || undefined, // Casting untuk memuaskan tipe
    });

    // Normalisasi response data
    const patientsList = Array.isArray(patientsResponse)
        ? patientsResponse
        : (patientsResponse as any)?.data || [];

    const meta = (patientsResponse as any)?.meta || (patientsResponse as any)?.pagination || {
        total: patientsList.length,
        totalPages: 1,
        page: 1,
        limit: 10
    };

    const deleteMutation = useDeletePatient();

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleGenderFilter = (value: string) => {
        setGenderFilter(value);
        setPage(1);
    };

    const handleDelete = async (id: number, name: string) => {
        const isConfirmed = await confirm({
            title: 'Hapus Data Pasien',
            message: `Apakah Anda yakin ingin menghapus data pasien "${name}"? Data yang dihapus tidak dapat dikembalikan.`,
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger',
        });

        if (isConfirmed) {
            try {
                await deleteMutation.mutateAsync({ id });
                showSuccess('Data pasien berhasil dihapus');
                refetch();
            } catch (error: any) {
                showError(error?.message || 'Gagal menghapus data pasien');
            }
        }
    };

    const columns = [
        {
            header: 'No. RM',
            accessorKey: 'nomor_rekam_medis',
            cell: (info: any) => (
                <span className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            header: 'Nama Pasien',
            accessorKey: 'nama_lengkap',
            cell: (info: any) => (
                <div className="font-medium text-gray-900">{info.getValue()}</div>
            ),
        },
        {
            header: 'Jenis Kelamin',
            accessorKey: 'jenis_kelamin',
            cell: (info: any) => {
                const val = info.getValue();
                return (
                    <Badge
                        variant={val === 'L' ? 'info' : 'success'}
                    >
                        {val === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </Badge>
                );
            },
        },
        {
            header: 'No. Telepon',
            accessorKey: 'no_hp',
            cell: (info: any) => info.getValue() || '-',
        },
        {
            header: 'Tanggal Lahir',
            accessorKey: 'tanggal_lahir',
            cell: (info: any) => formatDate(info.getValue()),
        },
        {
            id: 'actions',
            header: 'Aksi',
            align: 'right',
            cell: (info: any) => {
                const patient = info.row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => router.push(`/patients/${patient.id}`)}
                            title="Lihat Detail"
                            aria-label='Lihat Detail'
                        />
                        <IconButton
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600 hover:bg-yellow-50"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => router.push(`/patients/${patient.id}/edit`)}
                            title="Edit"
                            aria-label="Edit"
                        />
                        <IconButton
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDelete(patient.id, patient.nama_lengkap)}
                            title="Hapus"
                            aria-label="Hapus"
                        />
                    </div>
                );
            },
        },
    ];

    const paginationProps = {
        currentPage: page,
        totalPages: meta.totalPages || 1,
        totalItems: meta.total || 0,
        itemsPerPage: limit,
    };

    return (
        <PageContainer>
            <PageHeader
                title="Kelola Pasien"
                description="Manajemen data pasien dan rekam medis"
                actions={
                    <ButtonGroup>
                        <Button
                            variant="outline"
                            icon={<Download className="w-4 h-4" />}
                            iconPosition="left"
                            onClick={() => showSuccess('Fitur export akan segera tersedia')}
                        >
                            Export
                        </Button>
                        <Button
                            icon={<Plus className="w-4 h-4" />}
                            iconPosition="left"
                            onClick={() => router.push('/patients/new')}
                        >
                            Tambah Pasien
                        </Button>
                    </ButtonGroup>
                }
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari nama, No RM, atau No HP..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={genderFilter}
                                onChange={(val) => handleGenderFilter(val)}
                                options={[
                                    { value: '', label: 'Semua Gender' },
                                    { value: 'L', label: 'Laki-laki' },
                                    { value: 'P', label: 'Perempuan' },
                                ]}
                            />
                        </div>
                        <IconButton
                            variant="outline"
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={() => refetch()}
                            title="Refresh Data"
                            aria-label="Refresh Data"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <SkeletonTable rows={5} cols={6} />
                    ) : !patientsList || patientsList.length === 0 ? (
                        <EmptyPatientsState
                            onAddPatient={() => router.push('/patients/new')}
                        />
                    ) : (
                        <DataTable
                            data={patientsList}
                            columns={columns as any}
                            pagination={{
                                currentPage: paginationProps.currentPage,
                                totalPages: paginationProps.totalPages,
                                totalItems: paginationProps.totalItems,
                                itemsPerPage: limit,
                            }}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>
        </PageContainer>
    );
}