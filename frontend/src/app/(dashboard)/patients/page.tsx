'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, Search, Filter, Download, RefreshCw } from 'lucide-react';

// Core & Services
import { useGetPatients, useDeletePatient } from '@/core/services/api';
import { useConfirm } from '@/core/hooks/ui/useConfirm';
import { useToast } from '@/core/hooks/ui/useToast';
import { formatDate } from '@/core';

// UI Components
import {
    PageContainer,
    PageHeader,
    DataTable,
    Button,
    IconButton,
    StatusBadge,
    Input,
    Card,
    CardBody,
    EmptyPatientsState,
    SkeletonTable,
    Select,
    ButtonGroup
} from '@/components';

export default function PatientsPage() {
    const router = useRouter();
    const confirm = useConfirm();
    const { showSuccess, showError } = useToast();

    // State Management
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('');

    // API Hooks
    const { data: patientsData, isLoading, refetch } = useGetPatients({
        page,
        limit,
        search: search || undefined,
        gender: genderFilter || undefined,
    });

    const deleteMutation = useDeletePatient();

    // Handlers
    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleGenderFilter = (value: string) => {
        setGenderFilter(value);
        setPage(1);
    };

    const handleDelete = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: 'Hapus Data Pasien',
            message: `Apakah Anda yakin ingin menghapus data pasien "${name}"? Data yang dihapus tidak dapat dikembalikan.`,
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger',
        });

        if (confirmed) {
            try {
                await deleteMutation.mutateAsync({ id });
                showSuccess('Data pasien berhasil dihapus');
                refetch();
            } catch (error: any) {
                showError(error?.message || 'Gagal menghapus data pasien');
            }
        }
    };

    const handleExport = () => {
        showSuccess('Fitur export akan segera tersedia');
    };

    // Table Columns
    const columns = [
        {
            header: 'No. RM',
            accessorKey: 'medicalRecordNumber',
            sortable: true,
            cell: (info: any) => (
                <span className="font-mono font-medium text-primary-600">
                    {info.getValue() || '-'}
                </span>
            ),
        },
        {
            header: 'Nama Pasien',
            accessorKey: 'name',
            sortable: true,
            cell: (info: any) => (
                <div className="font-medium text-gray-900">{info.getValue()}</div>
            ),
        },
        {
            header: 'Jenis Kelamin',
            accessorKey: 'gender',
            cell: (info: any) => {
                const val = info.getValue();
                return (
                    <StatusBadge
                        variant={val === 'LAKI_LAKI' ? 'info' : 'default'}
                        label={val === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    />
                );
            },
        },
        {
            header: 'No. Telepon',
            accessorKey: 'phoneNumber',
            cell: (info: any) => info.getValue() || '-',
        },
        {
            header: 'Tanggal Lahir',
            accessorKey: 'birthDate',
            sortable: true,
            cell: (info: any) => formatDate(info.getValue()),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: (info: any) => {
                const patient = info.row.original;
                return (
                    <ButtonGroup>
                        <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => router.push(`/patients/${patient.id}`)}
                            title="Lihat Detail"
                        />
                        <IconButton
                            variant="ghost"
                            size="sm"
                            color="warning"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => router.push(`/patients/${patient.id}/edit`)}
                            title="Edit"
                        />
                        <IconButton
                            variant="ghost"
                            size="sm"
                            color="danger"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDelete(patient.id, patient.name)}
                            title="Hapus"
                        />
                    </ButtonGroup>
                );
            },
        },
    ];

    const pagination = patientsData?.meta ? {
        currentPage: patientsData.meta.page,
        totalPages: patientsData.meta.totalPages,
        totalItems: patientsData.meta.total,
        itemsPerPage: patientsData.meta.limit,
    } : undefined;

    return (
        <PageContainer>
            <PageHeader
                title="Kelola Pasien"
                description="Manajemen data pasien, rekam medis, dan riwayat kunjungan"
                breadcrumbs={[
                    { children: 'Dashboard', href: '/dashboard' },
                    { children: 'Pasien', isCurrent: true },
                ]}
                actions={
                    <ButtonGroup>
                        <Button
                            variant="outline"
                            startIcon={<Download className="w-4 h-4" />}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                        <Button
                            startIcon={<Plus className="w-4 h-4" />}
                            onClick={() => router.push('/patients/new')}
                        >
                            Tambah Pasien
                        </Button>
                    </ButtonGroup>
                }
            />

            <Card>
                <CardBody className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Cari nama, No RM, atau No HP..."
                                startIcon={<Search className="w-4 h-4 text-gray-400" />}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={genderFilter}
                                onChange={(e) => handleGenderFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'Semua Gender' },
                                    { value: 'LAKI_LAKI', label: 'Laki-laki' },
                                    { value: 'PEREMPUAN', label: 'Perempuan' },
                                ]}
                            />
                        </div>
                        <IconButton
                            variant="outline"
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={() => refetch()}
                            title="Refresh Data"
                        />
                    </div>

                    {/* Table Content */}
                    {isLoading ? (
                        <SkeletonTable rows={5} columns={6} />
                    ) : !patientsData?.data || patientsData.data.length === 0 ? (
                        <EmptyPatientsState
                            onAddPatient={() => router.push('/patients/new')}
                        />
                    ) : (
                        <DataTable
                            data={patientsData.data}
                            columns={columns}
                            pagination={pagination}
                            onPageChange={setPage}
                            onLimitChange={setLimit}
                            isLoading={isLoading}
                        />
                    )}
                </CardBody>
            </Card>
        </PageContainer>
    );
}