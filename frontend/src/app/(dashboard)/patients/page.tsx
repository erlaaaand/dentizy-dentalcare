'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';

// Core & Services
import { PatientService } from '@/core/services/api';
import { useTable } from '@/core/hooks/data/useTable';
import { useConfirm } from '@/core/hooks/ui/useConfirm';
import { useToast } from '@/core/hooks/ui/useToast';
import { formatDate } from '@/core';

// UI Components
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/ui/layout/page-header/PageHeader';
import { DataTable } from '@/components';
import { Button } from '@/components';
import { IconButton } from '@/components/ui/button/IconButton';
import { StatusBadge } from '@/components/ui/data-display/badge/StatusBadge';
import { Input } from '@/components/ui/forms/input/Input';
import { Card, CardBody } from '@/components/ui/data-display/card';
import { EmptyState } from '@/components';
import { SkeletonTable } from '@/components/ui/data-display/skeleton/SkeletonTable';

export default function PatientsPage() {
    const router = useRouter();
    const confirm = useConfirm();
    const toast = useToast();

    // Hook Table untuk handle pagination, sort, dan fetch data
    const {
        data,
        isLoading,
        pagination,
        handleSearch,
        handlePageChange,
        handleSort,
        handleLimitChange,
        refresh
    } = useTable({
        fetcher: PatientService.findAll,
        id: 'patients-table',
    });

    // Handle Delete
    const handleDelete = async (id: string, name: string) => {
        confirm.open({
            title: 'Hapus Pasien',
            message: `Apakah Anda yakin ingin menghapus data pasien ${name}? Data yang dihapus tidak dapat dikembalikan.`,
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await PatientService.remove(id);
                    toast.success('Data pasien berhasil dihapus');
                    refresh();
                } catch (error) {
                    toast.error('Gagal menghapus data pasien');
                }
            },
        });
    };

    // Definisi Kolom Tabel
    const columns = [
        {
            header: 'No. RM',
            accessorKey: 'medicalRecordNumber',
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
                        variant={val === 'LAKI_LAKI' ? 'blue' : 'pink'}
                        label={val === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    />
                );
            },
        },
        {
            header: 'No. Telepon',
            accessorKey: 'phoneNumber',
        },
        {
            header: 'Tanggal Lahir',
            accessorKey: 'birthDate',
            cell: (info: any) => formatDate(info.getValue()),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => router.push(`/patients/${info.row.original.id}`)}
                        title="Lihat Detail"
                    />
                    <IconButton
                        variant="ghost"
                        size="sm"
                        color="warning"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => router.push(`/patients/${info.row.original.id}/edit`)}
                        title="Edit"
                    />
                    <IconButton
                        variant="ghost"
                        size="sm"
                        color="danger"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(info.row.original.id, info.row.original.name)}
                        title="Hapus"
                    />
                </div>
            ),
        },
    ];

    return (
        <PageContainer title="Data Pasien">
            <PageHeader
                title="Kelola Pasien"
                subtitle="Manajemen data pasien, rekam medis, dan riwayat kunjungan."
                action={
                    <Button
                        startIcon={<Plus className="w-4 h-4" />}
                        onClick={() => router.push('/patients/new')}
                    >
                        Tambah Pasien
                    </Button>
                }
            />

            <Card>
                <CardBody className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex items-center gap-4">
                        <div className="w-full max-w-md relative">
                            <Input
                                placeholder="Cari nama, No RM, atau No HP..."
                                startIcon={<Search className="w-4 h-4 text-gray-400" />}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    {isLoading ? (
                        <SkeletonTable rows={5} columns={6} />
                    ) : data.length === 0 ? (
                        <EmptyState
                            title="Belum ada data pasien"
                            description="Mulailah dengan menambahkan pasien baru ke dalam sistem."
                            action={
                                <Button onClick={() => router.push('/patients/new')}>
                                    Tambah Pasien Baru
                                </Button>
                            }
                        />
                    ) : (
                        <DataTable
                            data={data}
                            columns={columns}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onSort={handleSort}
                            isLoading={isLoading}
                        />
                    )}
                </CardBody>
            </Card>
        </PageContainer>
    );
}